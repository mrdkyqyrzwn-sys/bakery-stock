import { z } from "zod";
import type { Analysis } from "@/lib/ai";
import { discounted, findCoupon, redeemCoupon } from "@/lib/coupons";
import { type ProjectRow, sql } from "@/lib/db";
import { bearer, error, isUuid, json } from "@/lib/http";
import { createCheckout } from "@/lib/paddle";
import { env } from "@/lib/env";
import { quote } from "@/lib/pricing";
import { clientIp, hashIp, isSameOrigin, rateLimit, tokenMatches } from "@/lib/security";
import { ASPECTS, DURATIONS, getStyle } from "@/lib/styles";

export const runtime = "nodejs";

const body = z.strictObject({
  style: z.string().max(40),
  durationS: z.number().int().refine((d) => (DURATIONS as readonly number[]).includes(d)),
  aspect: z.enum(ASPECTS),
  acceptTerms: z.literal(true),
  coupon: z.string().max(40).optional(),
});

/**
 * Step 2: lock in style + length, compute the price on the server (minus a coupon, if any) and open a
 * Paddle transaction. A 100% coupon skips Paddle: the order is marked paid and the worker starts on it.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/projects/[id]/checkout">) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  const { id } = await ctx.params;
  if (!isUuid(id)) return error("not found", 404);

  if (!(await rateLimit(`checkout:${hashIp(clientIp(req.headers))}`, 20, 3600))) {
    return error("יותר מדי בקשות", 429);
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error("בחירה לא תקינה", 400);
  const style = getStyle(parsed.data.style);
  if (!style) return error("סגנון לא קיים", 400);

  const db = sql();
  const [project] = await db<ProjectRow[]>`select * from projects where id = ${id}`;
  if (!project || !tokenMatches(bearer(req.headers), project.access_hash)) return error("not found", 404);
  if (project.status !== "draft" && project.status !== "awaiting_payment") {
    return error("הפרויקט כבר שולם", 409);
  }

  const q = quote(parsed.data.durationS);
  let coupon = null;
  if (parsed.data.coupon) {
    coupon = await findCoupon(parsed.data.coupon);
    if (!coupon) return error("קוד הקופון לא קיים או שפג תוקפו.", 400);
  }
  const priceAgorot = coupon ? discounted(q.totalAgorot, coupon.percent) : q.totalAgorot;

  if (coupon && priceAgorot === 0) {
    const ip = hashIp(clientIp(req.headers));
    if (!(await rateLimit(`free:${ip}`, env().FREE_ORDERS_PER_IP_PER_DAY, 86400))) {
      return error("הגעתם למספר ההזמנות החינמיות המקסימלי להיום.", 429);
    }
    if (!(await redeemCoupon(coupon.code))) return error("קוד הקופון כבר נוצל עד הסוף.", 400);
    const updated = await db`
      update projects set style = ${style.id}, duration_s = ${q.durationS}, aspect = ${parsed.data.aspect},
        price_cents = 0, currency = 'ILS', paddle_txn_id = null, coupon_code = ${coupon.code},
        status = 'paid', paid_at = now(), updated_at = now()
      where id = ${id} and status in ('draft', 'awaiting_payment')
      returning id`;
    if (updated.length === 0) return error("הפרויקט כבר שולם", 409);
    return json({ free: true });
  }

  if (!env().PAYMENTS_ENABLED) {
    return error("התשלום בכרטיס אשראי ייפתח בקרוב. בינתיים אפשר להזמין עם קוד קופון.", 503);
  }

  const brand = (project.brief as Analysis["brief"]).brand_name.slice(0, 60);
  const transactionId = await createCheckout({
    projectId: id,
    amountAgorot: priceAgorot,
    description: `AI ad video for ${brand} - ${style.id}, ${q.durationS}s, ${parsed.data.aspect}`,
  });

  await db`
    update projects set style = ${style.id}, duration_s = ${q.durationS}, aspect = ${parsed.data.aspect},
      price_cents = ${priceAgorot}, currency = 'ILS', paddle_txn_id = ${transactionId}, coupon_code = ${coupon?.code ?? null},
      status = 'awaiting_payment', updated_at = now()
    where id = ${id} and status in ('draft', 'awaiting_payment')`;

  return json({ transactionId });
}
