import { z } from "zod";
import { sql } from "@/lib/db";
import { error, json } from "@/lib/http";
import { clientIp, hashIp, isSameOrigin, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

const body = z.strictObject({
  email: z.string().trim().email().max(200),
  order: z.string().trim().max(200).optional(),
  details: z.string().trim().max(1000).optional(),
});

/** General cancellation form, for buyers who no longer have their private order link. */
export async function POST(req: Request) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  const ipHash = hashIp(clientIp(req.headers));
  if (!(await rateLimit(`cancelform:${ipHash}`, 5, 3600))) return error("יותר מדי בקשות. נסו שוב בעוד שעה.", 429);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error("נא למלא כתובת דוא״ל תקינה", 400);
  const { email, order, details } = parsed.data;
  const [row] = await sql()<{ id: string }[]>`
    insert into cancel_requests (email, details, ip_hash)
    values (${email}, ${[order && `order: ${order}`, details].filter(Boolean).join("\n") || null}, ${ipHash})
    returning id`;
  return json({ reference: row.id.slice(0, 8).toUpperCase() });
}
