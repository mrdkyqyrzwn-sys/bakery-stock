/**
 * Costs per video (estimates; check the real numbers in each provider's dashboard and adjust):
 * Claude directs and edits the video in code, an image model fills in missing photos,
 * ElevenLabs records the narration and composes the music, and we render the result.
 */
/** Claude: script, plan, writing the edit in code, visual review and fixes. */
const AI_BASE_USD = 1.2;
const AI_PER_SECOND_USD = 0.03;
/** Worst case: one generated image per 5 seconds (FLUX.2 Pro at ~1920x1080). Uploaded photos cost nothing. */
const IMAGE_USD = 0.06;
const SECONDS_PER_IMAGE = 5;
/** ElevenLabs narration (~15 characters per second) and original music. */
const VOICE_PER_SECOND_USD = 0.005;
const MUSIC_PER_SECOND_USD = 0.02;
/** Render server time (headless browser + encoding) and storage. */
const RENDER_PER_SECOND_USD = 0.004;
/** Budget for re-writing code that fails validation. */
const RETRY_BUFFER = 0.3;
/** Paddle's fee is ~5% + $0.50 per transaction; we price it in so the margin stays real. */
const PAYMENT_FEE_RATE = 0.05;
const PAYMENT_FEE_FIXED_USD = 0.5;

export interface Quote {
  durationS: number;
  breakdown: {
    aiUsd: number;
    mediaUsd: number;
    renderUsd: number;
    serviceFeeUsd: number;
    paymentProcessingUsd: number;
  };
  totalUsd: number;
  totalCents: number;
}

export interface PricingParams {
  PRICE_MARGIN: number;
  PRICE_FIXED_FEE_USD: number;
}

/** Defaults from .env.example, used by the demo. */
export const DEFAULT_PRICING: PricingParams = {
  PRICE_MARGIN: 1,
  PRICE_FIXED_FEE_USD: 5,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Pure price calculation. Real orders call quote() in pricing.ts, which reads the server's settings. */
export function quoteWith(durationS: number, e: PricingParams): Quote {
  const ai = (AI_BASE_USD + AI_PER_SECOND_USD * durationS) * (1 + RETRY_BUFFER);
  const media =
    Math.ceil(durationS / SECONDS_PER_IMAGE) * IMAGE_USD + (VOICE_PER_SECOND_USD + MUSIC_PER_SECOND_USD) * durationS;
  const render = RENDER_PER_SECOND_USD * durationS;
  const cost = ai + media + render;
  const serviceFee = cost * e.PRICE_MARGIN + e.PRICE_FIXED_FEE_USD;
  const beforeFees = cost + serviceFee;
  // Solve total so that total - fee(total) = beforeFees, then round up to a .99 price.
  const gross = (beforeFees + PAYMENT_FEE_FIXED_USD) / (1 - PAYMENT_FEE_RATE);
  const totalUsd = Math.ceil(gross) - 0.01;
  return {
    durationS,
    breakdown: {
      aiUsd: round2(ai),
      mediaUsd: round2(media),
      renderUsd: round2(render),
      serviceFeeUsd: round2(serviceFee),
      paymentProcessingUsd: round2(totalUsd - beforeFees),
    },
    totalUsd,
    totalCents: Math.round(totalUsd * 100),
  };
}
