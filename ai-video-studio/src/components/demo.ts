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
const PLANNING_MS = 3000;
const MEDIA_MS = 4000;
const WRITING_MS = 4000;
const REVIEWING_MS = 3000;
const RENDERING_MS = 6000;

interface DemoState {
  photos?: string[];
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

/** Photos picked in the demo stay in this tab only (object URLs); nothing is uploaded. */
export function demoSetPhotos(id: string, photos: string[]) {
  const state = load(id);
  if (state) save(id, { ...state, photos });
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
    pitch_he: "תנועת מצלמה איטית על התמונות שלכם, צבעים עשירים וקריינות בטוחה, עד שהמותג נחשף כגיבור של הסיפור.",
  }),
  kinetic: (b) => ({
    title_he: `אנרגיה של ${b}`,
    pitch_he: "קאטים מהירים בקצב המוזיקה, זומים ומילים ענקיות שעוצרים את הגלילה כבר בשנייה הראשונה.",
  }),
  lifestyle: (b) => ({
    title_he: `החיים עם ${b}`,
    pitch_he: "רגעים אמיתיים באור חם וקריינות אישית, שמרגישה כמו המלצה של חבר.",
  }),
  minimal: () => ({
    title_he: "פשוט. מדויק. שלכם.",
    pitch_he: "התמונות שלכם בקומפוזיציות נקיות עם הרבה אוויר וצבע אחד של המותג. אלגנטי ובטוח בעצמו.",
  }),
  playful3d: (b) => ({
    title_he: `העולם הקטן של ${b}`,
    pitch_he: "התמונות קופצות למסך כמו מדבקות צבעוניות, עם קונפטי ומוזיקה שמחה שנשארת בראש.",
  }),
};

export function demoProject(id: string) {
  const state = load(id);
  if (!state) return null;
  const quotes = DURATIONS.map((d) => quoteWith(d, DEFAULT_PRICING));
  const concepts = STYLES.map((s) => ({ style_id: s.id, ...CONCEPTS[s.id](state.brandName) }));

  let status: "draft" | "rendering" | "done" = "draft";
  let stage: "planning" | "media" | "writing" | "reviewing" | "rendering" | null = null;
  let renderProgress = 0;
  if (state.choice && state.paidAt) {
    const elapsed = Date.now() - state.paidAt;
    status = "rendering";
    const marks = [PLANNING_MS, MEDIA_MS, WRITING_MS, REVIEWING_MS];
    const names = ["planning", "media", "writing", "reviewing"] as const;
    let at = 0;
    stage = null;
    for (const [i, len] of marks.entries()) {
      if (elapsed < at + len) {
        stage = names[i];
        break;
      }
      at += len;
    }
    if (!stage) {
      if (elapsed < at + RENDERING_MS) {
        stage = "rendering";
        renderProgress = Math.floor(((elapsed - at) / RENDERING_MS) * 100);
      } else {
        status = "done";
      }
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
    uploads: state.photos ?? [],
    stage,
    renderProgress,
    videoUrl: status === "done" ? "demo" : null,
    demoLines: [concept.title_he, ...concept.pitch_he.split(/(?<=[.!?])\s+/).filter(Boolean)],
  };
}
