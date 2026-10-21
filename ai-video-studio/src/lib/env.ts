import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  PADDLE_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  PADDLE_API_KEY: z.string().min(1),
  PADDLE_WEBHOOK_SECRET: z.string().min(1),
  PADDLE_PRODUCT_ID: z.string().startsWith("pro_"),
  PRICE_MARGIN: z.coerce.number().min(0).max(5).default(1),
  PRICE_FIXED_FEE_USD: z.coerce.number().min(0).default(5),
  // Dollars to shekels for provider costs, and Israeli VAT. Prices are shown and charged in ILS, VAT included.
  USD_ILS_RATE: z.coerce.number().min(1).max(10).default(3.7),
  VAT_RATE: z.coerce.number().min(0).max(0.5).default(0.18),
  // Optional bot protection on the website scan (Cloudflare Turnstile). Strongly recommended in production.
  TURNSTILE_SECRET_KEY: z.string().optional(),
  // Most free (100% coupon) orders one visitor can place per day.
  FREE_ORDERS_PER_IP_PER_DAY: z.coerce.number().int().min(0).default(3),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  // Render worker only (image generation, narration, music)
  FAL_KEY: z.string().optional(),
  FAL_IMAGE_MODEL: z.string().default("fal-ai/flux-2-pro"),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_TTS_MODEL: z.string().default("eleven_v4"),
  ELEVENLABS_MUSIC_MODEL: z.string().default("music_v2_5"),
  ELEVENLABS_VOICE_FEMALE: z.string().default("21m00Tcm4TlvDq8ikWAM"),
  ELEVENLABS_VOICE_MALE: z.string().default("pNInz6obpgDQGcFmaJgB"),
  CRON_SECRET: z.string().min(32),
  IP_HASH_SALT: z.string().min(16),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validated server environment. Throws on first use if anything is missing. */
export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Invalid server environment: ${missing}`);
    }
    cached = parsed.data;
  }
  return cached;
}
