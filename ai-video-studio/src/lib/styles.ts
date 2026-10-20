/**
 * Original motion-design styles. These are our own creative directions written from scratch:
 * they describe techniques, never a specific brand, creator, film or campaign, so no
 * generated video copies anyone's protected work.
 */
export interface VideoStyle {
  id: string;
  nameHe: string;
  taglineHe: string;
  bestForHe: string;
  /** Visual direction handed to Claude when it writes the animation code. */
  direction: string;
  /** CSS gradient for the style card preview. */
  gradient: string;
}

export const STYLES: VideoStyle[] = [
  {
    id: "cinematic",
    nameHe: "קולנועי פרימיום",
    taglineHe: "רקע עשיר, תנועה איטית ואלגנטית, חשיפה דרמטית",
    bestForHe: "מותגי יוקרה, נדל״ן, מסעדות, תיירות",
    direction:
      "Premium cinematic motion design. Dark rich backgrounds with soft light leaks and vignettes, slow elegant easing, large serif-feeling or thin-weight headlines revealed with masks and letter-spacing animation, slow parallax drift and scale on images, gold or brand-color accents, generous pauses, builds to a hero reveal of the brand.",
    gradient: "linear-gradient(135deg,#1a1a2e 0%,#b8860b 100%)",
  },
  {
    id: "kinetic",
    nameHe: "אנרגטי ודינמי",
    taglineHe: "מילים ענקיות שקופצות, קצב מהיר, אנרגיה של רשתות",
    bestForHe: "אפליקציות, ספורט, אופנה, מבצעים",
    direction:
      "High-energy kinetic typography for social media. Hard cuts every 0.5-1.2s, huge heavy-weight words that slam, scale and shake in, bold saturated color blocks that wipe across the frame, diagonal shapes, quick zooms, strobing accents, punchy overshoot (back-out) easing.",
    gradient: "linear-gradient(135deg,#ff0080 0%,#7928ca 50%,#00d4ff 100%)",
  },
  {
    id: "lifestyle",
    nameHe: "לייפסטייל אותנטי",
    taglineHe: "צבעים חמים, צורות רכות, איורים קטנים ומחייכים",
    bestForHe: "עסקים מקומיים, שירותים, בריאות, משפחה",
    direction:
      "Warm friendly lifestyle motion design. Soft warm pastel palette, rounded cards and pill shapes, gentle floating motion, hand-drawn-feeling SVG doodles and icons (hearts, sparkles, underlines that draw on), friendly rounded headlines, the site's real images in soft rounded frames with slow zoom.",
    gradient: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  },
  {
    id: "minimal",
    nameHe: "מינימליסטי נקי",
    taglineHe: "רקע נקי, קווים מדויקים, הרבה אוויר",
    bestForHe: "טכנולוגיה, SaaS, קוסמטיקה, עיצוב",
    direction:
      "Clean minimalist Swiss-style motion design. Light or off-white background, one accent color from the brand, precise grid layouts, thin lines that draw on, small confident type with lots of negative space, smooth ease-in-out moves, elements sliding along strict axes, calm Apple-keynote pacing.",
    gradient: "linear-gradient(135deg,#e0e0e0 0%,#ffffff 50%,#c9d6ff 100%)",
  },
  {
    id: "playful3d",
    nameHe: "מצויר וצבעוני",
    taglineHe: "דמויות וצורות קופצניות, קונפטי, הומור",
    bestForHe: "מותגים צעירים, מזון, ילדים, צעצועים",
    direction:
      "Playful cartoon motion graphics. Bright candy palette, bouncy squash-and-stretch on shapes and words, simple SVG characters or objects drawn in code that relate to the business, confetti and bursts, wobbly fun shapes, light humor, everything moves with springy overshoot.",
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
