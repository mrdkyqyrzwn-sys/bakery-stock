# Cross-style research (all)

## A. "ALL" SKILL REVISION (2,972 chars)

TITLE: כללי זהב לכל הסגנונות (all)
FRAME 0 IS THE THUMBNAIL. Scene 1 shows the best photo plus the hook line already readable; never a logo, black, an empty photo or a slow fade. The hook must make sense on a paused frame and muted.
THREE LAYERS, ONE IDEA. Photo, headline and music hit the same idea in second 1. The headline sharpens what the photo shows (stake, number, craving); it never describes it ("עוגת שוקולד" over a chocolate cake is wasted). Front-load the strongest word: if only the first 2 words are read, they must stop the thumb.
SPECIFIC BEATS CLEVER. Concrete nouns, real numbers and named products beat vague teasers ("לא תאמינו..."). Name the category of the payoff without giving it away. The payoff must deliver exactly what the hook promised.
SOUND-OFF FIRST. Most feed views are muted: the on-screen words alone must tell the offer. Read only the headlines in order; a stranger must get who, what and why now.
SAFE ZONES (9:16). TikTok and Reels UI cover about the top 13% and the bottom 35% (caption, handle, buttons) plus a right-hand button rail. Put every headline, price and CTA in the band between them: textPos "middle" by default, "top" only for close-ups where the photo needs the middle; never "bottom" for key info in 9:16. In 16:9, "bottom" is fine.
PACE FOR VERTICAL. A new beat (new photo, new text or a camera change) every 2-4 s; payoff before the swipe. In 20-30 s ads, value by second 3 and the offer by about 60% of the runtime.
ONE LINE, FEW WORDS. Max ~6 Hebrew words per line, one line read at a time. Hold = 0.5 s + 0.3 s per word; the last line holds at least 2 s. Never shrink type to fit: cut words.
BRAND LATE, WITH WEIGHT. The brand name is not the hook. It lands once, in the last 5-10% of the runtime: logo, then CTA, then website/phone, held still 2-3 s. One CTA verb only ("להזמנה", "לפרטים בוואטסאפ"), never two competing asks.
HEBREW NUMBERS AND PRICES. Write prices as digits with the shekel sign ("₪49" or "49 ₪", the same way in every scene of a direction). Never write numbers as words. Keep phone numbers and websites in their own field, never inside a Hebrew sentence. Avoid mixing English words, ranges ("10-20") and percentages in one headline: bidi can reorder them. Use 24-hour time ("8:00–14:00") only in `dates`.
ISRAELI MARKET. Direct, warm, spoken Hebrew ("אצלנו", "בואו"), not translated ad-speak. A WhatsApp CTA beats a website for local businesses. Prices are shown with VAT included; never add "מחיר מיוחד" or "לזמן מוגבל" unless stated. Kosher, delivery area, opening hours and parking are real selling points when the details give them.
REWARD WATCHING. Give every 3rd scene something new to see (a macro, a price, a number) so retention does not sag mid-video. Do not end on a dull frame: the last scene returns to the hero photo or the brand color so the loop back to scene 1 feels intended.
SELF-CHECK. Would the hook still work with the first photo alone and no sound? If not, rewrite it.

It replaces the existing "all" rule "keep the bottom ~17% free". Current platform templates reserve far more space at the bottom of the frame (see B1).

## B. ENGINE IDEAS
1. Safe-zone guard for 9:16: keep text, prices and CTA between y≈240 and y≈1260 at 1080×1920, with about 120 px side margins. Right-hand rail: x>930 from y≈840 down. This combines TikTok's template (240 top / 660 bottom / 120 sides) with Meta's ads rule (14% top / 35% bottom / 6% sides). Clamp positions in code and add a debug overlay.
2. Treat frame 0 as the thumbnail: render the hook text fully visible on frame 0, with no fade-in from black, and export a poster frame.
3. Loudness: normalize the final mix to about −14 LUFS integrated with a −1 dBTP ceiling, then measure it (ebur128) after the render instead of assuming it.
4. Phone-speaker EQ: high-pass the music bed around 80–100 Hz and add presence. Most energy below 150 Hz is inaudible on phones.
5. SFX on visible actions only: whoosh on transitions, pop on price/number/sticker landing, one riser into impact at the offer. Place each hit 1 frame after the picture, 3–6 dB over the bed, and rotate 2–3 takes so the same sound never repeats on every cut.
6. Beat grid: compute the frame of each beat as round(i × fps × 60 / BPM), never by adding a rounded value. Cut on beats and change layout on bars. Enter the music at its strongest bar and end on a bar line under the end card.
7. Add 30 ms audio fades at every audio splice and at the start and end, so cuts and loops don't pop.
8. Hold timing: text hold = 0.5 s + 0.3 s/word, last line ≥2 s, auto-extending the scene when copy is long. Exits should be 40–50% shorter than entrances. Overlap the next element at 30–50% of the previous one.
9. Vary title entrances per scene: per-word blur-in (6 px→0, ~0.13 s, words 60–120 ms apart), grey→ink, line blur-in. A landed title stays dead still; the motion moves to the photo or camera.
10. Motion blur on fast moves: 6–12 px on text, 15–20 px full-frame, on the move's axis only, peaking at the fastest frame. Cut at that fastest frame for whip/zoom transitions.
11. RTL text engine: set the canvas direction to "rtl", animate by word never by letter, keep digit/Latin/₪ runs as one unit, and wrap phone numbers, URLs and prices in LRI…PDI (U+2066/U+2069) isolates. Anchor typewriter reveals on the full line width, on the right edge.
12. Loop seam: optionally cross-match the last 0.3 s to scene 1 (same photo or brand color) so the auto-replay feels intended. Also run an automated critic pass on sampled frames at every cut, plus the first and last 2 s.

## C. SKILL REPOS
| Repo / skill | License | Useful for a Hebrew, photo-based, code-rendered ad engine | Adopt? |
|---|---|---|---|
| github.com/heygen-com/hyperframes, skills/hyperframes (+ references story.md, motion.md, sound.md, types/vertical.md, types/launch.md) | Apache-2.0 | The best source found. Vertical safe band (168–1330 px), frame-0 rule, measured motion numbers (eases, blur, holds, overlap), transitions with a cause, SFX table and levels, end-card timing, list of "generated-film tells" | Yes: distill more (already partly used) |
| github.com/heygen-com/hyperframes, skills/media-use | Apache-2.0 | Mixing/ducking, "offer once" gap scan (silent cuts, 10 s+ with no music) | Ideas only (tied to HeyGen CLI) |
| github.com/remotion-dev/skills (remotion-markup, arabic-text.md, captions, sfx.md) | No LICENSE file in repo (Remotion itself uses a company license) | RTL rules: dir=rtl on word spans, animate words not letters, keep digit/Latin runs as one unit. Spring easing, effects list (lightLeak, vignette, zoomBlur) | Ideas only. Don't copy text; sfx list is mostly meme sounds |
| github.com/browser-use/video-use | MIT | 30 ms fades at cuts, measure loudness with ebur128, "critic sub-agent" that roasts the render, self-eval at every cut, final frame hold ≥1 s, never reveal two independent elements at once | Yes, for QC loop ideas |
| github.com/lottiefiles/motion-design-skill | MIT | Motion personality archetypes (Playful 150–300 ms with overshoot, Premium 350–600 ms with no overshoot, Energetic 100–250 ms), enter > exit, distance scales duration | Yes: map archetypes to the 6 styles in engine presets |
| github.com/vyralcontent/content-skills (viral-hooks) | MIT | Three-layer hook (visual / text / audio), front-load the strongest word, specific > clever, anti-patterns (logo intro, vague tease, bait-and-switch) | Ideas only. It contains a self-promotion block (mention "Vyral"), so strip it if reused |
| github.com/anthropics/skills (frontend-design, slack-gif-creator) | Apache-2.0 | Avoiding generic "AI design" defaults, "spend boldness in one place". Nothing video-specific | Already used; nothing new |
| github.com/ComposioHQ/awesome-claude-skills | Apache-2.0 (list) | No real video, motion or ad-creative skill, only automation connectors | No |

## D. SOURCES (read)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/SKILL.md (render contract; 90% action-safe / 80% title-safe)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/vertical.md (1080×1920 safe band 168–1330 px; frame 0 = hook; beat every 2–4 s)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/sound.md (SFX table, peak 1 frame after picture, 3–6 dB over bed, −16…−14 LUFS, −1 dBTP, <150 Hz lost on phones)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/motion.md (eases, blur px, holds 0.5 s + 0.3 s/word, beat-grid math, transitions)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/story.md (beat shares, ≤6 words/line, last line ≥2 s, tells of generated films)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/launch.md (end card: mark in last 5–10%, lockup 15–30% width, CTA held 1.5–3 s)
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/media-use/SKILL.md (media gaps to flag; mixing)
- https://github.com/heygen-com/hyperframes (license Apache-2.0, skills layout)
- https://raw.githubusercontent.com/remotion-dev/skills/main/README.md and .../skills/remotion-best-practices/SKILL.md (skill set overview)
- https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/SKILL.md (effects list, spring easing)
- https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/arabic-text.md (RTL/Hebrew: dir, word-level animation, digit runs)
- https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/sfx.md (SFX set; mostly meme sounds)
- https://raw.githubusercontent.com/browser-use/video-use/main/SKILL.md (30 ms fades, ebur128 measuring, critic pass, hold ≥1 s)
- https://raw.githubusercontent.com/lottiefiles/motion-design-skill/main/skills/motion-design/SKILL.md (+ LICENSE: MIT) (motion personalities, durations)
- https://raw.githubusercontent.com/vyralcontent/content-skills/main/skills/viral-hooks/SKILL.md (hook principles)
- https://raw.githubusercontent.com/vyralcontent/content-skills/main/skills/viral-hooks/references/three-layer-hook.md (3–7 word on-screen text, front-load, works muted)
- https://raw.githubusercontent.com/vyralcontent/content-skills/main/skills/viral-hooks/references/hook-anti-patterns.md (logo intro, vague tease, bait-and-switch)
- https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md (anti-default design rules)
- https://github.com/ComposioHQ/awesome-claude-skills (no video/ad skills of value)
- Safe-zone numbers (search snippets only, not opened): socialync.io/tools/safe-zones/tiktok (TikTok template 240/660/120 px), inro.social Reels checker (Meta 14%/35%/6%)

## Gaps (time limit)
I did not open the official TikTok Creative Center, Meta Reels, Google ABCD or loudness-spec pages, and found no Hebrew-typography or Israeli-market sources. The Hebrew/Israel rules in A are from general knowledge, not this research: VAT-inclusive prices, consistent ₪ format, isolating numbers. Check them before relying on them. On fonts: the worker bundles Heebo. Strong video candidates on Google Fonts are Heebo/Assistant/Rubik (body), Secular One, Karantina and Suez One (display), and Varela Round or Fredoka (playful).
