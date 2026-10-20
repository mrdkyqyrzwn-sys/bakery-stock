import "server-only";
import dns from "node:dns";
import ipaddr from "ipaddr.js";
import { Agent, fetch as undiciFetch } from "undici";

/**
 * Fetching a URL that a stranger typed in is a classic SSRF hole: they could point us at
 * cloud metadata (169.254.169.254), localhost, or the internal network. This module only
 * connects to public unicast addresses, re-checks on every redirect, and validates the IP
 * at connect time (so DNS rebinding cannot swap the address after we checked it).
 */

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

export class UnsafeUrlError extends Error {}

function isPublicAddress(address: string): boolean {
  if (!ipaddr.isValid(address)) return false;
  let parsed = ipaddr.parse(address);
  if (parsed.kind() === "ipv6" && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    parsed = (parsed as ipaddr.IPv6).toIPv4Address();
  }
  return parsed.range() === "unicast";
}

const safeLookup: typeof dns.lookup = ((
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void,
) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || !list.every((a) => isPublicAddress(a.address))) {
      return callback(new UnsafeUrlError(`Blocked non-public address for ${hostname}`), "", 4);
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}) as typeof dns.lookup;

const agent = new Agent({ connect: { lookup: safeLookup, timeout: TIMEOUT_MS } });

export function normalizePublicUrl(input: string): URL {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("כתובת לא תקינה");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new UnsafeUrlError("רק http/https");
  if (url.username || url.password) throw new UnsafeUrlError("כתובת עם פרטי התחברות אינה מותרת");
  if (url.port && url.port !== "80" && url.port !== "443") throw new UnsafeUrlError("פורט לא מותר");
  const host = url.hostname;
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") {
    throw new UnsafeUrlError("יש להזין כתובת אתר ציבורית");
  }
  if (ipaddr.isValid(host.replace(/^\[|\]$/g, "")) && !isPublicAddress(host.replace(/^\[|\]$/g, ""))) {
    throw new UnsafeUrlError("יש להזין כתובת אתר ציבורית");
  }
  url.hash = "";
  return url;
}

export interface FetchedPage {
  finalUrl: string;
  contentType: string;
  body: string;
}

/** GET a public HTML page with size, time, redirect and address limits. */
export async function safeFetchPage(input: string): Promise<FetchedPage> {
  let url = normalizePublicUrl(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await undiciFetch(url, {
        dispatcher: agent,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; AdVideoBot/1.0; +site-preview)",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location) throw new UnsafeUrlError("הפניה לא תקינה");
        url = normalizePublicUrl(new URL(location, url).toString());
        continue;
      }
      if (!res.ok) throw new UnsafeUrlError(`האתר החזיר שגיאה ${res.status}`);
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("html")) throw new UnsafeUrlError("הכתובת אינה דף אינטרנט");

      const reader = res.body!.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
      const body = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
      return { finalUrl: url.toString(), contentType, body };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new UnsafeUrlError("יותר מדי הפניות");
}
