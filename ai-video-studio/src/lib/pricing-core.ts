import { planClips } from "./styles";

/** Claude usage per video (site analysis + storyboard), estimated generously. */
const AI_WRITING_COST_USD = 0.5;
/** Merge step + storage. */
const POST_PRODUCTION_COST_USD = 0.1;
/** Budget for regenerating clips that fail or get filtered. */
const RETRY_BUFFER = 0.15;
/** Paddle's fee is ~5% + $0.50 per transaction; we price it in so the margin stays real. */
const PAYMENT_FEE_RATE = 0.05;
const PAYMENT_FEE_FIXED_USD = 0.5;

export interface Quote {
  durationS: number;
  generatedSeconds: number;
  clips: number;
  breakdown: {
    videoGenerationUsd: number;
    aiWritingUsd: number;
    postProductionUsd: number;
    serviceFeeUsd: number;
    paymentProcessingUsd: number;
  };
  totalUsd: number;
  totalCents: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PricingParams {
  VIDEO_COST_PER_SECOND_USD: number;
  PRICE_MARGIN: number;
  PRICE_FIXED_FEE_USD: number;
}

/** Defaults from .env.example, used by the demo. */
export const DEFAULT_PRICING: PricingParams = {
  VIDEO_COST_PER_SECOND_USD: 0.4,
  PRICE_MARGIN: 0.5,
  PRICE_FIXED_FEE_USD: 3,
};

/** Pure price calculation. Real orders call quote() in pricing.ts, which reads the server's settings. */
export function quoteWith(durationS: number, e: PricingParams): Quote {
  const clips = planClips(durationS);
  const generatedSeconds = clips.reduce((a, b) => a + b, 0);
  const video = generatedSeconds * e.VIDEO_COST_PER_SECOND_USD * (1 + RETRY_BUFFER);
  const cost = video + AI_WRITING_COST_USD + POST_PRODUCTION_COST_USD;
  const serviceFee = cost * e.PRICE_MARGIN + e.PRICE_FIXED_FEE_USD;
  const beforeFees = cost + serviceFee;
  // Solve total so that total - fee(total) = beforeFees, then round up to a .99 price.
  const gross = (beforeFees + PAYMENT_FEE_FIXED_USD) / (1 - PAYMENT_FEE_RATE);
  const totalUsd = Math.ceil(gross) - 0.01;
  return {
    durationS,
    generatedSeconds,
    clips: clips.length,
    breakdown: {
      videoGenerationUsd: round2(video),
      aiWritingUsd: AI_WRITING_COST_USD,
      postProductionUsd: POST_PRODUCTION_COST_USD,
      serviceFeeUsd: round2(serviceFee),
      paymentProcessingUsd: round2(totalUsd - beforeFees),
    },
    totalUsd,
    totalCents: Math.round(totalUsd * 100),
  };
}
