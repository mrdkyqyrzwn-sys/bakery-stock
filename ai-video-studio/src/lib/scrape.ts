import "server-only";
import * as cheerio from "cheerio";
import { safeFetchPage } from "./safe-fetch";

export interface SiteData {
  url: string;
  title: string;
  description: string;
  language: string;
  headings: string[];
  text: string;
  themeColors: string[];
  ogImage: string | null;
  /** Best logo candidate (kept for older rows; see logos). */
  logo: string | null;
  /** Logo candidates, best first. The worker uses the first one that loads. */
  logos: string[];
  /** Photos from the page (products, place, work), best first. Small icons are filtered out later. */
  images: string[];
}

const MAX_TEXT = 12_000;
const MAX_IMAGES = 16;

function absolute(src: string | undefined | null, base: string): string | null {
  if (!src) return null;
  try {
    const u = new URL(src.trim(), base);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** The largest candidate in a srcset ("a.jpg 480w, b.jpg 1200w"). */
function largestFromSrcset(srcset: string | undefined): string | null {
  if (!srcset) return null;
  let best: { url: string; size: number } | null = null;
  for (const part of srcset.split(",")) {
    const [url, size] = part.trim().split(/\s+/);
    const n = parseFloat(size ?? "1") || 1;
    if (url && (!best || n > best.size)) best = { url, size: n };
  }
  return best?.url ?? null;
}

/** Logo URLs declared in schema.org JSON-LD ("logo": "..." or { "url": "..." }). */
function jsonLdLogos($: cheerio.CheerioAPI): string[] {
  const found: string[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const obj = node as Record<string, unknown>;
    const logo = obj.logo;
    if (typeof logo === "string") found.push(logo);
    else if (logo && typeof logo === "object" && typeof (logo as { url?: unknown }).url === "string") {
      found.push((logo as { url: string }).url);
    }
    Object.values(obj).forEach((v) => typeof v === "object" && visit(v));
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      visit(JSON.parse($(el).text()));
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return found;
}

const NOT_A_PHOTO = /(logo|icon|sprite|favicon|avatar|badge|pixel|spinner|loader|placeholder|blank|flag|payment|visa|mastercard)/i;

/** Pure extraction from HTML, so it can be tested without the network. */
export function extractSite(html: string, finalUrl: string): SiteData {
  const $ = cheerio.load(html);
  const abs = (s: string | undefined | null) => absolute(s, finalUrl);
  const meta = (name: string) =>
    $(`meta[name="${name}"]`).attr("content") ?? $(`meta[property="${name}"]`).attr("content") ?? "";

  // Logos, best first: structured data, explicit meta, images marked as logo (header first), icons.
  const logoImgs = $('header img:first, [class*="logo" i] img, img[class*="logo" i], img[id*="logo" i], img[alt*="logo" i], img[src*="logo" i]')
    .filter((_, el) => {
      const w = Number($(el).attr("width") ?? 0);
      return !(w && w < 40) && !/(cart|menu|search|user|account|close|arrow)/i.test($(el).attr("src") ?? "");
    })
    .map((_, el) => $(el).attr("src") || largestFromSrcset($(el).attr("srcset")) || "")
    .get();
  const icons = $('link[rel="apple-touch-icon"], link[rel="icon"][type="image/svg+xml"], link[rel="icon"][sizes]')
    .map((_, el) => $(el).attr("href") ?? "")
    .get();
  const logos = [...new Set([...jsonLdLogos($), meta("og:logo"), ...logoImgs, ...icons].map(abs).filter((u): u is string => !!u))].slice(0, 6);

  // Photos, best first: share images, then large content images (lazy-loaded attributes too).
  const candidates = [meta("og:image"), meta("og:image:url"), meta("twitter:image")];
  $("img, source").each((_, el) => {
    const e = $(el);
    // In <picture>, the <source> entries already cover the <img> fallback.
    if (el.tagName === "img" && e.parent().is("picture") && e.siblings("source").length > 0) return;
    const alt = e.attr("alt") ?? "";
    const src =
      largestFromSrcset(e.attr("srcset") ?? e.attr("data-srcset")) ?? e.attr("data-src") ?? e.attr("data-lazy-src") ?? e.attr("src");
    if (!src || src.startsWith("data:") || NOT_A_PHOTO.test(src) || NOT_A_PHOTO.test(alt)) return;
    const w = Number(e.attr("width") ?? 0);
    if (w && w < 300) return;
    candidates.push(src);
  });
  $("[style*='background-image']").each((_, el) => {
    const m = /url\(["']?([^"')]+)["']?\)/.exec($(el).attr("style") ?? "");
    if (m && !NOT_A_PHOTO.test(m[1])) candidates.push(m[1]);
  });
  const images = [
    ...new Set(candidates.map(abs).filter((u): u is string => !!u && !/\.(svg|gif|ico)(\?|$)/i.test(u))),
  ].slice(0, MAX_IMAGES);

  $("script, style, noscript, svg, iframe, template").remove();
  const headings = $("h1, h2, h3")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((t) => t.length > 1 && t.length < 160)
    .slice(0, 30);
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);

  const colors = new Set<string>();
  const themeColor = meta("theme-color");
  if (themeColor) colors.add(themeColor);
  for (const m of html.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    if (colors.size >= 8) break;
    colors.add(m[0].toLowerCase());
  }

  return {
    url: finalUrl,
    title: ($("title").first().text() || meta("og:title")).trim().slice(0, 200),
    description: (meta("description") || meta("og:description")).trim().slice(0, 500),
    language: ($("html").attr("lang") ?? "").slice(0, 10),
    headings,
    text,
    themeColors: [...colors],
    ogImage: abs(meta("og:image")),
    logo: logos[0] ?? null,
    logos,
    images,
  };
}

/** Fetch a site's home page and pull out what an ad needs: copy, tone, colors, logo and photos. */
export async function scrapeSite(input: string): Promise<SiteData> {
  const page = await safeFetchPage(input);
  return extractSite(page.body, page.finalUrl);
}
