import { z } from "zod";
import { type ProjectRow, sql } from "@/lib/db";
import { bearer, error, isUuid, json } from "@/lib/http";
import { FREE_REVISIONS, MAX_REVISION_TEXT } from "@/lib/limits";
import { clientIp, hashIp, isSameOrigin, rateLimit, tokenMatches } from "@/lib/security";

export const runtime = "nodejs";

const body = z.strictObject({
  text: z.string().trim().max(MAX_REVISION_TEXT),
  headlines: z.array(z.string().trim().max(120).nullable()).max(40),
});

/** Ask for a small change to a delivered video. The render worker picks it up. */
export async function POST(req: Request, ctx: RouteContext<"/api/projects/[id]/revisions">) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  const { id } = await ctx.params;
  if (!isUuid(id)) return error("not found", 404);
  if (!(await rateLimit(`revise:${hashIp(clientIp(req.headers))}`, 10, 3600))) return error("יותר מדי בקשות", 429);

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error("בקשת התיקון לא תקינה", 400);
  const request = {
    text: parsed.data.text,
    headlines: parsed.data.headlines.map((h) => (h ? h : null)),
  };
  if (!request.text && request.headlines.every((h) => h === null)) return error("כתבו מה לתקן", 400);

  const [project] = await sql()<ProjectRow[]>`select * from projects where id = ${id}`;
  if (!project || !tokenMatches(bearer(req.headers), project.access_hash)) return error("not found", 404);
  if (project.status !== "done") return error("אפשר לבקש תיקון רק אחרי שהסרטון מוכן", 409);

  // Atomic: only one pending revision, and never more than the included rounds.
  const updated = await sql()`
    update projects set status = 'revising', stage = 'writing', render_progress = 0,
      revision_request = ${sql().json(request)}, error_count = 0, lease_until = null, updated_at = now()
    where id = ${id} and status = 'done' and revision_count < ${FREE_REVISIONS}
    returning id`;
  if (updated.length === 0) return error(`נוצלו כל ${FREE_REVISIONS} סבבי התיקונים`, 409);
  return json({ ok: true });
}
