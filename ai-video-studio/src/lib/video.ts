import "server-only";
import { createFalClient } from "@fal-ai/client";
import { env } from "./env";

let client: ReturnType<typeof createFalClient> | undefined;
function fal() {
  client ??= createFalClient({ credentials: env().FAL_KEY });
  return client;
}

export type JobState = { state: "running" } | { state: "done"; url: string } | { state: "failed"; error: string };

/** Queue one text-to-video clip. Returns fal's request id. */
export async function submitClip(opts: {
  prompt: string;
  durationS: number;
  aspect: string;
  webhookUrl: string;
}): Promise<string> {
  const res = await fal().queue.submit(env().FAL_VIDEO_MODEL, {
    input: {
      prompt: opts.prompt,
      duration: `${opts.durationS}s`,
      aspect_ratio: opts.aspect,
      resolution: "1080p",
      generate_audio: true,
      negative_prompt:
        "text, captions, subtitles, watermark, logo, distorted faces, extra fingers, low quality, blurry, celebrity, real person",
      auto_fix: true,
      safety_tolerance: "2",
    },
    webhookUrl: opts.webhookUrl,
  });
  return res.request_id;
}

/** Queue concatenation of finished clips into one video. */
export async function submitMerge(urls: string[], webhookUrl: string): Promise<string> {
  const res = await fal().queue.submit(env().FAL_MERGE_MODEL, {
    input: { video_urls: urls },
    webhookUrl,
  });
  return res.request_id;
}

/**
 * Ask fal for the state of a request. We never trust the webhook body itself: the webhook only
 * tells us "something changed", and we read the real result through the authenticated API.
 */
export async function checkJob(endpoint: string, requestId: string): Promise<JobState> {
  const status = await fal().queue.status(endpoint, { requestId });
  if (status.status !== "COMPLETED") return { state: "running" };
  try {
    const result = await fal().queue.result(endpoint, { requestId });
    const url = (result.data as { video?: { url?: string } })?.video?.url;
    if (!url || !url.startsWith("https://")) return { state: "failed", error: "no video in result" };
    return { state: "done", url };
  } catch (err) {
    return { state: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
