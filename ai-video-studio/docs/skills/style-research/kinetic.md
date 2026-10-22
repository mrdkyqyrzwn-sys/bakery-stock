# kinetic "אנרגטי" — research result

## A. SKILL TEXT (4,485 characters)

```
TITLE: אנרגטי – טיפוגרפיה בתנועה (kinetic)

1 FEEL: Words are the hero. Huge bold Hebrew slams on the beat over the client's best photos. Fast, punchy, every word readable, never frantic.

2 HOOKS (frame 1 = thumbnail: strongest photo + 1-3 slammed words; never open on logo, black or plain white; pay the hook off by second 6):
- Stop: "רגע, תסתכלו" / "עצרו לשנייה" / "את זה תרצו לראות"
- Question: "רעבים כבר?" / "מחפשים מתנה?" / "מה עושים בשישי?" / "נמאס לחכות?"
- Call-out: "לכל מי שאוהב בצק" / "למי שמתחתנת בקרוב"
- Contrast: "נראה פשוט. לא פשוט" / "לא עוד עוגה" / "קטן מבחוץ. ענק בפנים"
- Count (real counts only): "שלוש סיבות לעצור" / "ארבעה טעמים, בחירה אחת"

3 SEQUENCES (kind:layout)
A 20s Slam ladder: question-hook:slam > montage:grid > photo:split > promise-pills:wall > price-sticker or big-number:slam > whatsapp-end.
B 30s Countdown: photo:slam ("שלוש סיבות") > photo:split (1) > photo:split (2) > photo:split (3) > montage:grid > benefit-cards:wall > offer:slam > photo:slam (tagline) > contact-end.
C 30s Problem>fix: question-hook:wall (pain) > photo:slam (answer) > montage:grid > object-card:split > promise-pills:wall > price-sticker:slam > photo:split > whatsapp-end.
60s+: hook + 2 scenes, repeat grid>split>wall blocks with new photos, one calm wall at ~50%, offer/price slam on the drop at ~75%, tagline, end. Change layout at least every 6 s; never one layout 3 scenes in a row.

4 PHOTO > LAYOUT
- Clean hero, one subject: slam, push-in, words in the empty area.
- Two subjects, detail+whole, real before/after: split, pan in the whip direction, text on the empty half.
- Busy, dark, low-res photo: wall (blurred), static-drift.
- 4+ similar shots (dishes, products, works): montage:grid, static-drift; the cuts are the motion.
9:16: textPos middle or top; never bottom (app UI covers the lower ~30% and right edge). 16:9: side opposite the subject.

5 PACE, MUSIC, TRANSITIONS
pace fast (medium for 90-120 s, clinics, courses). music: punchiest drum variant, key 0..+4, tempoShift +4..+8 (+2..+4 at 60 s+). transitionFamily: whip by default, one direction all video (right-to-left reads forward in Hebrew); flash only on the hook payoff and the drop/price, 2-3 per video, never two in a row; glitch at most twice, for a contrast reveal (retail, deals, tech). Cuts start slower, tightest at the climax. logoReveal split-join or mask-wipe (light-sweep for deals), logoTiming snappy. Brand name early as a kicker; logo at the end.

6 PALETTE: one loud accent + near-black (#0B0B0F) or off-white secondary; all text 4.5:1 contrast. Accent from the logo, fully saturated: yellow #FFE500, lime #C8FF00, orange #FF5A1F, cobalt #2F5BFF, magenta #FF2E7E. No pure red accent (red flashes are riskiest); a red brand keeps red on text. Max 3 colours.

7 COPY: Staccato. headline 2-4 words (5 max), kicker 1-2, sub ≤7 or empty. One idea per scene; about 1.5 words per second overall, one word per beat in slam scenes. Verb-first or a noun punch: "נאפה הבוקר". Rhythm by repetition: "בצק אמיתי. חמאה אמיתית." emphasis = the payoff word the viewer wants, never filler or the brand. ghost: one short word (≤5 letters) tied to the promise: "חם", "טרי", "עכשיו", "חדש", "בוקר". Avoid full sentences, puns, English, hype words without facts (הכי, מטורף, חובה), clichés (חוויה בלתי נשכחת, איכות ללא פשרות).

8 CATEGORIES
- Food: whip, flash on the bite or price, grid of dishes, warm accent, ghost "חם"/"טרי".
- Beauty: split detail/result, fewer slams, no glitch, headlines 2-3 words.
- Retail: product grid, price-sticker/hanging-price slam, glitch ok, ghost "חדש".
- Services/courses: wall with promise-pills/benefit-cards, timeline-list, date-strip; big-number only from supplied data.
- Deals/travel: offer + date-strip slammed, flash on the price, countdown structure; no invented deadlines.

9 NEVER
- More than 3 flashes in any second (hard cuts between very bright and dark frames count), two flashes in a row, or red/striped flicker.
- More than one word per beat in slam, or headlines over 5 words.
- The same beat length all video: vary it, with one breath before the payoff.
- Text on the subject or in the 9:16 bottom band.
- Glitch on a hero food or beauty shot.
```

## B. ENGINE IDEAS
- Beat grid: place every cut and slam on the music's beat (frames per beat = fps × 60 / BPM, rounded per beat index, not added up), cut on 2- or 4-beat phrases, and put the biggest slam on the drop.
- Flash safety limiter: a global guard that counts luminance flashes, including white flashes and hard cuts between very bright and very dark frames, and allows at most 3 in any sliding 1 s window. Never use saturated red flashes, and cap flash brightness below full white.
- Slam animation: each word scales from about 130% to 100% with an expo-out curve (cubic-bezier(0.16,1,0.3,1)) in 0.13-0.2 s, then holds perfectly still; add a 2-4 px, 2-frame camera shake on impact.
- Whip transition: a 0.13-0.3 s directional smear with 15-20 px full-frame motion blur, the incoming frame sharpening in about 0.13 s, and right-to-left as the default direction for Hebrew.
- Hebrew display type: a heavy condensed Hebrew face (for example Karantina, Secular One or Heebo Black) with leading 0.9-1.0 and slightly negative tracking, a per-word mask reveal, and the hero word auto-fitted to 60-90% of the frame width.
- Sound design: a hit or whoosh effect on each slam and whip, a short riser before the drop, and a one-beat dropout (silence) right before the price or payoff.
- Safe-zone layout for 9:16: keep all words between y=168 and y=1330 of 1920 px and clear of the right-hand button rail.
- Energy curve: cuts get shorter toward the climax, followed by a 0.3-0.75 s hold before the payoff. Offer a "dip cut" (the outgoing frame darkens about 40% for 3 frames) as a safer alternative to a white flash.

## C. SOURCES
- https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html — WCAG 2.3.1: at most 3 flashes per second, a separate stricter test for saturated red, a 25% area / 10-degree field threshold, and the advice to keep flashing areas small.
- https://www.grid.uns.ac.rs/symposium/download/2024/89.pdf — Dolić et al. 2024 study, one word at a time: 90 words per minute (about 1.5 words/s) rated most attractive, 120 WPM had the lowest recall (not significant), and custom Bézier easing improved retention over default ease.
- https://ads.tiktok.com/business/en-US/blog/creative-best-practices-top-performing-ads — 90% of ad recall happens in the first 6 s; text people read raises view time and recall; faster scene changes draw viewers in; CTA cards lift recall.
- https://ads.tiktok.com/business/library/Creative_Codes_ENG.pdf — TikTok Creative Codes: hook, body and close structure; suspense, surprise and emotion hooks (+16% watch time, 1.7x view-through rate); "text pop-ups" and fast scene changes as attention triggers; faster music raises memorability; subtle branding in the hook.
- https://ppc.land/mastering-youtube-advertising-with-the-abcd-framework/ — Google ABCD: several shots and tight framing in the first 5 s, brand within 5 s but woven into the story, CTA as a text card.
- https://blog.adobe.com/en/publish/2024/11/04/unlock-potential-reels-best-practices-for-creative-success-using-adobe-creative-cloud — Meta Reels: 9:16, sound on, safe zones, plus text overlay or an early hook gave 56% higher CTR and a 30% higher 3-second play rate.
- https://www.claudemarket.ai/skills/iart-ai/motion-design-skills/beat-sync-editing — frames-per-beat formula, cutting on 2/4/8-beat phrases (every beat feels frantic), the establish/develop/climax/resolve curve, whips of 6-10 frames, uniform pacing as a mistake.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/motion.md — HyperFrames (Apache-2.0): read time of 0.5 s + 0.3 s per word, landed titles hold still, hero words fill 60-90% of width, whip 0.13-0.3 s, dip cut, 3-5 transition kinds per film.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/vertical.md — 9:16 safe band 168-1330 px, frame 0 is both the hook and the thumbnail, never open on black or a logo, at most 5 words per claim line, shots of 1-2 s, a new beat every 2-4 s.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/film.md — 3-7 words per kinetic scene, a readable word holds at least one beat, any one treatment goes stale after about 6 s, motion lands on the hit with a hard set.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/types/music.md — cut density follows the song's energy, one picture per strong beat only in the chorus, more than 6 s of one treatment as a weakness.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/SKILL.md — map of HyperFrames' motion, caption and vertical references; title-safe 80% box.
- https://raw.githubusercontent.com/iart-ai/kinetic-typography-skills/main/skills/kinetic-typography/SKILL.md — MIT skill: word-level splitting reads as "energetic", expo-out easing, word stagger 40-70 ms, total reveal capped near 800 ms, display line-height 1.1-1.2 with tight tracking.
- https://www.asa.org.uk/news/flashing-images-in-advertising.html — UK ad regulator: ads with flashing must pass a Harding flash test; a Citroën ad that flashed "YES" repeatedly was ruled in breach.
- https://hellocatfood.com/blog/potentially-harmful/ — quotes Ofcom Annex 1 on patterns: more than 5 light-dark stripe pairs is risky, and moving or flashing stripes over 25% of the screen are not allowed.
