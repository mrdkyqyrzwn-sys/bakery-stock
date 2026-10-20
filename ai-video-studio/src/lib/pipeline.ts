import "server-only";
import { put } from "@vercel/blob";
import { type Analysis, writeStoryboard } from "./ai";
import { type ClipRow, type ProjectRow, sql } from "./db";
import { env } from "./env";
import { refundTransaction } from "./paddle";
import { getStyle, planClips } from "./styles";
import { checkJob, submitClip, submitMerge } from "./video";

const MAX_CLIP_ATTEMPTS = 3;
const LEASE_SECONDS = 300;
const MAX_STEP_ERRORS = 5;

/**
 * Production runs as a resumable state machine instead of one long request, so it works on
 * serverless hosting: every call moves a project forward a step. It is triggered by the
 * Paddle webhook, fal webhooks, the status page polling, and a cron safety net. A short
 * database lease makes sure only one invocation works on a project at a time.
 */
export async function advance(projectId: string): Promise<void> {
  const db = sql();
  const [project] = await db<ProjectRow[]>`
    update projects set lease_until = now() + make_interval(secs => ${LEASE_SECONDS})
    where id = ${projectId}
      and status in ('paid', 'rendering', 'merging')
      and (lease_until is null or lease_until < now())
    returning *`;
  if (!project) return;

  try {
    if (project.status === "paid") await startProduction(project);
    else if (project.status === "rendering") await stepRendering(project);
    else if (project.status === "merging") await stepMerging(project);
  } catch (err) {
    // Transient errors (rate limits, timeouts) are retried on the next trigger; give up after a few.
    console.error("pipeline error", projectId, err);
    const [row] = await db<{ error_count: number }[]>`
      update projects set error_count = error_count + 1 where id = ${projectId} returning error_count`;
    if (row.error_count >= MAX_STEP_ERRORS) await fail(project, "production error");
  } finally {
    await db`update projects set lease_until = null, updated_at = now() where id = ${projectId}`;
  }
}

function falWebhookUrl(projectId: string): string {
  const url = new URL("/api/webhooks/fal", env().NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("project", projectId);
  return url.toString();
}

async function startProduction(project: ProjectRow) {
  const style = getStyle(project.style!)!;
  const durations = planClips(project.duration_s!);
  const analysis = { brief: project.brief, concepts: project.concepts } as Pick<Analysis, "brief" | "concepts">;
  const concept = analysis.concepts.find((c) => c.style_id === style.id);
  const storyboard = await writeStoryboard(analysis.brief, concept, style, durations, project.aspect!);

  const db = sql();
  await db.begin(async (tx) => {
    for (const [idx, shot] of storyboard.shots.entries()) {
      await tx`
        insert into clips (project_id, idx, duration_s, prompt)
        values (${project.id}, ${idx}, ${durations[idx]}, ${shot.prompt})
        on conflict (project_id, idx) do nothing`;
    }
    await tx`update projects set storyboard = ${tx.json(storyboard)}, status = 'rendering' where id = ${project.id}`;
  });
  await stepRendering({ ...project, status: "rendering" });
}

async function stepRendering(project: ProjectRow) {
  const db = sql();
  const clips = await db<ClipRow[]>`select * from clips where project_id = ${project.id} order by idx`;

  for (const clip of clips) {
    if (clip.status === "submitted" && clip.fal_request_id) {
      const state = await checkJob(env().FAL_VIDEO_MODEL, clip.fal_request_id);
      if (state.state === "done") {
        await db`update clips set status = 'done', url = ${state.url} where id = ${clip.id}`;
        clip.status = "done";
        clip.url = state.url;
      } else if (state.state === "failed") {
        console.warn("clip failed", clip.id, state.error);
        clip.status = "pending";
        await db`update clips set status = 'pending' where id = ${clip.id}`;
      }
    }
    if (clip.status === "pending" || clip.status === "failed") {
      if (clip.attempts >= MAX_CLIP_ATTEMPTS) {
        await fail(project, `clip ${clip.idx} failed ${clip.attempts} times`);
        return;
      }
      const requestId = await submitClip({
        prompt: clip.prompt,
        durationS: clip.duration_s,
        aspect: project.aspect!,
        webhookUrl: falWebhookUrl(project.id),
      });
      await db`
        update clips set status = 'submitted', fal_request_id = ${requestId}, attempts = attempts + 1
        where id = ${clip.id}`;
      clip.status = "submitted";
    }
  }

  if (clips.every((c) => c.status === "done")) {
    const mergeId = await submitMerge(
      clips.map((c) => c.url!),
      falWebhookUrl(project.id),
    );
    await db`update projects set status = 'merging', merge_request_id = ${mergeId} where id = ${project.id}`;
  }
}

async function stepMerging(project: ProjectRow) {
  const state = await checkJob(env().FAL_MERGE_MODEL, project.merge_request_id!);
  if (state.state === "running") return;
  if (state.state === "failed") {
    await fail(project, `merge failed: ${state.error}`);
    return;
  }
  const finalUrl = await persist(project.id, state.url);
  await sql()`update projects set status = 'done', video_url = ${finalUrl} where id = ${project.id}`;
}

/** Copy the finished file to our own storage so it does not expire with the provider's CDN. */
async function persist(projectId: string, sourceUrl: string): Promise<string> {
  if (!env().BLOB_READ_WRITE_TOKEN) return sourceUrl;
  const res = await fetch(sourceUrl);
  if (!res.ok || !res.body) throw new Error(`download failed ${res.status}`);
  const blob = await put(`videos/${projectId}.mp4`, res.body, {
    access: "public",
    addRandomSuffix: true,
    contentType: "video/mp4",
    token: env().BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

/** We could not deliver: mark failed and refund in full automatically. */
async function fail(project: ProjectRow, reason: string) {
  const db = sql();
  await db`update projects set status = 'failed', error = ${reason.slice(0, 500)} where id = ${project.id} and status not in ('done', 'refunded')`;
  if (!project.paddle_txn_id || !project.paid_at) return;
  try {
    await refundTransaction(project.paddle_txn_id, "Video could not be produced");
    await db`update projects set status = 'refunded' where id = ${project.id}`;
  } catch (err) {
    console.error("refund failed - handle manually", project.id, err);
  }
}
