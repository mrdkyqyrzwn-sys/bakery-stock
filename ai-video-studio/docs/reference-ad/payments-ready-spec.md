PAYMENTS: make everything ready so that card payment can be switched on the day the owner gets a business number. Do not publish. Keep real payments OFF.

1. A provider-agnostic payment module on the server (`payments.server.ts`):
   - `createPayment(order)` returns a hosted payment page URL. The card is never typed on our site, so there is no PCI scope.
   - `verifyWebhook(request)` checks the provider's signature or secret and the amount.
   - `handlePaid(event)` is idempotent: it marks the order paid exactly once, using an event-id table.
   - `refund(order, amount)`.
   - The provider is selected by the secret `PAYMENT_PROVIDER` (none | grow | payplus | cardcom | paddle). The prices come only from the server price table; the amount from the client is never trusted.
2. Adapters:
   - **"mock":** works only in preview/dev and never in production. It has a fake hosted page with "pay" / "fail" buttons, so the full flow can be tested now.
   - **Real adapters:** write them from the provider's official API documentation. Implement them only when the owner chooses a provider; until then, leave a clear TODO interface. Likely choices: Grow (Meshulam), PayPlus or Cardcom (Israeli, issue receipts automatically), or Paddle (merchant of record).
   - **Secrets:** all keys go in Lovable secrets, never in code: PAYMENT_PROVIDER, PAYMENT_API_KEY, PAYMENT_SECRET / WEBHOOK_SECRET, PAYMENT_PAGE_ID or similar.
3. Flow:
   - checkout → create the order (status "awaiting_payment") → redirect to the hosted page → the provider redirects back to /pay/return?order=…;
   - show "מאמתים את התשלום…" and poll the order status, never trusting the return URL alone;
   - the webhook marks it paid → production starts.
   - Unpaid orders expire after 2 hours.
   - A failed production after payment triggers an automatic refund (or a coupon-like credit if refund isn't possible) and an email.
   - The coupon path keeps working; a 100% coupon skips payment.
4. Receipts:
   - The owner will be an עוסק פטור, so he issues a קבלה, not a tax invoice, and charges no VAT.
   - Prefer a provider that issues the receipt automatically, and email it to the customer with the order confirmation.
   - Store the receipt number/URL on the order and show it in "ההזמנות שלי".
5. Switch:
   - Payments are enabled only when PAYMENT_PROVIDER is set AND the business details (name, business number, address, phone, email) are filled in. Otherwise keep "תשלום בכרטיס אשראי · בקרוב" and coupon-only.
   - Add a status row in /admin showing which provider is active, whether the webhook was received recently, and the last 10 payment events.
6. Pricing display:
   - While the seller is an עוסק פטור, show one final price in ₪ with no VAT line and no "כולל מע״מ".
   - Keep a single setting `VAT_MODE` (exempt | included) so it can change later.
7. Tests (preview only, with the mock):
   - pay success → production;
   - pay fail → back to checkout with a message;
   - a duplicate webhook is ignored;
   - a tampered amount is rejected;
   - a production failure after payment triggers a refund;
   - a coupon still works.
   Clean up test data and reset MORDECHAI10 to 0. Report in Hebrew.
