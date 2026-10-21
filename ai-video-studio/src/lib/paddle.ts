import "server-only";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { env } from "./env";

let client: Paddle | undefined;
export function paddle(): Paddle {
  const key = env().PADDLE_API_KEY;
  if (!key) throw new Error("Paddle is not configured");
  client ??= new Paddle(key, {
    environment: env().PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
  });
  return client;
}

/**
 * Create a one-off Paddle transaction for this exact video. The price is set here on the
 * server, so a buyer cannot change what they pay. The amount is in agorot and already includes
 * VAT (tax mode "internal"), so the buyer pays exactly the price shown on the site. Paddle, as
 * Merchant of Record, accounts for the tax and issues the invoice.
 */
export async function createCheckout(opts: {
  projectId: string;
  amountAgorot: number;
  description: string;
}): Promise<string> {
  const txn = await paddle().transactions.create({
    items: [
      {
        quantity: 1,
        price: {
          productId: env().PADDLE_PRODUCT_ID!,
          description: opts.description,
          name: opts.description,
          unitPrice: { amount: String(opts.amountAgorot), currencyCode: "ILS" },
          taxMode: "internal",
          quantity: { minimum: 1, maximum: 1 },
        },
      },
    ],
    customData: { projectId: opts.projectId },
  });
  return txn.id;
}

/** Full refund, used automatically when we fail to deliver a paid video. */
export async function refundTransaction(transactionId: string, reason: string): Promise<void> {
  await paddle().adjustments.create({
    action: "refund",
    type: "full",
    transactionId,
    reason,
  });
}
