import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  FAL_KEY: z.string().min(1),
  FAL_VIDEO_MODEL: z.string().default("fal-ai/veo3.1/fast"),
  FAL_MERGE_MODEL: z.string().default("fal-ai/ffmpeg-api/merge-videos"),
  VIDEO_COST_PER_SECOND_USD: z.coerce.number().positive().default(0.4),
  PADDLE_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  PADDLE_API_KEY: z.string().min(1),
  PADDLE_WEBHOOK_SECRET: z.string().min(1),
  PADDLE_PRODUCT_ID: z.string().startsWith("pro_"),
  PRICE_MARGIN: z.coerce.number().min(0).max(5).default(0.5),
  PRICE_FIXED_FEE_USD: z.coerce.number().min(0).default(3),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
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
