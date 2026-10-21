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

/**
 * Israeli consumer law (Consumer Protection Law, section 17B) requires prices shown to consumers in
 * shekels, including VAT. Provider costs are in dollars, so we convert, add VAT, and charge in ILS.
 * Paddle takes the price as tax-inclusive, so the buyer pays exactly the price shown.
 */
export interface Quote {
  durationS: number;
  breakdown: {
    aiIls: number;
    mediaIls: number;
    renderIls: number;
    serviceFeeIls: number;
    paymentProcessingIls: number;
    vatIls: number;
  };
  totalIls: number;
  /** Total in agorot (1/100 shekel), the unit Paddle expects. */
  totalAgorot: number;
}

export interface PricingParams {
  PRICE_MARGIN: number;
  PRICE_FIXED_FEE_USD: number;
  USD_ILS_RATE: number;
  VAT_RATE: number;
}

/** Defaults from .env.example, used by the demo. */
export const DEFAULT_PRICING: PricingParams = {
  PRICE_MARGIN: 1,
  PRICE_FIXED_FEE_USD: 5,
  USD_ILS_RATE: 3.7,
  VAT_RATE: 0.18,
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
  const r = e.USD_ILS_RATE;
  const netIls = (cost + serviceFee) * r;
  // Solve total so that, after VAT and Paddle's fee (on the full amount), we keep netIls; round up to a ...9 price.
  const gross = (netIls * (1 + e.VAT_RATE) + PAYMENT_FEE_FIXED_USD * r) / (1 - PAYMENT_FEE_RATE);
  const totalIls = Math.ceil((gross + 1) / 10) * 10 - 1;
  const vatIls = (totalIls * e.VAT_RATE) / (1 + e.VAT_RATE);
  return {
    durationS,
    breakdown: {
      aiIls: round2(ai * r),
      mediaIls: round2(media * r),
      renderIls: round2(render * r),
      serviceFeeIls: round2(serviceFee * r),
      paymentProcessingIls: round2(totalIls - vatIls - netIls),
      vatIls: round2(vatIls),
    },
    totalIls,
    totalAgorot: totalIls * 100,
  };
}
