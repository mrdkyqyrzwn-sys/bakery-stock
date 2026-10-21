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
