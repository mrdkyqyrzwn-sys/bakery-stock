import { EventName } from "@paddle/paddle-node-sdk";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { error, isUuid, json } from "@/lib/http";
import { paddle } from "@/lib/paddle";

export const runtime = "nodejs";

/** Paddle tells us a payment went through. The signature proves the call really came from Paddle. */
export async function POST(req: Request) {
  const signature = req.headers.get("paddle-signature");
  const raw = await req.text();
  if (!signature || raw.length > 1_000_000) return error("bad request", 400);

  let event;
  try {
    event = await paddle().webhooks.unmarshal(raw, env().PADDLE_WEBHOOK_SECRET, signature);
  } catch {
    return error("invalid signature", 401);
  }

  const db = sql();
  const fresh = await db`insert into webhook_events (id) values (${event.eventId}) on conflict do nothing returning id`;
  if (fresh.length === 0) return json({ ok: true, duplicate: true });

  if (event.eventType === EventName.TransactionCompleted || event.eventType === EventName.TransactionPaid) {
    const txn = event.data;
    const projectId = (txn.customData as { projectId?: string } | null)?.projectId;
    if (isUuid(projectId)) {
      // The transaction id must be the one we created for this project, with our server-side price.
      // The render worker picks up 'paid' projects from the database.
      await db`
        update projects set status = 'paid', paid_at = now(), updated_at = now()
        where id = ${projectId} and paddle_txn_id = ${txn.id} and status = 'awaiting_payment'`;
    }
  }

  if (event.eventType === EventName.AdjustmentCreated || event.eventType === EventName.AdjustmentUpdated) {
    const adj = event.data;
    if (adj.action === "refund" && adj.status === "approved") {
      await db`update projects set status = 'refunded', updated_at = now() where paddle_txn_id = ${adj.transactionId}`;
    }
  }

  return json({ ok: true });
}
