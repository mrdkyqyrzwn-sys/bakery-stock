import { z } from "zod";
import { ContentRefusedError, analyzeSite } from "@/lib/ai";
import { sql } from "@/lib/db";
import { error, json } from "@/lib/http";
import { UnsafeUrlError } from "@/lib/safe-fetch";
import { scrapeSite } from "@/lib/scrape";
import { clientIp, hashIp, hashToken, isSameOrigin, newAccessToken, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 120;

const body = z.strictObject({
  url: z.string().min(4).max(500),
  consent: z.literal(true),
});

/** Step 1: scan the customer's website and propose ad concepts in every style. */
export async function POST(req: Request) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error("נא להזין כתובת אתר ולאשר את התנאים", 400);

  const ipHash = hashIp(clientIp(req.headers));
  const allowed =
    (await rateLimit(`analyze:ip:${ipHash}`, 6, 3600)) && (await rateLimit("analyze:global", 300, 3600));
  if (!allowed) return error("יותר מדי בקשות. נסו שוב בעוד שעה.", 429);

  let site;
  try {
    site = await scrapeSite(parsed.data.url);
  } catch (err) {
    if (err instanceof UnsafeUrlError) return error(err.message, 400);
    return error("לא הצלחנו לקרוא את האתר. ודאו שהכתובת נכונה והאתר זמין.", 422);
  }
  if (site.text.length < 80 && !site.description) {
    return error("לא מצאנו מספיק תוכן באתר כדי ליצור פרסומת.", 422);
  }

  let analysis;
  try {
    analysis = await analyzeSite(site);
  } catch (err) {
    if (err instanceof ContentRefusedError) return error("לא ניתן ליצור פרסומת לאתר זה.", 422);
    console.error("analysis failed", err);
    return error("ניתוח האתר נכשל. נסו שוב בעוד רגע.", 502);
  }
  if (!analysis.allowed) {
    return error(analysis.refusal_reason_he || "התוכן באתר אינו עומד במדיניות השימוש שלנו.", 422);
  }

  const token = newAccessToken();
  const db = sql();
  const [row] = await db<{ id: string }[]>`
    insert into projects (access_hash, site_url, site_data, brief, concepts, ip_hash, consent_at)
    values (${hashToken(token)}, ${site.url}, ${db.json(JSON.parse(JSON.stringify(site)))},
            ${db.json(analysis.brief)}, ${db.json(analysis.concepts)}, ${ipHash}, now())
    returning id`;

  return json({ id: row.id, token });
}
