/**
 * Render worker: a long-running process (not serverless) that picks up paid projects,
 * has Claude write and polish the animation code, renders it to MP4, and stores the result.
 *
 * Run: npm run worker   (needs Chromium + ffmpeg; see Dockerfile)
 */
import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { put } from "@vercel/blob";
import type { Analysis } from "../src/lib/ai";
import { type ProjectRow, sql } from "../src/lib/db";
import { env } from "../src/lib/env";
import { failAndRefund } from "../src/lib/fulfillment";
import { safeFetchImageDataUri } from "../src/lib/safe-fetch";
import type { SiteData } from "../src/lib/scrape";
import { getStyle } from "../src/lib/styles";
import { reviewAnimation, reviseAnimation, writeAnimation } from "./director";
import { type Assets, inspect, renderVideo } from "./renderer";

const POLL_MS = 5_000;
const LEASE_MINUTES = 20;
const MAX_FIX_ROUNDS = 3;
const MAX_REVIEW_ROUNDS = 2;
const MAX_JOB_ERRORS = 3;

let stopping = false;
process.on("SIGTERM", () => (stopping = true));
process.on("SIGINT", () => (stopping = true));

async function claimNext(): Promise<ProjectRow | null> {
  const [row] = await sql()<ProjectRow[]>`
    update projects set lease_until = now() + make_interval(mins => ${LEASE_MINUTES})
    where id = (
      select id from projects
      where status in ('paid', 'rendering') and (lease_until is null or lease_until < now())
      order by paid_at
      limit 1
      for update skip locked
    )
    returning *`;
  return row ?? null;
}

async function setStage(id: string, stage: ProjectRow["stage"], progress = 0) {
  await sql()`
    update projects set stage = ${stage}, render_progress = ${progress},
      lease_until = now() + make_interval(mins => ${LEASE_MINUTES}), updated_at = now()
    where id = ${id}`;
}

async function loadAssets(site: Partial<SiteData>): Promise<Assets> {
  const get = async (url: string | null | undefined) => {
    if (!url) return null;
    try {
      return await safeFetchImageDataUri(url);
    } catch {
      return null;
    }
  };
  const [logo, hero] = await Promise.all([get(site.logo), get(site.ogImage)]);
  return { logo, hero };
}

/** Write the code, then loop: technical check -> fix, visual review -> fix. */
async function direct(project: ProjectRow, assets: Assets): Promise<string> {
  const style = getStyle(project.style!)!;
  const analysis = { brief: project.brief, concepts: project.concepts } as Pick<Analysis, "brief" | "concepts">;
  const durationS = project.duration_s!;
  const aspect = project.aspect!;

  await setStage(project.id, "writing");
  let html = await writeAnimation({ analysis, style, durationS, aspect, assets, siteUrl: project.site_url });

  let reviews = 0;
  for (let round = 0; round < MAX_FIX_ROUNDS + MAX_REVIEW_ROUNDS; round++) {
    const check = await inspect(html, assets, aspect, durationS);
    if (check.problems.length > 0) {
      if (round >= MAX_FIX_ROUNDS + MAX_REVIEW_ROUNDS - 1) throw new Error(`code still broken: ${check.problems[0]}`);
      await setStage(project.id, "writing");
      html = await reviseAnimation({ html, problems: check.problems, snapshots: check.snapshots, durationS, aspect });
      continue;
    }
    if (reviews >= MAX_REVIEW_ROUNDS) break;
    await setStage(project.id, "reviewing");
    const concept = analysis.concepts.find((c) => c.style_id === style.id);
    const review = await reviewAnimation({ snapshots: check.snapshots, style, conceptTitle: concept?.title_he });
    reviews++;
    if (review.approved || review.problems.length === 0) break;
    html = await reviseAnimation({ html, problems: review.problems, snapshots: check.snapshots, durationS, aspect });
  }
  return html;
}

async function produce(project: ProjectRow) {
  const token = env().BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is required to store videos");
  const assets = await loadAssets((project.site_data ?? {}) as Partial<SiteData>);

  let html = project.animation_html;
  if (project.status === "paid" || !html) {
    html = await direct(project, assets);
    await sql()`update projects set animation_html = ${html}, status = 'rendering' where id = ${project.id}`;
  }

  await setStage(project.id, "rendering", 0);
  const dir = await mkdtemp(path.join(tmpdir(), "video-"));
  try {
    const outFile = path.join(dir, "ad.mp4");
    const music = process.env.MUSIC_DIR ? path.join(process.env.MUSIC_DIR, `${project.style}.mp3`) : null;
    await renderVideo({
      html,
      assets,
      aspect: project.aspect!,
      durationS: project.duration_s!,
      outFile,
      musicFile: music && existsSync(music) ? music : null,
      onProgress: (pct) => setStage(project.id, "rendering", pct),
    });
    const blob = await put(`videos/${project.id}.mp4`, createReadStream(outFile), {
      access: "public",
      addRandomSuffix: true,
      contentType: "video/mp4",
      multipart: true,
      token,
    });
    await sql()`
      update projects set status = 'done', stage = null, render_progress = 100, video_url = ${blob.url},
        lease_until = null, updated_at = now()
      where id = ${project.id}`;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function main() {
  console.log("render worker started");
  while (!stopping) {
    const project = await claimNext().catch((e) => {
      console.error("claim failed", e);
      return null;
    });
    if (!project) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }
    console.log("producing", project.id, project.style, `${project.duration_s}s`);
    try {
      await produce(project);
      console.log("done", project.id);
    } catch (err) {
      console.error("job failed", project.id, err);
      // Back off before retrying (5, 10 min...) so a short outage does not turn into a refund.
      const [row] = await sql()<{ error_count: number }[]>`
        update projects set error_count = error_count + 1,
          lease_until = now() + make_interval(mins => 5 * (error_count + 1))
        where id = ${project.id}
        returning error_count`;
      if (row.error_count >= MAX_JOB_ERRORS) await failAndRefund(project, String(err));
    }
  }
  await sql().end();
}

void main();
