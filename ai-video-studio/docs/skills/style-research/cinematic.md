# cinematic (קולנועי)

## A. SKILL TEXT (4,173 characters)

```
TITLE: קולנועי – שחור, זהב ואור דרמטי (cinematic)
FEEL: a 20-second film trailer for one product: darkness, one warm light on the hero, slow sure camera, few words, gold that is earned.
HOOK (scene 1). Frame 0 is the thumbnail: the strongest photo, push-in, text already on screen. Never black, never the logo.
- Sensory macro: "רגע לפני הביס", "שכבה אחרי שכבה", "חם. עכשיו."
- Trailer line: "הכל מתחיל בלילה", "יש דברים שלא ממהרים", "לפני שכולם מתעוררים", "נעשה ביד. כל יום."
- Quiet question: "מה מסתתר בפנים?", "כמה זמן לוקח לעשות נכון?", "מתי טעמת באמת?"
- Real number (only if supplied): "48 שעות תסיסה", "שלושה דורות", "6:00 בבוקר".
SEQUENCES (layout in brackets).
20 s A Trailer: photo[fullbleed, push-in] → photo[macro, pull-out] → photo[card + ghost] → photo[split] → offer or price-sticker[macro] → contact-end.
20 s B One hero: photo[macro hook] → photo[fullbleed, pan] → big-number or presenter-stat[card] → photo[fullbleed breather, 1-2 words] → offer[macro] → contact-end.
30 s: A or B + a montage of 3 shots on the music lift (once) + benefit-cards or promise-pills[card] as proof + a breather right before the hero/price.
60 s: chapters of 3 scenes (sense → craft/place → proof), each opening on a fullbleed photo; one montage only; the biggest push-in and the price at 70-80%; last 2 scenes slow down.
LAYOUT/MOTION/TEXTPOS per photo:
- texture, crumb, steam, skin, fabric → macro, push-in or static-drift, top.
- product on a clean/dark ground → card (floating photo, huge ghost), middle.
- place, team, landscape → fullbleed, pan-left/right, top.
- tall subject (cake, bottle, storefront) → fullbleed or card, tilt-up.
- two related photos → split, static-drift.
- bright, white-ground, busy or low-res photo → card, never fullbleed or macro.
9:16: avoid textPos bottom (feed UI covers it). No two equal motions in a row.
PACE, MUSIC, TRANSITIONS. pace calm (food, beauty, luxury, travel) or medium (retail, deals, courses); never fast. Darkest music variant; key -5..-1 for moody, 0..+3 for deals; tempoShift -8..-2 (deals 0..+4). The hero/price scene sits on the music's peak at ~65-80%; one breather before it. transitionFamily: dip-leak = warm, sensory (food, beauty); sweep = clean, modern (retail, services); zoom-through = travel, deals, energy. logoReveal light-sweep (gold glint) or mask-wipe; ink-spread for handmade brands; logoTiming slow (normal for deals). Vary intro/outroVariant between directions.
PALETTE. accent = a muted metallic gold, never lemon yellow: #C9A227, #D4AF37, #B8892E, champagne #E0C38C, bronze #B87333. secondary = warm near-black: #0E0B08, #15110C, or a deep tone (wine #2A0F12, forest #0D1A14, navy #0B1220). If the brand color is deep (wine, emerald, navy), it may replace gold. 3 directions: classic gold/black, champagne/warm brown, brand-deep.
COPY. Trailer cadence: short declarative lines that read as one sentence across scenes ("נלוש ביד." → "נאפה בלילה." → "מחכה לך בבוקר."). Headline 2-4 words, kicker 1 word, sub ≤6 words or near-silent. Emphasis = the sensory, time or craft word ("חם", "בלילה", "ביד"), never the brand or price; leave it empty in about 1 of 3 scenes. Ghost = one material or time noun: "בצק", "אש", "לילה", "שחר", "קרם", "עור". Show premium, don't say it: no "יוקרה", "פרימיום", "חוויה", superlatives, English or puns.
CATEGORIES.
- Food: macro on crust, melt, steam; dip-leak; ghost = ingredient or hour; price on macro.
- Beauty: macro on texture/result, card for products; champagne gold; sweep; write the moment after, not a treatment list.
- Retail: card, product floating; materials and details; sweep.
- Services/courses: fullbleed people and place; big-number/presenter-stat only with real facts; headline = the change; medium.
- Deals/travel: fullbleed landscapes with pans; zoom-through; offer/date-strip on card with a gold price; real dates only.
NEVER:
1. Never open on black, a logo, or an empty letterbox.
2. Never more than one gold element per scene (emphasis word OR price).
3. Never fullbleed or macro a low-res, white-ground or cluttered photo.
4. Never pace fast or use two montages.
5. Never use luxury buzzwords or a dramatic line that isn't true to the business.
```

## B. ENGINE IDEAS
- Light leak as a one-shot overlay at a seam (rise, peak, full recovery in about 0.8-1.2 s, screen blend, warm hue, a different seed each time), never looping and never hiding the subject longer than the cut needs.
- Letterbox bars that open over the first second and close for the end card, but frame 0 always shows the photo (never black).
- Gold text with a slow moving glint (specular sweep) on the emphasis word and the price only; use radial, not full-frame linear, gradients on dark grounds to avoid H.264 banding.
- Title entrances: per-word blur 6 to 0 px in about 0.13 s, words 60-120 ms apart, then dead still; exits 40-50% shorter than entrances.
- Beat-aware timing: put the hero or price on the track's drop; a move that must hit starts 40-190 ms early; one riser into impact per film, with a low whoosh or boom under the dip-leak.
- "Dip cut": darken the outgoing frame about 40% for 3 frames before a hard cut, plus a 4-6 frame near-black hold before the hero reveal for anticipation.
- Calm push-in range 1.00 to 1.08 per scene, with long-tailed ease-outs; any single treatment goes stale after about 6 s, so switch layout or move, never slow the tween.
- Fine animated film grain (low opacity, overlay blend), soft vignette and highlight halation; keep the food's real color (no crushed blacks or heavy LUT on the product).

## C. SOURCES
- https://ads.tiktok.com/help/article/creative-best-practices?lang=en : proposition in the first 3 s, hook within 6 s, 5-10 words a second at most, sound on, keep content in the UI safe zone.
- https://www.filmeditingpro.com/hollywood-trailer-editing-basics-top-visual-devices/ : trailer grammar (copy cards, main title, "button", picture pushes, glows, white flashes, dips to black between sections).
- https://www.zappi.io/web/blog/admiration-feature-magnums-nothing-cracks-like-magnum/ : Magnum's ~20 s spot puts the slogan at the emotional peak in slow motion, one signature sensory cue, then the product fills the screen; 75% brand recall.
- https://visie.io/project/mcdonalds-the-drip-2026 : McDonald's premium spot = macro texture, high-speed freeze, consistent beauty light, slow editorial pace, caramel/golden/crimson palette.
- https://tessl.io/registry/skills/github/nexu-io/open-design/frame-light-leak-cinema : light-leak cinema look (2.39:1 bars, warm leaks only, overlay grain, at most four hues, no blue or neon leaks); no license stated, used for ideas only.
- https://github.com/heygen-com/hyperframes (Apache-2.0) : repo and license.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/motion.md : ease by role, title entrances, holds, exits shorter than entrances, "dip cut", transitions with a cause.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/film.md : music timing (hits start 40-190 ms early, treatment stale after ~6 s, calm push 1.0 to 1.08, cut on phrase changes).
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/look.md : dark-ground gradients band under H.264, accents need 15-25% opacity to survive compression.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/story.md : frame 0 is the thumbnail, never black or a logo; payoff at 60-80%; beat shares.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/sound.md : music as the clock, the riser into impact once per film, sound peaks one frame after the picture.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/vertical.md : 9:16 safe band (no text in the top 168 px or below 1330 px of 1920), 1-2 s shots, a new beat every 2-4 s.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/launch.md : effects-heavy films drew about a tenth of the views of films built on the real result, so the real photo must stay the star.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/media-use/references/media-treatment-recipes.md : the light leak is one motivated beat, not a loop; product polish protects true color.
- https://www.remotion.dev/docs/light-leaks/light-leak : a light leak reveals over the first half and retracts over the second, with a seed and a hue shift (engine idea).
- Search summaries only, not read in full: Meta Reels guidance via https://blog.adobe.com/en/publish/2024/11/04/unlock-potential-reels-best-practices-for-creative-success-using-adobe-creative-cloud (9:16, sound on, safe zone, bottom of frame free) and YouTube ABCD via https://www.thinkwithgoogle.com/intl/en-gb/marketing-strategies/video/guidelines-great-creative (attract early, brand naturally, clear direct CTA).
