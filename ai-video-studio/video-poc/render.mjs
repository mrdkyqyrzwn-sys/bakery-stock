// Renders ad.html to an MP4: open it in headless Chromium, step the timeline frame by frame,
// screenshot each frame, and pipe the frames into ffmpeg.
// Usage: node render.mjs <output.mp4>   (needs playwright-core, Chromium and ffmpeg)
import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const FPS = 30;
const out = process.argv[2] ?? "ad.mp4";
const page_url = pathToFileURL(path.join(import.meta.dirname, "ad.html")).toString();

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(page_url);
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.AD_DURATION);

const ffmpeg = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart",
  out,
], { stdio: ["pipe", "inherit", "inherit"] });

const frames = Math.round(duration * FPS);
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.renderFrame(t), i / FPS);
  const png = await page.screenshot({ type: "png" });
  if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
}
ffmpeg.stdin.end();
await new Promise((r) => ffmpeg.on("close", r));
await browser.close();
console.log(`wrote ${out}: ${frames} frames, ${duration}s`);
