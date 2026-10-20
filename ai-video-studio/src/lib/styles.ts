/**
 * Original editing styles. These are our own creative directions written from scratch:
 * they describe techniques, never a specific brand, creator, film or campaign, so no
 * generated video copies anyone's protected work.
 */
export interface VideoStyle {
  id: string;
  nameHe: string;
  taglineHe: string;
  bestForHe: string;
  /** Direction handed to Claude when it plans and edits the commercial. */
  direction: string;
  /** CSS gradient for the style card preview. */
  gradient: string;
}

export const STYLES: VideoStyle[] = [
  {
    id: "cinematic",
    nameHe: "קולנועי פרימיום",
    taglineHe: "תנועת מצלמה איטית, צבעים עשירים, תחושת סרט",
    bestForHe: "מותגי יוקרה, נדל״ן, מסעדות, תיירות",
    direction:
      "Premium cinematic commercial. Slow, elegant push-ins and parallax on the photos, rich contrasty color grade with warm highlights, light leaks and soft vignettes, dissolves and slow masked reveals, refined thin-to-bold headlines with generous letter-spacing, calm confident narration, builds to a hero reveal of the brand.",
    gradient: "linear-gradient(135deg,#1a1a2e 0%,#b8860b 100%)",
  },
  {
    id: "kinetic",
    nameHe: "אנרגטי ודינמי",
    taglineHe: "קאטים מהירים בקצב, זומים ומילים ענקיות",
    bestForHe: "אפליקציות, ספורט, אופנה, מבצעים",
    direction:
      "High-energy social-media ad. Fast cuts on the beat, punch-in zooms and whip pans across the photos, flash and glitch transitions, saturated punchy grade, huge heavy-weight words that slam in with overshoot, bold color blocks wiping across, energetic narration and driving music.",
    gradient: "linear-gradient(135deg,#ff0080 0%,#7928ca 50%,#00d4ff 100%)",
  },
  {
    id: "lifestyle",
    nameHe: "לייפסטייל אותנטי",
    taglineHe: "אור חם, תנועה רכה, תחושה אמיתית ואישית",
    bestForHe: "עסקים מקומיים, שירותים, בריאות, משפחה",
    direction:
      "Warm authentic lifestyle commercial. Soft natural grade with warm skin tones, gentle handheld-feeling drift on the photos, soft dissolves, photos sometimes framed in rounded cards over a warm background, friendly rounded headlines with small hand-drawn underlines, warm conversational narration and acoustic music.",
    gradient: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  },
  {
    id: "minimal",
    nameHe: "מינימליסטי נקי",
    taglineHe: "עיצוב נקי, הרבה אוויר, יוקרה שקטה",
    bestForHe: "טכנולוגיה, SaaS, קוסמטיקה, עיצוב",
    direction:
      "Clean minimalist premium commercial. Photos placed in precise grid layouts on light or off-white space, crisp neutral grade, smooth axis-aligned slides and mask reveals, thin lines that draw on, one brand accent color, small confident type with lots of negative space, calm keynote-like pacing and narration.",
    gradient: "linear-gradient(135deg,#e0e0e0 0%,#ffffff 50%,#c9d6ff 100%)",
  },
  {
    id: "playful3d",
    nameHe: "צבעוני ושמח",
    taglineHe: "תמונות קופצות כמו מדבקות, צבעים וקונפטי",
    bestForHe: "מותגים צעירים, מזון, ילדים, צעצועים",
    direction:
      "Fun colorful commercial. Bright saturated grade, photos as bouncy cut-out cards and stickers with white borders, springy pop-in transitions, colorful shapes, bursts and confetti accents around the photos, bold playful headlines, upbeat cheerful narration and music.",
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
