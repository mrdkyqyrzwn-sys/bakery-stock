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
  logo: string | null;
}

const MAX_TEXT = 12_000;

function absolute(src: string | undefined, base: string): string | null {
  if (!src) return null;
  try {
    const u = new URL(src, base);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Fetch a site's home page and pull out what an ad creative needs: copy, tone, colors, imagery. */
export async function scrapeSite(input: string): Promise<SiteData> {
  const page = await safeFetchPage(input);
  const $ = cheerio.load(page.body);
  $("script, style, noscript, svg, iframe, template").remove();

  const meta = (name: string) =>
    $(`meta[name="${name}"]`).attr("content") ?? $(`meta[property="${name}"]`).attr("content") ?? "";

  const headings = $("h1, h2, h3")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((t) => t.length > 1 && t.length < 160)
    .slice(0, 30);

  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);

  const colors = new Set<string>();
  const themeColor = meta("theme-color");
  if (themeColor) colors.add(themeColor);
  for (const m of page.body.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    if (colors.size >= 8) break;
    colors.add(m[0].toLowerCase());
  }

  const logo =
    absolute($('link[rel="apple-touch-icon"]').attr("href"), page.finalUrl) ??
    absolute($('img[alt*="logo" i], img[src*="logo" i]').first().attr("src"), page.finalUrl);

  return {
    url: page.finalUrl,
    title: ($("title").first().text() || meta("og:title")).trim().slice(0, 200),
    description: (meta("description") || meta("og:description")).trim().slice(0, 500),
    language: ($("html").attr("lang") ?? "").slice(0, 10),
    headings,
    text,
    themeColors: [...colors],
    ogImage: absolute(meta("og:image"), page.finalUrl),
    logo,
  };
}
