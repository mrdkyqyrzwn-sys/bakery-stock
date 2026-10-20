"use client";

import { DEFAULT_PRICING, quoteWith } from "@/lib/pricing-core";
import { DURATIONS, STYLES } from "@/lib/styles";

/**
 * Demo mode (NEXT_PUBLIC_DEMO_MODE=true): the whole customer journey runs in the browser with
 * sample data. No server keys, no database, no AI calls and no payments, so the site can be
 * shown before any account exists.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const ANALYSIS_MS = 7000;
const WRITING_MS = 5000;
const REVIEWING_MS = 4000;
const RENDERING_MS = 8000;

interface DemoState {
  siteUrl: string;
  brandName: string;
  choice: { style: string; durationS: number; aspect: string; priceCents: number } | null;
  paidAt: number | null;
}

// In-memory copy so the demo still works when storage is blocked.
const memory = new Map<string, DemoState>();
const key = (id: string) => `demo-project:${id}`;

function save(id: string, state: DemoState) {
  memory.set(id, state);
  try {
    localStorage.setItem(key(id), JSON.stringify(state));
  } catch {
    // memory copy is enough for this tab
  }
}

function load(id: string): DemoState | null {
  if (memory.has(id)) return memory.get(id)!;
  try {
    const raw = localStorage.getItem(key(id));
    if (raw) {
      const state = JSON.parse(raw) as DemoState;
      memory.set(id, state);
      return state;
    }
  } catch {
    // fall through
  }
  return null;
}

function brandFromUrl(input: string): { siteUrl: string; brandName: string } {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const url = new URL(raw);
    const label = url.hostname.replace(/^www\./, "").split(".")[0] ?? "העסק שלך";
    const brandName = label
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
    return { siteUrl: url.toString(), brandName: brandName || "העסק שלך" };
  } catch {
    return { siteUrl: input, brandName: "העסק שלך" };
  }
}

export async function createDemoProject(url: string): Promise<{ id: string; token: string }> {
  await new Promise((r) => setTimeout(r, ANALYSIS_MS));
  const id = `demo-${Math.random().toString(36).slice(2, 10)}`;
  save(id, { ...brandFromUrl(url), choice: null, paidAt: null });
  return { id, token: "demo" };
}

export function demoCheckout(id: string, choice: { style: string; durationS: number; aspect: string }) {
  const state = load(id);
  if (!state) return;
  const priceCents = quoteWith(choice.durationS, DEFAULT_PRICING).totalCents;
  save(id, { ...state, choice: { ...choice, priceCents }, paidAt: Date.now() });
}

const CONCEPTS: Record<string, (brand: string) => { title_he: string; pitch_he: string }> = {
  cinematic: (b) => ({
    title_he: `${b}: הרגע שבו הכול מתחיל`,
    pitch_he: "אור זהוב, תנועת מצלמה איטית ומוזיקה שנבנית לאט, עד שהמוצר נחשף כגיבור של הסיפור.",
  }),
  kinetic: (b) => ({
    title_he: `אנרגיה של ${b}`,
    pitch_he: "קאטים מהירים בקצב המוזיקה, צבעים חזקים ותקריבים שעוצרים את הגלילה כבר בשנייה הראשונה.",
  }),
  lifestyle: (b) => ({
    title_he: `החיים עם ${b}`,
    pitch_he: "אנשים אמיתיים ברגעים טבעיים ומחויכים, באור חם, מרגישים כמה טוב לבחור בכם.",
  }),
  minimal: () => ({
    title_he: "פשוט. מדויק. שלכם.",
    pitch_he: "רקע נקי בצבעי המותג, תנועה עדינה סביב המוצר והרבה אוויר. אלגנטי ובטוח בעצמו.",
  }),
  playful3d: (b) => ({
    title_he: `העולם הקטן של ${b}`,
    pitch_he: "עולם אנימציה צבעוני ומשחקי שנבנה סביב מה שאתם מוכרים, עם הומור שנשאר בראש.",
  }),
};

export function demoProject(id: string) {
  const state = load(id);
  if (!state) return null;
  const quotes = DURATIONS.map((d) => quoteWith(d, DEFAULT_PRICING));
  const concepts = STYLES.map((s) => ({ style_id: s.id, ...CONCEPTS[s.id](state.brandName) }));

  let status: "draft" | "rendering" | "done" = "draft";
  let stage: "writing" | "reviewing" | "rendering" | null = null;
  let renderProgress = 0;
  if (state.choice && state.paidAt) {
    const elapsed = Date.now() - state.paidAt;
    status = "rendering";
    if (elapsed < WRITING_MS) stage = "writing";
    else if (elapsed < WRITING_MS + REVIEWING_MS) stage = "reviewing";
    else if (elapsed < WRITING_MS + REVIEWING_MS + RENDERING_MS) {
      stage = "rendering";
      renderProgress = Math.floor(((elapsed - WRITING_MS - REVIEWING_MS) / RENDERING_MS) * 100);
    } else {
      status = "done";
    }
  }
  const concept = concepts.find((c) => c.style_id === state.choice?.style) ?? concepts[0];

  return {
    id,
    status,
    siteUrl: state.siteUrl,
    brandName: state.brandName,
    concepts,
    quotes,
    choice: state.choice,
    stage,
    renderProgress,
    videoUrl: status === "done" ? "demo" : null,
    demoLines: [concept.title_he, ...concept.pitch_he.split(/(?<=[.!?])\s+/).filter(Boolean)],
  };
}
