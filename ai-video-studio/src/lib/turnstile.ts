import "server-only";
import { env } from "./env";

/**
 * Cloudflare Turnstile check, so bots cannot spend our AI budget on website scans.
 * Off when TURNSTILE_SECRET_KEY is not set (local development).
 */
export async function passesBotCheck(token: string | undefined, ip: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
