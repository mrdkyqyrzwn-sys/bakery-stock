## A. SKILL TEXT (4,341 characters)

```
TITLE: מנות על במה (showcase)
FEEL: the products are the stars. Cutouts float on a dark stage, each one big, named and priced, fast and appetizing, ending on a gold card.
HOOK (best cutout on screen at 0.0 s, words by 1 s):
- Craving label: "מנות הדגל", "הכי מבוקשים אצלנו", "טרי מהבוקר", "יוצא חם מהתנור" (only if true).
- Choice question: "מה בא לך היום?", "מתוק או מלוח?", "כבר בחרתם מנה?", "איזו מהן ראשונה?"
- Price first (a real price only): "[item] ב־[priceLabel]", "מגש אירוח [priceLabel]", "ארוחת בוקר [priceLabel]".
- Easy order (website only): "מזמינים בכמה לחיצות", "התפריט כולו בטלפון", "בוחרים, מזמינים, אוספים".
SEQUENCES (scene count follows duration):
A Menu tour 20 s: collage hook → macro hero + price → phone (2 steps) → carousel ×3 → end.
B Price led 20 s: macro hook with price → carousel ×4 → collage "and more" → end.
C No website: collage → macro → carousel ×4 → object-card (menu card) or whatsapp-end.
30 s: add a breather (place/hands photo, static-drift) before the carousel and a second macro; 6-8 carousel items.
60 s+: two carousel blocks of 4-6 split by a breather; 4-5 phone steps; benefit-cards or presenter-stat only from real facts; never repeat an item.
LAYOUT/MOTION/TEXTPOS:
- collage: hook or "range" moment; slow push-in; textPos middle (center stays empty).
- macro: one close-up texture (crumb, glaze, cheese, sauce); push-in; textPos top; the price big and alone.
- carousel: clean single-item shots (plain plate, top/45° angle); static-drift; name top, price under it.
- phone: only with a website; static-drift (the screen moves); caption top.
- Place, people, menu boards, busy tables: never carousel; use them as breathers (pull-out/pan).
- Carousel order: most iconic item first, second-best last; alternate color and shape (round/long, warm/green); within a block run prices high → low.
- hot=true only for visibly hot food (soup, shakshuka, fresh pastry, pizza, coffee). Never salads, cakes, cold drinks or non-food.
PACE/MUSIC/TRANSITIONS: pace fast for pizza, street food, delivery; medium for bakeries/cafés; calm only for premium patisserie (the carousel still cuts on the beat). Upbeat music with a clear beat; tempoShift +4..+8 when fast, 0..+4 when medium. transitionFamily zoom-through for fast/price-led, dissolve for menu tour/premium; the 3 directions differ. logoReveal light-sweep (gold) by default, mask-wipe for photo logos, draw-on for line logos; logoTiming snappy when fast, else normal.
PALETTE: secondary is the stage, near-black charcoal (#141416-#1f1f23) or the brand's darkest tone; food looks better on dark, plain backgrounds. Accent = warm gold (#D4A646-#E8C35A) or a warm brand color (honey, amber, tomato). No cool blue/purple stages for food. Non-food may use deep navy/aubergine with a metallic accent.
COPY:
- heroHeadline 2-3 words (claim or craving); heroSub 2-4 words.
- phoneSteps 1-3 words, plural present verbs: "בוחרים מנה" → "מוסיפים לעגלה" → "אוספים חם" (only the real fulfilment: pickup or delivery).
- Carousel name = the item name exactly; priceLabel exactly as written ("₪40", "החל מ־₪33"). No price → leave it empty. No "רק" or "מבצע" without a real offer.
- emphasis = the craving word, never the price (already gold). One idea per scene.
- ghost = one sensory word ("חם", "פריך", "טרי", "בצק", "מתוק"), never the brand.
- facts ≤2, ≤3 words, from the site; highlight = the strongest trust fact ("כשר למהדרין", "משלוחים").
- Avoid "טעים", "מושלם", "הכי טוב", stacked adjectives, and describing what the viewer already sees.
CATEGORIES:
- Food: as above, with steam on hot items.
- Beauty: jars, bottles and kits as cutouts; hook on result or ingredient; steps "בוחרים טיפול" → "קובעים תור" → "מגיעים"; no steam.
- Retail: price-led hook; collage for range; steps "בוחרים דגם" → "לעגלה" → "עד הבית".
- Services/courses: the carousel shows packages only if they have real prices; otherwise prefer another style.
- Deals/travel: the carousel shows package parts; price-sticker hook; date-strip only with real dates.
NEVER:
- invent, round or reformat a price, or put a name/price on another item's photo;
- steam on cold food or non-food;
- the same item twice, or more than 8 carousel items in 30 s;
- text or price over the product, or a price smaller than its name;
- two transition families in one direction, or an end card held under 1.5 s.
```

## B. ENGINE IDEAS
- Contact shadow under each cutout: a soft ellipse that shrinks and fades as the item floats up, plus one shared light direction. A cutout without a shadow looks pasted on.
- Steam must be animated (looping wisps of 2-4 s), never a still overlay. Only animated steam raised desirability and perceived freshness, and it helped most on weaker photos.
- Lean grabbable items (pastry, slice, sandwich) from bottom-left up to top-right. Viewers preferred this right-hand-grab angle 67% to 33%.
- Run one light sweep of shine over the hero cutout and the gold price. Gloss reads as freshness.
- Carousel entrance: scale from 1.15 with expo.out and 6-12 px motion blur, landing on the beat. The price lands about 2 frames after the name, with a soft pop (~0.4). After landing the text holds still, with no floating loop.
- Phone: zoom into the tapped detail and show a touch-hotspot ripple. Keep the device still while the screen is busy. Use simple dissolves between screens.
- Add an optional automatic carousel order: price high to low inside a block, alternating color and shape, best item first and second-best last.
- End card: a ~1.2 s riser into a chime, with the gold logo ring pulsing on the hit. Change the layout on the bar and cut on the beat.

## C. SOURCES
- https://ads.tiktok.com/help/article/creative-best-practices?lang=en : core message in the first 3 s and the hook within 6 s; 5-10 words/s of text; hook, then selling points, then CTA; test very different creatives.
- https://business.google.com/us/think/future-of-marketing/creative-best-practices-youtube-ads/ : ABCD. Tight framing, large text and strong contrast for mobile; the brand built in naturally; a clear CTA.
- https://ora.ox.ac.uk/objects/uuid:dba2e23a-1abd-432e-8c3a-1e8b0bfa0f1e/files/r8w32r625v : Spence, Motoki & Petit review of what makes food look delicious. Dark, plain backgrounds raise appeal; motion grabs attention; gloss and garnish signal freshness; close-up first-person framing; the right-hand grab angle.
- https://ora.ox.ac.uk/objects/uuid:ac9ea80a-8c24-4ee7-8d96-c636b0be7443/files/rfq977w48k : Zhang, Desebrock, Okajima & Spence, "Hot stuff" (2024). Animated steam raises perceived heat, desirability and freshness; static steam does not; the effect is strongest on less appealing photos.
- https://news.cornell.edu/node/273666 : Cornell menu study. Money symbols and words cue the "pain of paying", so keep the price clean, with no extra money words.
- https://scholar.korea.ac.kr/handle/2021.sw.korea/107304 : Suk, Lee & Lichtenstein (JMR 2012), price order effect: high-to-low order steers choice toward pricier items (abstract level only).
- https://developer.apple.com/app-store/app-previews/ : demos of a flow on a phone. Touch hotspots are allowed; simple dissolves; text on screen long enough to read; one music track throughout.
- https://rotato.app/blog/video-in-mockup : animate the device only in pauses; zoom into details; one thing at a time; start from a screen viewers already know.
- https://www.blendnow.com/blog/add-realistic-shadows-product-photos : removing the background removes the shadow, and the cutout looks fake; keep shadows subtle and the light direction consistent.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes/references/motion.md : montage cuts of 0.13-0.8 s; cut on the beat and change layout on the bar; expo.out arrivals; a landed title stays still; floating loops on titles look machine-made.
- https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/slideshow/SKILL.md : minimum sizes for text that must be read; images that contain text are never cropped.
- https://github.com/remotion-dev/skills : list of the Remotion skills. Nothing specific to showcases; confirms the time-based animation practice.
- Local file /home/user/bakery-stock/ai-video-studio/docs/reference-ad/showcase-style-spec.md : the owner's reference ad, scene by scene (hero collage, phone steps, ~0.9 s carousel, gold end card).
