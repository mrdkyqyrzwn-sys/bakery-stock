import "server-only";
import { type ProjectRow, sql } from "./db";
import { refundTransaction } from "./paddle";

/** We could not deliver: mark failed and refund in full automatically. */
export async function failAndRefund(project: Pick<ProjectRow, "id" | "paddle_txn_id" | "paid_at">, reason: string) {
  const db = sql();
  const updated = await db`
    update projects set status = 'failed', stage = null, error = ${reason.slice(0, 500)}, lease_until = null, updated_at = now()
    where id = ${project.id} and status not in ('done', 'refunded', 'failed')
    returning id`;
  if (updated.length === 0 || !project.paddle_txn_id || !project.paid_at) return;
  try {
    await refundTransaction(project.paddle_txn_id, "Video could not be produced");
    await db`update projects set status = 'refunded' where id = ${project.id}`;
  } catch (err) {
    console.error("refund failed - handle manually", project.id, err);
  }
}
