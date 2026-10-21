import { z } from "zod";
import { type ProjectRow, sql } from "@/lib/db";
import { bearer, error, isUuid, json } from "@/lib/http";
import { refundTransaction } from "@/lib/paddle";
import { clientIp, hashIp, isSameOrigin, rateLimit, tokenMatches } from "@/lib/security";

export const runtime = "nodejs";

const body = z.strictObject({ reason: z.string().max(600).optional() });

/**
 * Cancel an order from its private page. Before production starts we cancel and refund at once.
 * After it starts, the video is digital content made on request, so we record the request and
 * handle it by the refund policy (the law still gives some buyers a right to cancel).
 */
export async function POST(req: Request, ctx: RouteContext<"/api/projects/[id]/cancel">) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  const { id } = await ctx.params;
  if (!isUuid(id)) return error("not found", 404);
  const ipHash = hashIp(clientIp(req.headers));
  if (!(await rateLimit(`cancel:${ipHash}`, 10, 3600))) return error("יותר מדי בקשות", 429);
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return error("בקשה לא תקינה", 400);

  const db = sql();
  const [project] = await db<ProjectRow[]>`select * from projects where id = ${id}`;
  if (!project || !tokenMatches(bearer(req.headers), project.access_hash)) return error("not found", 404);

  if (project.status === "draft" || project.status === "awaiting_payment") {
    await db`update projects set status = 'cancelled', updated_at = now() where id = ${id} and status in ('draft', 'awaiting_payment')`;
    return json({ result: "cancelled" });
  }

  // Paid but not yet picked up by the render worker: stop it and refund in full.
  const stopped = await db`
    update projects set status = 'cancelled', updated_at = now()
    where id = ${id} and status = 'paid' and stage is null and (lease_until is null or lease_until < now())
    returning id`;
  if (stopped.length > 0) {
    if (project.paddle_txn_id) {
      try {
        await refundTransaction(project.paddle_txn_id, "Cancelled by the buyer before production started");
      } catch (err) {
        console.error("refund on cancel failed - handle manually", id, err);
        await db`insert into cancel_requests (project_id, details, ip_hash) values (${id}, ${"auto refund failed"}, ${ipHash})`;
      }
    }
    return json({ result: "refunded" });
  }

  if (["failed", "refunded", "cancelled"].includes(project.status)) return json({ result: "cancelled" });

  const [row] = await db<{ id: string }[]>`
    insert into cancel_requests (project_id, details, ip_hash)
    values (${id}, ${parsed.data.reason ?? null}, ${ipHash})
    returning id`;
  return json({ result: "requested", reference: row.id.slice(0, 8).toUpperCase() });
}
