import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { sql } from "./db";
import { env } from "./env";

/** A random, unguessable access token for a project (256 bits). Only its hash is stored. */
export function newAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function tokenMatches(token: string | null | undefined, storedHash: string): boolean {
  if (!token || token.length > 200) return false;
  return safeEqual(hashToken(token), storedHash);
}

/** We never store raw IP addresses - only a salted hash, for rate limiting and abuse prevention. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(env().IP_HASH_SALT + ip).digest("hex").slice(0, 32);
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Fixed-window rate limiter stored in Postgres, so it works across serverless instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const [row] = await sql()<{ count: number }[]>`
    insert into rate_limits (key, window_start, count) values (${key}, ${windowStart}, 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  return row.count <= limit;
}

/** Same-origin check for state-changing requests from the browser (CSRF defense in depth). */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(env().NEXT_PUBLIC_SITE_URL).origin;
  } catch {
    return false;
  }
}
