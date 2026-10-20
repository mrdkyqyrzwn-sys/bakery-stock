# AI Ad Video Studio

A site where a business pastes its website address, picks a style and length, pays, and automatically gets an AI-generated video ad. Payment, production, refunds, and data deletion all run automatically, without manual involvement.

## How it works

1. **Site scan** (`/api/projects`): the system reads the public home page (with SSRF protection) and sends it to Claude. Claude checks it against the content policy, writes a brand brief, and writes a concept in each of the 5 styles.
2. **Choice and price** (`/api/projects/[id]/checkout`): the customer picks a style, a length (20 seconds to 2 minutes), and a format (landscape or portrait). The price is calculated **on the server** from real costs plus your margin, and a Paddle transaction is created.
3. **Payment**: Paddle (Merchant of Record) charges the customer, handles VAT and taxes worldwide, and issues the invoice.
4. **Production** (`src/lib/pipeline.ts`): after a signed payment webhook, Claude writes a storyboard of scenes. Each scene goes to a video model (Veo 3.1 via fal.ai), and the scenes are then merged into one video. The process runs as a state machine that survives restarts.
5. **Delivery**: the video is saved to Vercel Blob and appears on the customer's private page. **If production fails, the customer gets a full automatic refund.**

## Setup (about an hour)

1. **Database**: open a free Postgres on [Neon](https://neon.tech) or Supabase and run:
   `psql "$DATABASE_URL" -f db/schema.sql`
2. **Claude**: create an API key at [console.anthropic.com](https://console.anthropic.com).
3. **fal.ai**: create a key at [fal.ai](https://fal.ai). Check on [the pricing page](https://fal.ai/pricing) what one second of the model costs, and put the number in `VIDEO_COST_PER_SECOND_USD`. **Note:** the endpoint `fal-ai/veo3.1/fast` is scheduled for deprecation on November 17, 2026. Before launch, switch `FAL_VIDEO_MODEL` to the current model.
4. **Paddle**:
   - Open a [Paddle](https://paddle.com) account and complete identity and business verification. Start in Sandbox.
   - Create a product ("AI ad video"). Its ID (`pro_...`) goes in `PADDLE_PRODUCT_ID`.
   - Create an API key and a Client-side token.
   - Under Notifications, create a webhook to `https://YOUR-DOMAIN/api/webhooks/paddle` with the events `transaction.completed`, `transaction.paid`, `adjustment.created`, `adjustment.updated`. Its secret key goes in `PADDLE_WEBHOOK_SECRET`.
   - Paddle reviews the site before approving live payments. The legal pages they require are already built in.
5. **Deploy to Vercel**: import the repo, set the *Root Directory* to `ai-video-studio`, fill in all the variables from `.env.example`, and enable Vercel Blob.
6. Set `CRON_SECRET` to a long random string (`openssl rand -hex 32`). Vercel sends it automatically to the cron.

> Cron every 5 minutes requires Vercel Pro. On the free plan production still works, because webhooks and page polling move it forward. The cron is only a safety net.

## Pricing

`src/lib/pricing.ts`. Example with the defaults (cost of $0.40 per second, 50% margin, $3 fixed fee):

| Length | Price to the customer |
|---|---|
| 20 seconds | $19.99 |
| 30 seconds | $26.99 |
| 60 seconds | $48.99 |
| 2 minutes | $91.99 |

The price includes a 15% buffer for regenerating failed scenes and Paddle's fee. The customer sees a full breakdown before paying.

## Security

- SSRF protection: only public addresses, checked again on every redirect and at connect time (protects against DNS rebinding).
- Prices are calculated only on the server. The Paddle transaction is created on the server with the price locked in.
- Every Paddle webhook is verified by signature and is idempotent (handled only once).
- fal webhooks are not trusted: the result is read through the authenticated API.
- Access to a project is only through a random 256-bit token kept in the URL fragment (`#t=`). Only its hash is stored.
- Rate limiting per IP and globally (stored in the DB, works across serverless instances).
- Origin check on POST requests, plus strict CSP, HSTS, and X-Frame-Options.
- Site content is passed to Claude as data, with a prompt-injection warning, and the output is enforced by a JSON schema.
- No IP addresses are stored (salted hash only), and nothing is kept from the credit card.
- Automatic deletion: drafts after 7 days, site content after 30, videos after 90.

## Legal: what still needs doing before launch

The legal pages in `src/app/legal/` are a careful template that covers Israeli law (Privacy Protection Law including Amendment 13, Consumer Protection Law, Accessibility Regulations) as well as GDPR and the EU AI Act. **They are not a substitute for a lawyer.** Before going live:

- [ ] A lawyer specializing in privacy, consumer law, and tech reviews the documents.
- [ ] Fill in the business details in `.env` (name, business ID number, address, accessibility coordinator).
- [ ] Register a business (licensed dealer / company) and report the income from Paddle to the tax authorities.
- [ ] Accessibility: commission a review from an accessibility consultant (accessibility lawsuits are the most common lawsuits against websites in Israel).
- [ ] Choose the jurisdiction district in the terms of use (`[Tel Aviv-Yafo]`).
- [ ] Check that the video model's terms of use allow commercial resale of its output.
