/**
 * Turns animation code written by Claude into an MP4.
 *
 * The code is untrusted (it was written by a model that read a stranger's website), so it runs
 * only inside headless Chromium's sandbox with every network request blocked and a strict CSP.
 * It never runs in Node, never sees our environment, and cannot reach any server.
 *
 * Contract the code must follow (see reference-ad.html):
 *   window.AD_DURATION = <seconds>;
 *   window.renderFrame = (t) => { ...draw the frame for time t, synchronously... };
 * Everything on screen must be a pure function of t, so every frame can be rendered independently.
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { type Browser, type Page, chromium } from "playwright-core";

export const FPS = 30;
const FRAME_TIMEOUT_MS = 5_000;
const CONCURRENCY = Number(process.env.RENDER_CONCURRENCY ?? 4);

export interface Assets {
  logo: string | null;
  hero: string | null;
}

export function canvasSize(aspect: string): { width: number; height: number } {
  return aspect === "9:16" ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
}

let fontCss: string | undefined;
async function brandFontCss(): Promise<string> {
  if (fontCss) return fontCss;
  const dir = path.join(import.meta.dirname, "fonts");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".woff2")).sort();
  const faces: string[] = [];
  const families: string[] = [];
  for (const [i, f] of files.entries()) {
    const b64 = (await readFile(path.join(dir, f))).toString("base64");
    faces.push(`@font-face{font-family:Brand${i};src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:100 900;}`);
    families.push(`Brand${i}`);
  }
  fontCss = `${faces.join("")}:root{--brand-font:${families.join(",")},sans-serif;}`;
  return fontCss;
}

/** Wrap Claude's document with the security policy, fonts, assets and determinism guards. */
async function prepareHtml(html: string, assets: Assets): Promise<string> {
  const inject = `
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<style>${await brandFontCss()}
*,*::before,*::after{animation:none!important;transition:none!important;}</style>
<script>
window.ASSETS=${JSON.stringify(assets)};
(function(){let s=1234567;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();
</script>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + inject);
  return `<!doctype html><html><head>${inject}</head><body>${html}</body></html>`;
}

async function openPage(browser: Browser, html: string, assets: Assets, aspect: string) {
  const context = await browser.newContext({
    viewport: canvasSize(aspect),
    offline: true,
    javaScriptEnabled: true,
    acceptDownloads: false,
  });
  // Belt and braces next to offline + CSP: abort anything that tries to leave the page.
  await context.route("**/*", (route) => route.abort());
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`Uncaught: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text().slice(0, 300)}`);
  });
  page.on("dialog", (d) => void d.dismiss());
  await page.setContent(await prepareHtml(html, assets), { waitUntil: "load", timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  return { page, errors, close: () => context.close() };
}

async function drawFrame(page: Page, t: number) {
  await Promise.race([
    page.evaluate((time) => (window as unknown as { renderFrame: (t: number) => void }).renderFrame(time), t),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`renderFrame(${t}) took too long`)), FRAME_TIMEOUT_MS)),
  ]);
}

export interface Inspection {
  problems: string[];
  /** JPEG snapshots at evenly spaced times, for Claude's visual review. */
  snapshots: { t: number; jpeg: Buffer }[];
}

/** Load the code, check the contract, and take snapshots. Problems are fed back to Claude to fix. */
export async function inspect(html: string, assets: Assets, aspect: string, expectedDuration: number): Promise<Inspection> {
  const browser = await launch();
  try {
    const { page, errors, close } = await openPage(browser, html, assets, aspect);
    const problems: string[] = [];
    const info = await page.evaluate(() => {
      const w = window as unknown as { renderFrame?: unknown; AD_DURATION?: unknown };
      return { hasRender: typeof w.renderFrame === "function", duration: w.AD_DURATION };
    });
    if (!info.hasRender) problems.push("window.renderFrame is not defined as a function.");
    if (typeof info.duration !== "number" || Math.abs(info.duration - expectedDuration) > 1) {
      problems.push(`window.AD_DURATION must be the number ${expectedDuration}, got ${JSON.stringify(info.duration)}.`);
    }
    const snapshots: { t: number; jpeg: Buffer }[] = [];
    if (info.hasRender) {
      const count = Math.min(10, Math.max(6, Math.round(expectedDuration / 6)));
      for (let i = 0; i < count; i++) {
        const t = Math.round(((i + 0.5) / count) * expectedDuration * 10) / 10;
        try {
          await drawFrame(page, t);
        } catch (e) {
          problems.push(e instanceof Error ? e.message : String(e));
          break;
        }
        snapshots.push({ t, jpeg: await page.screenshot({ type: "jpeg", quality: 70, scale: "css" }) });
      }
    }
    problems.push(...new Set(errors));
    await close();
    return { problems, snapshots };
  } finally {
    await browser.close();
  }
}

/** Render every frame (in parallel pages) and encode an H.264 MP4. Optional music track is mixed in. */
export async function renderVideo(opts: {
  html: string;
  assets: Assets;
  aspect: string;
  durationS: number;
  outFile: string;
  musicFile?: string | null;
  onProgress?: (pct: number) => Promise<void> | void;
}): Promise<void> {
  const frames = Math.round(opts.durationS * FPS);
  const dir = await mkdtemp(path.join(tmpdir(), "render-"));
  const browser = await launch();
  try {
    let done = 0;
    let lastReported = -1;
    const workers = Array.from({ length: CONCURRENCY }, async (_, w) => {
      const { page, errors, close } = await openPage(browser, opts.html, opts.assets, opts.aspect);
      for (let i = w; i < frames; i += CONCURRENCY) {
        await drawFrame(page, i / FPS);
        await page.screenshot({
          path: path.join(dir, `f${String(i).padStart(6, "0")}.jpg`),
          type: "jpeg",
          quality: 92,
          scale: "css",
        });
        done++;
        const pct = Math.floor((done / frames) * 95);
        if (pct !== lastReported && pct % 5 === 0) {
          lastReported = pct;
          await opts.onProgress?.(pct);
        }
      }
      if (errors.length) console.warn("render page errors", errors.slice(0, 3));
      await close();
    });
    await Promise.all(workers);

    const args = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "f%06d.jpg")];
    if (opts.musicFile) {
      const fadeStart = Math.max(0, opts.durationS - 1.5);
      args.push("-i", opts.musicFile, "-filter_complex", `[1:a]atrim=0:${opts.durationS},afade=t=out:st=${fadeStart}:d=1.5[a]`, "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k");
    }
    args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", "-t", String(opts.durationS), opts.outFile);
    await run("ffmpeg", args);
    if ((await stat(opts.outFile)).size < 10_000) throw new Error("encoded video is unexpectedly small");
    await opts.onProgress?.(100);
  } finally {
    await browser.close();
    await rm(dir, { recursive: true, force: true });
  }
}

function launch(): Promise<Browser> {
  return chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--disable-dev-shm-usage", "--disable-extensions", "--mute-audio"],
  });
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
  });
}
