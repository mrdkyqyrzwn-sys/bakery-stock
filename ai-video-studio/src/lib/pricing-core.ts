/**
 * Costs per video. The video is animation code that Claude writes and we render ourselves,
 * so there is no per-second video-model fee: the costs are Claude's tokens and render time.
 */
/** Claude: site analysis, writing the animation, visual review and fixes. Longer videos need more code. */
const AI_BASE_USD = 0.6;
const AI_PER_SECOND_USD = 0.02;
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
  const render = RENDER_PER_SECOND_USD * durationS;
  const cost = ai + render;
  const serviceFee = cost * e.PRICE_MARGIN + e.PRICE_FIXED_FEE_USD;
  const beforeFees = cost + serviceFee;
  // Solve total so that total - fee(total) = beforeFees, then round up to a .99 price.
  const gross = (beforeFees + PAYMENT_FEE_FIXED_USD) / (1 - PAYMENT_FEE_RATE);
  const totalUsd = Math.ceil(gross) - 0.01;
  return {
    durationS,
    breakdown: {
      aiUsd: round2(ai),
      renderUsd: round2(render),
      serviceFeeUsd: round2(serviceFee),
      paymentProcessingUsd: round2(totalUsd - beforeFees),
    },
    totalUsd,
    totalCents: Math.round(totalUsd * 100),
  };
}
