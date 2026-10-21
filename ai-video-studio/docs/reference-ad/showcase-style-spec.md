The owner sent a reference ad that shows exactly how he wants the site's ads to look. It was made for his bakery "מאפה הבית" (mafehbayit.co.il): 21.8 s, 9:16, with music. Frames from it are attached. Build a new visual style that reproduces this structure, using the customer's own content. Do not publish.

WHAT THE REFERENCE DOES, SCENE BY SCENE
0–5 s, HERO COLLAGE:
- Dark charcoal background (#1b1b1d → #0f0f10) with a soft warm spotlight in the center.
- Product photos are CUTOUTS: the background is removed, so the food floats. 10–14 dishes frame the screen edges (top row, sides, bottom), each with a soft drop shadow, slightly rotated, drifting slowly (parallax, 2–6 px/s).
- Animated steam wisps rise from the hot dishes: thin white curves at 20–35% opacity, slowly rising and fading.
- In the center, a large serif-style Hebrew headline in white ("מנות הדגל"), a thin gold divider line, and a smaller gold subline ("הכי מבוקשים אצלנו").
- The intro starts with a phone mockup showing the site, which pulls back/fades as the collage takes over.

5–11 s, "HOW TO ORDER" ON THE CUSTOMER'S SITE:
- A modern phone mockup with a thin gold border, a dynamic island and rounded corners, centered. Cutout dishes stay around it, blurred (depth of field).
- Inside the phone: the customer's own website/menu UI. In the reference it scrolls the menu, opens a dish, picks toppings (chips getting highlighted in gold), then a toast "נוסף לעגלה ✓".
- Above the phone, a bold gold-gradient Hebrew caption changes with each step: "בוחרים מנה" → "מרכיבים" → "בדיוק כמו שאוהבים" → "נוסף לעגלה" → "ואוספים חם". The caption morphs or blurs between words.

11–17.5 s, DISH CAROUSEL (fast, on the beat):
- One cutout dish per beat, about 0.9 s each (5–7 dishes), centered and large (about 70% of the width), with steam above it.
- The dish name in white at the top ("שקשוקה") and the price under it in gold ("₪40", or "החל מ־₪33").
- The same dish name repeated as huge ghost text behind the dish (about 6% opacity), sliding slowly.
- Cuts land on the music beats, with a short blur/zoom whoosh between dishes.

17.5–21.8 s, END CARD:
- The logo appears inside a glowing ring that pulses once, then settles.
- Tagline in a large gold gradient ("טעם של בית").
- One line of facts separated by "·" ("הזמנה אונליין · איסוף חם מהחנות"), and one gold highlight ("כשר למהדרין").
- A gold gradient pill button with an arrow ("מזמינים באתר ←").
- The domain in a classic serif ("mafehbayit.co.il").
- The music fades out over the last ~3 s; no hard stop and no silence before the end.

AUDIO: one continuous upbeat track at a good loudness (the reference averages about -15 dB, peaks near -0.3 dB), with soft whoosh accents on the carousel cuts.

HOW TO BUILD IT
1. Menu extraction in scanSite:
   - Also return "items": up to 12 dishes/products from the site, each {name (max 18 chars), price exactly as written or "", desc (max 40 chars), image index or null}.
   - Prefer real product photos. Never invent prices.
   - Also return up to 3 short "facts" written on the site (e.g. "כשר למהדרין", "משלוחים", "איסוף עצמי").
   - The customer can edit the items list (name/price) in step 1, like the other details.
2. Cutouts:
   - If an image already has transparency (PNG/WebP with alpha), use it as is.
   - Otherwise remove the background with a commercially usable method: the Lovable AI image-edit model, or an open model whose license allows commercial use (e.g. BiRefNet, MIT, via onnxruntime-web).
   - Do NOT use AGPL or non-commercial models (e.g. @imgly/background-removal is AGPL; RMBG-1.4 is non-commercial).
   - Cache cutouts per order in storage.
   - If cutout fails, fall back to a soft round/vignette mask so the dish still floats.
3. The phone "how to order" sequence:
   - Do not record the real site. Build a stylized replica in the canvas from the scanned data: header with the logo and "העגלה שלי", a section title, dish cards (photo, name, short desc, price badge, a gold "להזמנה" button), a topping-chip screen and a "נוסף לעגלה ✓" toast.
   - Use the business colors.
   - Animate the scroll, the tap (a small ripple) and the chip highlights.
   - If the business has no website/menu, skip this part and give the time to the carousel.
   - The caption words come from Claude, 1–3 words each, matched to the business type: food → "בוחרים מנה" → "מרכיבים" → "נוסף לעגלה"; services → "בוחרים שירות" → "קובעים תור" → "מגיעים".
4. Steam: a procedural steam layer for food (only when Claude marks the dish as hot), never for cold products or non-food.
5. The new style:
   - Add it as a 6th style, "מנות על במה" (product showcase), with id "showcase".
   - Make it the recommended first choice when the business sells food or physical products.
   - Durations: for 20–30 s use the exact structure above; for 45–120 s repeat the carousel with more dishes, add a second phone step and a short "about us" scene with a place photo.
   - The palette comes from the logo; dark + gold is the default when the logo is gold/brown.
   - Keep the 3-directions picker: the directions vary the order, the captions, the hero headline, the carousel dishes, the logo reveal and the music variant.
6. Plan JSON: add for this style a "showcase" object:
   {heroHeadline, heroSub, phoneSteps: [3–5 captions], carousel: [{item index, priceLabel, hot: bool}], facts: [up to 2], highlight: "" or one fact in gold}.
   Update the plan prompt with the rules: real prices only; the dish name on the carousel is exactly the item name; at most one word per caption step is highlighted.
7. Typography:
   - Gold gradient fill for key captions (#f6d77a → #c9962b → #f3d27a, with a subtle shine sweep once).
   - A serif-feel Hebrew display font for the hero headline (e.g. Frank Ruhl Libre / David Libre), a bold sans for captions (Heebo 800 / Assistant 800), and a classic Latin serif for the domain.
   - All text stays inside the safe area and never covers the dish.
8. Carousel timing follows the music beat grid (cut on beats, about 0.9 s per dish at ~130 BPM). The export (WebCodecs) must keep the same timing.

Test:
- Run mafehbayit.co.il through the new style (20 s 9:16 and 30 s 16:9) and compare against the attached reference frames: the hero collage with cutouts and steam, the phone sequence with captions, the carousel with names, prices and ghost text, and the end card with the logo ring, the gold pill and the domain.
- Download it and check the length, the sound and the frames with ffprobe.
- Also test a non-food business (a hair salon site), where the steam must not appear and the phone steps must change.
- Clean up test data and reset MORDECHAI10 to 0.
- Report in Hebrew.

ALSO FIX IN ALL STYLES: what was wrong in the video the site made for him
His video ("מאפה-הבית-kinetic-30s.mp4", 30 s, 9:16) is attached as frames (mine_*.jpg and mine_sheet.jpg). Problems:
1. Headlines don't match the photo.
   - "סלטים עשירים" sits on a shakshuka photo.
   - "מרקים חמים וכריכים בהרכבה אישית" sits on a salad.
   - "מזמינים אונליין ואוספים מהחנות" sits on chicken.
   - Fix: each scene's text must describe the dish/photo it is on. Validate on the server: ask Claude for a one-word "photoSubject" per photo in the scan, and reject or fix plans where the headline names a different dish.
2. Text covers the food. Big white text with highlight boxes sits in the middle of the dish.
   - Keep text in the empty zone (top/bottom gradient) and never over the subject.
   - Use the highlight box at most once per video.
3. It is too slow and static: only 6 scenes of about 4–5 s, each mostly still. The reference cuts every ~0.9 s in the carousel and something is always moving.
   - Use more, shorter scenes for kinetic/fast pace, cut on the beat, and give every scene continuous motion.
4. The opening wastes 3 s: a black screen with gold diagonal stripes and only the name. Then "מאפייה" on a coffee photo, which is a label, not a hook.
   - Open on the best food within 0.5 s, with a hook headline.
5. The prices are tiny badges, and it is unclear which dish they belong to.
   - Show the dish name + price together, big and gold, as in the reference carousel.
6. The end card is a flat mustard background that does not match the dark brand, with a tiny logo, a small CTA and no button.
   - Use the reference end card: brand-dark background, a big logo with a glow ring, a gold gradient tagline, a facts line, a gold pill CTA button and the domain.
7. The tiny "02 / 06" counters and corner labels are unreadable on a phone. Remove them, or make them at least 2.5% of the frame height.
8. Wrong style? The owner says he chose "קולנועי" (cinematic), but the downloaded file is named "מאפה-הבית-kinetic-30s.mp4" and looks kinetic. Check that the style chosen in step 2 is what is saved in the order, sent to writePlan and used by the renderer and the file name. If the selection can silently switch (e.g. clicking a concept card of another style, or a default overriding the choice after sign-in), fix it, and show the chosen style name on the bill and in the player.

NOTE about admin skills: the active skills in the database now include "סגנון הבית של הסטודיו (לפי הרפרנס של מרדכי)", which encodes this reference for the existing styles. Keep the skills system as is; the new style should also follow it.

SECOND REFERENCE THE OWNER LOVES (b_ref*.jpg, b_ref0_sheet.jpg)
A 45 s, 9:16 ad for a phone-photography course. It has a dark background, an orange-gold accent (#F5A623 → #FFB547 gradient), glass cards and glow, and loud continuous music. This is the model for SERVICE / COURSE / PERSONAL-BRAND businesses, and its motion-graphics scenes should be available to every style. Build these as reusable scene kinds in the engine:
1. QUESTION HOOK: a 2-line question at the top, written in direct address ("יש לך חלום ל...?"), with 1–2 key words in the gold accent. It appears word by word. Below it, a 3D-tilted phone floats over a glowing orbit ring on the floor, and its screen cycles the customer's photos every ~0.6 s.
2. VIEWFINDER MONTAGE: full-screen photos cut every ~0.6 s on the beat, with thin camera-viewfinder corner marks.
3. 3D GALLERY: photos on a curved wall (cylinder perspective) that rotates, then a stacked list of wide photos sliding in.
4. PRESENTER + STAT:
   - the person/owner photo as a cutout on the dark background;
   - a small gold tag "נעים להכיר", the name in large type (the surname in gold), and a one-line role under it;
   - a big gold number counting up (0 → 15) with a small label ("שנות ניסיון").
   - Use only real numbers from the site.
5. PROMISE + "WITHOUT" PILLS: a 3-line promise with gold keywords, then pills that pop in one by one ("✕ בלי ציוד יקר", "✕ בלי רקע קודם"), taken from the site's selling points.
6. BIG NUMBER: a huge gold-gradient number ("3") with a unit word ("שבועות") over a subtle textured background (map/lines), and one result line under it.
7. BENEFIT CARDS: a title ("מה תקבל?" with the key word in gold) and 3–5 glass cards that stack in one by one. Each card has an icon in a gold rounded square, a bold title and a small grey subline.
8. PHONE + RESULT: the phone mockup centered, its screen showing photos, with a result line under it.
9. OFFER BADGE:
   - a gold pill "מבצע ..." with a scarcity line ("ל־5 הנרשמים הראשונים בלבד") and a "מתנה" tag on a bonus mockup;
   - ONLY when the customer's details contain a real offer; never invent scarcity.
10. WHATSAPP END CARD: a grid collage of the customer's photos, a big green WhatsApp pill with the icon and the phone number, the line "לפרטים והרשמה בוואטסאפ", and the name in small print. Use it when the CTA is "שולחים וואטסאפ" or the business takes orders by phone.

How the planner uses them:
- Add a per-scene "kind" field: photo (default) | question-hook | montage | gallery3d | presenter-stat | promise-pills | big-number | benefit-cards | phone-result | offer | whatsapp-end.
- Add the fields each kind needs (e.g. stat {value, label}, pills [..], cards [{title, sub, icon}], offer {title, scarcity}).
- Claude picks kinds that fit the business: food → the showcase carousel and phone-ordering scenes; services/courses → question hook, presenter-stat, benefit cards, WhatsApp end.
- Every number, offer and benefit must come from the business details or the site.
- Icons: a small built-in set of line icons (camera, video, clock, chat, gift, star, check, map-pin, phone, cart).
- Motion: everything eases in with a short stagger. Counters count up over ~0.8 s. Cards slide up 24 px and fade in. Nothing is static for more than ~1.5 s.

Also: save both reference videos as admin references (the refs table, scope "all", active) using the attached frames, with notes describing the style above, so the planner sees them as well.

QUALITY LESSONS FROM REELKIT (a video-agent tool the owner found; ideas only, in our own words)
1. Real screens, not drawn ones.
   - For the phone "how to order" scenes, prefer real mobile screenshots of the customer's site (top, menu, a product page) over a drawn replica.
   - Take them server-side with a screenshot API at a 390 px mobile width (e.g. Microlink's free tier, or ScreenshotOne). Hide cookie banners and chat bubbles when possible.
   - Scroll the tall screenshot inside the phone and add a tap ripple.
   - Fall back to the drawn replica only when capture fails.
   - Never show a page that needs a login.
2. Automatic check before the customer sees it. After the plan renders, sample 2 frames per scene plus the frames on each side of every cut, and check in code:
   - text inside the safe area and not cut by the frame;
   - text contrast at least 4.5:1 against what is behind it (sample the pixels under the text box), and if lower, add a shadow/scrim automatically;
   - no empty or near-black frames (except a deliberate fade);
   - the logo visible and not cropped.
   Fix what it finds (shrink, move, scrim) before showing the player. Log the checks in the order for the admin.
3. Loudness. Normalize the exported audio to about -14 LUFS (the social media standard), with a true peak at or below -1 dB, and a fade-out over the last 1–2 s. Show "סאונד ✓" in the download check.
4. Cuts on the beat. Every scene change lands on a music beat (snap the planned cut to the nearest beat within ±0.15 s). Inside a scene, elements enter on beats.
5. Continuity. Each direction picks one "visual thread" that carries across cuts (the gold line, the phone, the ring, a color block) so the cuts feel connected, not like a slideshow.
6. Hebrew text: never show vowel points (niqqud) on screen. Always set the RTL direction. Isolate numbers, prices and the domain (LTR runs) so they don't flip.
7. Three directions: one of the 3 must be clearly unexpected for this business (a different hook type and structure), not 3 variations of the same idea.
8. Revisions change only what the customer asked; everything else stays frame-identical (same seed, same timings).

ENGINE LESSONS (renderer + music), paraphrased from Reelkit's guidance
HEBREW RTL
- Every Hebrew run is RTL, so punctuation sits at the left end. Wrap prices, phone numbers, domains and Latin text in an LTR isolate. Check the rendered string.
- NO masked or wipe reveals for Hebrew words. That means no clip edges, no rising out of a hidden box and no sliding in from off-frame: half-revealed Hebrew reads as other letters.
  - Allowed entrances: a rise of 1–2% of the frame height with opacity reaching 1 within 2 frames; a scale-down onto place from at most 1.25×; a short slide that starts inside the frame.
  - At most 1 word in 3 gets the big scale entrance.
- Letter-by-letter reveals use whole letters, starting from the right. Never animate letter-spacing on RTL text.
- Never auto-wrap: lines are broken upstream by meaning. In a stacked headline all lines share one size; shrink the whole stack. The widest line uses at most ~90% of the safe width.
- A title exits all together.
- One Hebrew family per film, two weights: 800–900 for headlines, 500–700 for labels (e.g. Heebo/Assistant/Rubik; Secular One for headlines; Frank Ruhl Libre/Suez One for editorial; Varela Round/Fredoka for friendly). Wait for the font to load before drawing. No hollow/outlined Hebrew.
- Lists and steps run right-to-left; progress bars still fill left-to-right.
BEAT SYNC (no voice)
- Tempo 107–145 BPM.
- Put the impact at the visual peak of a transition (~4 frames before the boundary for an 8-frame transition), not on the boundary.
- Beat pulses go on the hero element only; decorations move every 4th beat.
- Pin 2–3 moments to the music: a rest in a quiet bar, the reveal where the track returns, and the end card on the last hit. The music generator should create a drop/breakdown; failing that, dip the music to 5% for ~0.8 s before the reveal.
- Sound starts at frame 0. Music fades over the last second.
SOUND DESIGN
- Starting levels: music 0.4 (max 0.5); pops/taps 0.35–0.5; impacts on scene changes 0.5–0.6; swells/risers 0.25–0.35; ambient beds 0.06–0.12. Effects at 0.2–0.3 vanish under the music.
- Normalize effects to a −3 dBFS peak. Master to −14 LUFS with a true peak ≤ −1 dBTP.
- Energetic films: 2–3 hits/s and a swell every 1–2 s, with deliberate silences.
- Use one family of sounds; on repeats, the first is loudest.
- Dish carousel: a pop on each dish arrival at ~0.4.
- End card: a ~1.2 s riser ending on a ~1.5 s chime (0.35 / 0.55), with everything else cleared for the second before.
- Phone speakers: the music needs mid-range content, not only sub-bass.
MOTION
- Springs (stiffness/damping): UI 320/30, containers 170/26, heavy type and logos 120/24.
- Entrances 0.1–0.25 s; exits ~¾ of the entrance time.
- The camera pushes the whole group 2–4% per shot. Never scale text as a bitmap.
- Hit-hold-build: after a move, hold ~0.5 s with nothing new. The picture is still 11–35% of the time, never frozen longer.
- Reading holds: ≥1.5 s before an element leaves; the final card ≥1.5 s.
- An outgoing object leaves in 4–6 frames with a directional blur. Content swapping inside a container gets a 6–10 px blur.
- Phone mockup: ≥70% of the frame width, turned 8–15° with a deep soft shadow; taps dip 4–8%.
- Safe zones on 1080×1920: no text in the top 250 px or the bottom 350 px; 80 px clear at the sides (140 px for must-read text); an extra 140 px clear on the right in the lower half. Other formats: 6% from every edge.
- Type sizes: headline 7–10% of the frame width; supporting text 3.5–5%; nothing under 3%; must-read text ≥90 px tall.
- Text over a photo: dim the photo 0.2–0.45 or use a plate, plus a soft shadow.
- Colour: 60/30/10 ground/surfaces/accent; the accent on one element per frame.
- At most 3 full-screen flashes per second, never a red strobe. Rendering is deterministic (seeded).
- Cutouts: the subject layer can sit in front of the headline. If a cutout's mask covers <3% or >85% of the image, treat it as failed and use the fallback.
CONTINUITY / LAUNCH-FILM SHAPE
- Something survives each cut and keeps moving. At most 2 transition types per film; a flash, whip or glitch is used once. Transitions default to 8 frames (max 20); hard cuts only for bursts and the end card.
- Shot lengths vary at least 4×.
- 15–45 s films use 6–14 shots; the first big picture change comes within 0.7–3.8 s.
- Type goes beside or under the object, never over it. The logo comes first or last and is held ≥1.5 s.
