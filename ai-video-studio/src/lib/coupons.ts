import "server-only";
import { sql } from "./db";

export interface Coupon {
  code: string;
  percent: number;
}

/** Codes are case-insensitive: "mordechai10" and "MORDECHAI10" are the same code. */
export function normalizeCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9_-]{3,32}$/.test(code) ? code : null;
}

/** A coupon that can still be used right now, or null. */
export async function findCoupon(raw: string): Promise<Coupon | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  const [row] = await sql()<Coupon[]>`
    select code, percent from coupons
    where code = ${code} and active
      and (expires_at is null or expires_at > now())
      and (max_uses is null or uses < max_uses)`;
  return row ?? null;
}

/** Discounted price in cents. A 100% coupon gives 0. */
export function discounted(totalCents: number, percent: number): number {
  return Math.max(0, Math.round((totalCents * (100 - percent)) / 100));
}

/** Count one use, only if the code still has uses left. Returns false if it ran out in the meantime. */
export async function redeemCoupon(code: string): Promise<boolean> {
  const rows = await sql()`
    update coupons set uses = uses + 1
    where code = ${code} and active
      and (expires_at is null or expires_at > now())
      and (max_uses is null or uses < max_uses)
    returning code`;
  return rows.length > 0;
}
