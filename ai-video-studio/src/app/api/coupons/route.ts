import { z } from "zod";
import { findCoupon } from "@/lib/coupons";
import { error, json } from "@/lib/http";
import { clientIp, hashIp, isSameOrigin, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

const body = z.strictObject({ code: z.string().max(40) });

/** Check a coupon code before checkout, so the customer sees the discounted price. */
export async function POST(req: Request) {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  // Low limit: guessing codes should be slow.
  if (!(await rateLimit(`coupon:${hashIp(clientIp(req.headers))}`, 10, 3600))) {
    return error("יותר מדי ניסיונות. נסו שוב בעוד שעה.", 429);
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error("קוד לא תקין", 400);
  const coupon = await findCoupon(parsed.data.code);
  if (!coupon) return error("הקוד הזה לא קיים או שפג תוקפו.", 404);
  return json(coupon);
}
