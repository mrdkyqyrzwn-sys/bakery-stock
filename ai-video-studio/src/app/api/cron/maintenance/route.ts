import { type ProjectRow, sql } from "@/lib/db";
import { env } from "@/lib/env";
import { bearer, error, json } from "@/lib/http";
import { failAndRefund } from "@/lib/fulfillment";
import { safeEqual } from "@/lib/security";
import { deleteFiles } from "@/lib/storage";

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
  // A revision stuck for 2 hours goes back to the delivered video (nothing is charged for revisions).
  await db`
    update projects set status = 'done', stage = null, revision_request = null, lease_until = null, updated_at = now()
    where status = 'revising' and updated_at < now() - interval '2 hours'`;

  // Retention: unpaid drafts 7 days; scraped site content 30 days; everything else 90 days.
  const expired = await db<Pick<ProjectRow, "id" | "uploads" | "media" | "video_url">[]>`
    select id, uploads, media, video_url from projects
    where (status in ('draft', 'awaiting_payment') and created_at < now() - interval '7 days')
       or created_at < now() - interval '90 days'
    limit 100`;
  for (const p of expired) {
    const media = (p.media ?? {}) as { imageUrls?: string[]; voiceUrl?: string; musicUrl?: string };
    await deleteFiles([
      ...p.uploads.map((u) => u.url),
      ...(media.imageUrls ?? []),
      ...[media.voiceUrl, media.musicUrl, p.video_url].filter((u): u is string => !!u),
    ]);
    await db`delete from projects where id = ${p.id}`;
  }
  await db`update projects set site_data = '{}'::jsonb where site_data <> '{}'::jsonb and created_at < now() - interval '30 days'`;
  await db`delete from rate_limits where window_start < now() - interval '2 days'`;
  await db`delete from webhook_events where received_at < now() - interval '30 days'`;
  await db`delete from cancel_requests where created_at < now() - interval '1 year'`;

  return json({ refundedStuck: stuck.length, expired: expired.length });
}
