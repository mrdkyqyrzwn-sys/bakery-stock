import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { bearer, error, json } from "@/lib/http";
import { type ProjectRow } from "@/lib/db";
import { failAndRefund } from "@/lib/fulfillment";
import { safeEqual } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Safety net (Vercel Cron): refunds orders the render worker never finished, and enforces the
 * data-retention periods promised in the privacy policy.
 */
export async function GET(req: Request) {
  const token = bearer(req.headers);
  if (!token || !safeEqual(token, env().CRON_SECRET)) return error("unauthorized", 401);
  const db = sql();

  // A paid order still not delivered after 3 hours means something is wrong: refund it.
  const stuck = await db<ProjectRow[]>`
    select * from projects where status in ('paid', 'rendering') and paid_at < now() - interval '3 hours' limit 20`;
  for (const p of stuck) await failAndRefund(p, "not delivered within 3 hours");

  // Retention: unpaid drafts 7 days; scraped site content 30 days; everything 90 days.
  await db`delete from projects where status in ('draft', 'awaiting_payment') and created_at < now() - interval '7 days'`;
  await db`update projects set site_data = '{}'::jsonb where site_data <> '{}'::jsonb and created_at < now() - interval '30 days'`;
  const expired = await db<{ id: string; video_url: string | null }[]>`
    select id, video_url from projects where created_at < now() - interval '90 days' limit 100`;
  for (const p of expired) {
    if (p.video_url && env().BLOB_READ_WRITE_TOKEN && p.video_url.includes(".blob.vercel-storage.com")) {
      await del(p.video_url, { token: env().BLOB_READ_WRITE_TOKEN }).catch(() => {});
    }
    await db`delete from projects where id = ${p.id}`;
  }
  await db`delete from rate_limits where window_start < now() - interval '2 days'`;
  await db`delete from webhook_events where received_at < now() - interval '30 days'`;

  return json({ refundedStuck: stuck.length, expired: expired.length });
}
