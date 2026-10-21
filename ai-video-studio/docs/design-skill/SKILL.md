---
name: adstudio-design-excellence
description: Design rules for making AdStudio's Hebrew RTL marketing site and app look premium, distinctive and polished (not generic AI-built). Use for any UI, layout, styling, animation or visual change.
---

# AdStudio design excellence

Real sample videos are the hero material. Put the boldness in one place per screen and keep the rest quiet. These rules override habit and any other guide.

## Fixed system
- Ground #FAF9F6, ink #16161D. One dark cinema band (#0E0E13), only for the video showcase.
- Accent #F0562A: fills, focus rings, progress, active tabs, and text 24px or larger. Small accent text: #C2410C on light, #F0562A on dark. Never white text on #F0562A.
- Primary buttons: #16161D with #FAF9F6 text, inverted on dark. Muted text: #5C5A55 on light, #A1A1AA on dark. Errors: #B42318 plus an icon, never the accent.
- shadcn: background #FAF9F6, foreground and primary #16161D, ring #F0562A. Add `brand` tokens; leave `accent` as the hover surface.
- Heebo 800/700 for display, Assistant for body and UI, Frank Ruhl Libre 700 for accent words only. Icons: lucide-react only. No emoji anywhere.
- `dir="rtl" lang="he"`. Logical utilities (ms/me/ps/pe/start/end) and `gap`. Put `<bdi>` around Latin text and numbers. No italics, uppercase or wide tracking. Mirror chevrons, but never Play or the video timeline.

## Type and space
- 5 sizes at most. H1 `clamp(2.75rem,6vw,5.5rem)`, leading 1.05, balanced, at most 2 lines at every width. Body: Assistant 18px/1.65, 65ch max, full ink.
- Serif accent: at most 1 per screen and 3 per page. Change only the font (same color, no underline), and only on the noun that matters.
- Asymmetric grid with equal outer margins and 120–160px between sections. Neighboring sections never share a layout.

## Hero
Start side: the H1, one sentence of true facts, and TWO equal, obvious entry options (the owner insists): "יש לי אתר" = URL field + primary button "ליצור פרסומת", and "אין לי אתר" = a secondary button of the same height and weight, "ליצור מתמונות" (ImagePlus icon). End side: a real sample ad playing in a 9:16 frame that takes up at least 40% of the screen and overlaps the next band. Add one live element, a style switcher that swaps between real samples. The only proof is real samples. On mobile the order is text, then both entry options (above the fold), then the video.

## Depth, grain, glow
On light areas, separate surfaces with tone steps (#FFFFFF raised, #F2F0EB sunken), not borders. Shadows go only on floating things: `0 24px 48px -16px rgb(22 22 29/.25)`. The cinema band gets static grain and a glow taken from the video itself (set `--poster` inline), never a neon halo:
```css
.cinema{position:relative;isolation:isolate;background:#0E0E13}
.cinema::before{content:"";position:absolute;inset:0;z-index:-1;opacity:.06;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.ambient{position:relative}
.ambient::before{content:"";position:absolute;inset:8%;z-index:-1;background:var(--poster) center/cover;filter:blur(48px) saturate(1.5);opacity:.5}
```

## Motion
- Easing `cubic-bezier(.22,1,.36,1)`. Press 140ms, hover 180ms, UI 240ms, reveals 700–900ms. Exits are faster than entrances. No bounce.
- One signature move, "house lights down": the glow fades up as the cinema band enters. Hero lines rise once on load and finish by 1.2s. Reveal 3 groups per page at most.
- Content is visible by default:
```css
@supports (animation-timeline:view()){@media (prefers-reduced-motion:no-preference){
.reveal{animation:rise linear both;animation-timeline:view();animation-range:entry 0% entry 40%}}}
@keyframes rise{from{opacity:0;transform:translateY(24px)}}
```
- Reduced motion: no movement and no autoplay; opacity and color feedback stay. Animate only transform, opacity and clip-path. Never `transition: all`.

## Video cards
- `aspect-[9/16]`, a sized poster, `muted playsInline loop preload="metadata"`. Play only while visible, pause offscreen and lazy-load below the fold.
- Media radius 24px (phone frames 40px), buttons and inputs radius 12px, chips fully rounded. Caption: the style name and <bdi>30</bdi> שניות.
- Hover only inside `@media (hover:hover)`: the media scales to 1.03 within its frame. Play and mute sit in a solid 48px circle with a Hebrew `aria-label`; mute uses `aria-pressed`.

## Controls and states
- Button: `h-12 px-6 rounded-xl bg-primary hover:bg-black active:scale-[.97] focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`. Targets at least 44px. No arrows.
- Loading: the button keeps its width and shows Loader2 with "יוצר…". Generation shows its real steps in `aria-live="polite"`, never fake percentages. Skeletons take the final shape.
- Empty: one sentence, the action and a sample poster. Error: what happened, how to fix it and a retry, placed next to the field, with the input kept and no apology. A success message repeats the button's verb.

## AI-slop tells (never)
- Labels or pill badges above headings.
- Gradient text, purple gradients, glowing buttons.
- Rows of identical icon cards; cards inside cards.
- Everything centered; glass panels.
- Sparkles icons used to mean "AI".
- Middle-dot strings, monospace labels, 01/02/03 that isn't a real sequence.
- Fake stats, logos, stars or testimonials.
- Lorem ipsum; stock photos as decoration. (Sample ads rendered from stock photos are fine only when labelled "דוגמה שהופקה מתמונות סטוק".)
- Fade-up on every section; the same grey shadow and radius on everything.
- Hype words ("קסם", "מהפכני") and empty calls to action ("גלו עוד").

## Before shipping
1. At 390, 768 and 1440: H1 at most 2 lines, no overflow.
2. Keyboard only, dark band included: focus is always visible.
3. Reduced motion on: nothing hidden or autoplaying.
4. AA contrast in every state; no emoji or lorem left in the code.
5. LCP under 2.5s, CLS under 0.1.
6. Every state exists: hover, focus, active, disabled, loading, empty, error.
7. Remove one ornament.

Sources (paraphrased): Anthropic frontend-design, Impeccable, Taste Skill, Emil Kowalski, Vercel, UI UX Pro Max; see SOURCES.md.
