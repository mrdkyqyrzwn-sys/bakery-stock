/**
 * Original visual styles. These are our own creative directions written from scratch -
 * they describe genres and techniques, never a specific brand, creator, film or campaign,
 * so no generated video copies anyone's protected work.
 */
export interface VideoStyle {
  id: string;
  nameHe: string;
  taglineHe: string;
  bestForHe: string;
  /** Visual direction handed to the storyboard writer. */
  direction: string;
  /** CSS gradient for the style card preview. */
  gradient: string;
}

export const STYLES: VideoStyle[] = [
  {
    id: "cinematic",
    nameHe: "קולנועי פרימיום",
    taglineHe: "תאורה דרמטית, תנועות מצלמה איטיות, תחושת סרט",
    bestForHe: "מותגי יוקרה, נדל״ן, מסעדות, תיירות",
    direction:
      "Premium cinematic commercial. Anamorphic look, shallow depth of field, slow dolly and crane moves, golden-hour or moody low-key lighting, rich color grade, elegant pacing that builds to a hero reveal. Orchestral or ambient score, minimal sound design accents.",
    gradient: "linear-gradient(135deg,#1a1a2e 0%,#b8860b 100%)",
  },
  {
    id: "kinetic",
    nameHe: "אנרגטי ודינמי",
    taglineHe: "קצב מהיר, מעברים חדים, אנרגיה של רשתות",
    bestForHe: "אפליקציות, ספורט, אופנה, מבצעים",
    direction:
      "High-energy social ad. Fast cuts on the beat, whip pans, speed ramps, bold saturated colors, punchy macro shots of the product, dynamic handheld energy. Driving electronic beat, whooshes and impact hits.",
    gradient: "linear-gradient(135deg,#ff0080 0%,#7928ca 50%,#00d4ff 100%)",
  },
  {
    id: "lifestyle",
    nameHe: "לייפסטייל אותנטי",
    taglineHe: "אנשים אמיתיים, רגעים טבעיים, תחושה חמה",
    bestForHe: "עסקים מקומיים, שירותים, בריאות, משפחה",
    direction:
      "Warm authentic lifestyle film. Natural window light, candid moments of fictional everyday people enjoying the product or service, soft handheld camera, warm pastel grade, genuine smiles. Gentle acoustic music with light room tone.",
    gradient: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  },
  {
    id: "minimal",
    nameHe: "מינימליסטי נקי",
    taglineHe: "רקעים נקיים, הרבה אוויר, המוצר במרכז",
    bestForHe: "טכנולוגיה, SaaS, קוסמטיקה, עיצוב",
    direction:
      "Clean minimalist product film. Seamless studio backgrounds in the brand palette, precise motorized camera moves, soft diffused light, objects floating or rotating, generous negative space, calm confident pacing. Minimal piano or soft synth, crisp foley.",
    gradient: "linear-gradient(135deg,#e0e0e0 0%,#ffffff 50%,#c9d6ff 100%)",
  },
  {
    id: "playful3d",
    nameHe: "תלת־ממד צבעוני",
    taglineHe: "עולם אנימציה משחקי, צורות רכות, הומור",
    bestForHe: "מותגים צעירים, מזון, ילדים, צעצועים",
    direction:
      "Playful stylized 3D animation. Soft clay-like or glossy toy shapes, bright candy palette, bouncy squash-and-stretch motion, whimsical miniature worlds built around the product idea, light humor. Upbeat quirky music with cartoon sound effects.",
    gradient: "linear-gradient(135deg,#43e97b 0%,#38f9d7 50%,#fa709a 100%)",
  },
];

export function getStyle(id: string): VideoStyle | undefined {
  return STYLES.find((s) => s.id === id);
}

export const DURATIONS = [20, 30, 45, 60, 90, 120] as const;
export type Duration = (typeof DURATIONS)[number];

export const ASPECTS = ["16:9", "9:16"] as const;
export type Aspect = (typeof ASPECTS)[number];

/** Split a target length into model-sized clips (8s, with a final 4/6/8s clip). */
export function planClips(targetSeconds: number): number[] {
  const clips: number[] = [];
  let remaining = targetSeconds;
  while (remaining > 8) {
    clips.push(8);
    remaining -= 8;
  }
  clips.push(remaining <= 4 ? 4 : remaining <= 6 ? 6 : 8);
  return clips;
}
