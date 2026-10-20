/**
 * Production worker: a long-running process (not serverless) that turns paid orders into
 * finished commercials, like a small production company:
 *
 *   planning  - Claude writes the script and picks a photo for every scene
 *   media     - narration (ElevenLabs), original music (ElevenLabs), missing photos (image model)
 *   writing   - Claude edits the commercial in code over the photos, synced to the narration
 *   reviewing - automated QC: technical checks + Claude reviews frames and fixes problems
 *   rendering - frames -> H.264, narration + ducked music mixed and loudness-normalized
 *
 * Every finished step is saved, so a crash or retry resumes instead of paying twice.
 * Run: npm run worker   (needs Chromium + ffmpeg; see Dockerfile)
 */
import { createReadStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Analysis } from "../src/lib/ai";
import { type ProjectRow, sql } from "../src/lib/db";
import { env } from "../src/lib/env";
import { failAndRefund } from "../src/lib/fulfillment";
import { safeFetchImageDataUri } from "../src/lib/safe-fetch";
import type { SiteData } from "../src/lib/scrape";
import { storeFile } from "../src/lib/storage";
import { getStyle } from "../src/lib/styles";
import { type Plan, planVideo, reviewAnimation, reviseAnimation, shortenNarration, writeAnimation } from "./director";
import { composeMusic, generateImage, narrate } from "./media";
import { type Assets, inspect, renderVideo, thumbnails } from "./renderer";
import { buildTimeline, fitRatio, narrationText, VOICE_OFFSET } from "./timeline";

const POLL_MS = 5_000;
const LEASE_MINUTES = 30;
const MAX_FIX_ROUNDS = 3;
const MAX_REVIEW_ROUNDS = 2;
const MAX_JOB_ERRORS = 3;
const IMAGE_PARALLELISM = 3;

/** Saved after the media step so a retry does not regenerate (and re-pay for) anything. */
interface Media {
  imageUrls: string[];
  voiceUrl: string;
  musicUrl: string;
  timeline: Assets["timeline"];
}

class RefusedContent extends Error {}

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

async function fetchImage(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    return await safeFetchImageDataUri(url);
  } catch {
    return null;
  }
}

function dataUriBytes(uri: string): Buffer {
  return Buffer.from(uri.split(",")[1], "base64");
}

async function inParallel<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

function toScript(plan: Plan) {
  return plan.scenes.map((s, i) => ({ narration: s.narration, onScreenText: s.on_screen_text, direction: s.direction, image: i }));
}

// ------------------------------------------------------------------ steps

async function makePlan(project: ProjectRow, uploads: string[], siteImage: string | null): Promise<Plan> {
  if (project.plan) return project.plan as Plan;
  await setStage(project.id, "planning");
  const plan = await planVideo({
    analysis: { brief: project.brief, concepts: project.concepts } as Pick<Analysis, "brief" | "concepts">,
    style: getStyle(project.style!)!,
    durationS: project.duration_s!,
    uploadThumbs: await thumbnails(uploads),
    siteThumb: siteImage ? (await thumbnails([siteImage]))[0] : null,
  });
  if (!plan.allowed) throw new RefusedContent(plan.refusal_reason_he || "התמונות אינן עומדות במדיניות התוכן");
  await sql()`update projects set plan = ${sql().json(JSON.parse(JSON.stringify(plan)))} where id = ${project.id}`;
  return plan;
}

async function makeMedia(
  project: ProjectRow,
  plan: Plan,
  uploads: { url: string; data: string }[],
  siteImage: string | null,
): Promise<Media> {
  if (project.media) return project.media as Media;
  await setStage(project.id, "media");
  const durationS = project.duration_s!;
  const lang = ((project.brief as Analysis["brief"]).ad_language || "he").slice(0, 2);
  const voiceId = plan.voice === "male" ? env().ELEVENLABS_VOICE_MALE : env().ELEVENLABS_VOICE_FEMALE;

  // Music is composed to the exact length while the narration and photos are made.
  const musicPromise = composeMusic(plan.music_prompt, durationS);

  // Narration: record, and if it runs long, speed it up a little or tighten the script.
  let script = plan;
  let voice = await narrate({ text: narrationText(toScript(script)), voiceId, languageCode: lang });
  for (let attempt = 0; attempt < 2 && fitRatio(voice.duration, durationS) > 1; attempt++) {
    const ratio = fitRatio(voice.duration, durationS);
    if (ratio <= 1.15) {
      const speed = Math.min(1.2, ratio * 1.03);
      voice = await narrate({ text: narrationText(toScript(script)), voiceId, languageCode: lang, speed });
    } else {
      script = await shortenNarration(script, 0.95 / ratio);
      voice = await narrate({ text: narrationText(toScript(script)), voiceId, languageCode: lang });
    }
  }
  if (fitRatio(voice.duration, durationS) > 1.1) throw new Error("narration does not fit the video length");

  // One photo per scene: the customer's upload, the site's image, or a generated one.
  const imageUrls = await inParallel(script.scenes, IMAGE_PARALLELISM, async (scene) => {
    if (scene.image_source === "upload" && uploads[scene.upload_index]) return uploads[scene.upload_index].url;
    if (scene.image_source === "site" && siteImage) {
      const type = siteImage.slice(5, siteImage.indexOf(";"));
      return storeFile(`media/${project.id}/scene.${type.split("/")[1].replace("svg+xml", "svg")}`, dataUriBytes(siteImage), type);
    }
    const bytes = await generateImage(scene.image_prompt, project.aspect!);
    return storeFile(`media/${project.id}/scene.jpg`, bytes, "image/jpeg");
  });

  const [voiceUrl, musicUrl] = await Promise.all([
    storeFile(`media/${project.id}/voice.mp3`, voice.audio, "audio/mpeg"),
    musicPromise.then((m) => storeFile(`media/${project.id}/music.mp3`, m, "audio/mpeg")),
  ]);

  const timeline = buildTimeline(toScript(script), voice.charStarts, voice.words, durationS);
  const media: Media = { imageUrls, voiceUrl, musicUrl, timeline };
  await sql()`update projects set media = ${sql().json(JSON.parse(JSON.stringify(media)))} where id = ${project.id}`;
  return media;
}

/** Write the edit, then loop: technical check -> fix, visual QC -> fix. */
async function makeEdit(project: ProjectRow, assets: Assets): Promise<string> {
  if (project.animation_html) return project.animation_html;
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
      if (round === MAX_FIX_ROUNDS + MAX_REVIEW_ROUNDS - 1) throw new Error(`code still broken: ${check.problems[0]}`);
      await setStage(project.id, "writing");
      html = await reviseAnimation({ html, problems: check.problems, snapshots: check.snapshots, durationS, aspect });
      continue;
    }
    if (reviews >= MAX_REVIEW_ROUNDS) break;
    await setStage(project.id, "reviewing");
    const review = await reviewAnimation({ snapshots: check.snapshots, style });
    reviews++;
    if (review.approved || review.problems.length === 0) break;
    html = await reviseAnimation({ html, problems: review.problems, snapshots: check.snapshots, durationS, aspect });
  }
  await sql()`update projects set animation_html = ${html}, status = 'rendering' where id = ${project.id}`;
  return html;
}

async function download(url: string, file: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function produce(project: ProjectRow) {
  if (!env().BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required to store videos");
  const site = (project.site_data ?? {}) as Partial<SiteData>;
  const [logo, siteImage, ...uploadImages] = await Promise.all([
    fetchImage(site.logo),
    fetchImage(site.ogImage),
    ...project.uploads.map((u) => fetchImage(u.url)),
  ]);
  // A photo that failed to load is simply not offered; indexes refer to this filtered list.
  const uploads = project.uploads.flatMap((u, i) => (uploadImages[i] ? [{ url: u.url, data: uploadImages[i] }] : []));

  const plan = await makePlan(project, uploads.map((u) => u.data), siteImage);
  const media = await makeMedia(project, plan, uploads, siteImage);
  const images = await Promise.all(media.imageUrls.map(fetchImage));
  if (images.some((i) => !i)) throw new Error("could not load scene images");
  const assets: Assets = { logo, images: images as string[], timeline: media.timeline };

  const html = await makeEdit(project, assets);

  await setStage(project.id, "rendering", 0);
  const dir = await mkdtemp(path.join(tmpdir(), "video-"));
  try {
    const voiceFile = path.join(dir, "voice.mp3");
    const musicFile = path.join(dir, "music.mp3");
    await Promise.all([download(media.voiceUrl, voiceFile), download(media.musicUrl, musicFile)]);
    const outFile = path.join(dir, "ad.mp4");
    await renderVideo({
      html,
      assets,
      aspect: project.aspect!,
      durationS: project.duration_s!,
      outFile,
      voiceFile,
      voiceOffset: VOICE_OFFSET,
      musicFile,
      onProgress: (pct) => setStage(project.id, "rendering", pct),
    });
    const url = await storeFile(`videos/${project.id}.mp4`, createReadStream(outFile), "video/mp4");
    await sql()`
      update projects set status = 'done', stage = null, render_progress = 100, video_url = ${url},
        lease_until = null, updated_at = now()
      where id = ${project.id}`;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ------------------------------------------------------------------ loop

async function main() {
  console.log("production worker started");
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
      if (err instanceof RefusedContent) {
        await failAndRefund(project, `content refused: ${err.message}`);
        continue;
      }
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
