URGENT BUG (do this FIRST, before the remaining phases): downloading on iPhone fails with no audio.

What the owner saw (iPhone, Safari/WebKit, the published site, order "הטשולנט של שמיל", 30 s 9:16 cinematic, 21 Oct ~19:55 UTC):
- the player reached 0:30 / 0:30 and showed a black frame at the end;
- the download bar filled, then: "הקובץ שנוצר בלי שמע, אז לא שמרנו אותו. נסו שוב, או בדפדפן אחר."
- On iPhone every browser (Chrome too) is WebKit, so "try another browser" doesn't help. iPhone is the main device of our customers, so this blocks the whole product.

Likely cause: WebKit's WebCodecs support. VideoEncoder exists, but AudioEncoder is missing or doesn't support AAC (mp4a.40.2) on many iOS versions. The MediaRecorder fallback then records canvas + WebAudio with no audio track, or the AudioContext is suspended.

Fix:
1. Feature-detect with AudioEncoder.isConfigSupported for 'mp4a.40.2' and then 'opus'. Pick the first that works.
2. If neither is supported: render the music offline (OfflineAudioContext, the same deterministic seed) to PCM and encode it in JS/WASM with a permissively licensed encoder: libopus compiled to WASM (BSD), or an AAC encoder with a license that allows commercial use (NOT fdk-aac). Mux it with the video via mp4-muxer (it supports Opus-in-MP4, which iOS 17+ plays) or AAC.
3. Make sure any AudioContext is created or resumed inside the click handler of "להוריד את הסרטון". The iPhone silent switch must not silence the export.
4. Never tell iPhone users "try another browser". If the export truly can't include audio, offer the video without sound plus a separate music file (.m4a/.wav) with clear instructions, and log the device and browser for the admin.
5. Also fix the black last frame: the player and the export should end on the end card (hold the final frame), not on black.
6. Test on real WebKit:
   - use Playwright's WebKit engine if it is available in your sandbox, otherwise emulate the missing AudioEncoder by stubbing it to undefined in Chromium and verify the fallback path;
   - check the resulting file with ffprobe: an audio stream is present, the duration is within 0.3 s, and the last frame is not black.
7. Note: the order "הטשולנט של שמיל" on the published site couldn't be downloaded. I gave the owner one more use on his coupon FREE-ZJNMQT, so don't touch that coupon.
Do not publish. Report in Hebrew.

TWO MORE OWNER REQUESTS (do them together with the redesign; keep them even if the redesign changes the layout):
A. The "3 directions" picker (שלושה כיוונים לסרטון שלכם): the owner says there is no clear button to pick a direction, and the cards look blurry/washed out.
   - Each card gets a big, clear primary button "לבחור בכיוון הזה" (full card width, 48px+, the primary button style, an icon like Check or ArrowLeft) under the preview.
   - Clicking the preview plays it; clicking the button selects it.
   - Remove any blur, low opacity or dimming on the cards. Only after a selection, the other cards can dim slightly.
   - The preview canvases must be sharp: render them at devicePixelRatio, never scale up a small canvas with CSS.
   - Show each direction's name and one-line description clearly above the button.
   - On mobile, stack the cards vertically, each with its own button visible without extra taps.
B. Home page: people without a website need an entry point as clear as the URL one.
   - Under the hero headline, offer TWO equal, obvious options:
     1. "יש לי אתר": the URL field plus the primary button "ליצור פרסומת";
     2. "אין לי אתר": a large secondary button of the same height and visual weight, "ליצור מתמונות", with an ImagePlus icon, opening the create flow at the photo upload step.
   - On mobile both are full width, stacked, and both visible above the fold. Use the same treatment in the final CTA band.
   - Replace the small text link "אין אתר? מתחילים מתמונות".
C. ALL SAMPLE VIDEOS ON THE SITE MUST BE REMADE, much more attractive and polished. The owner wants every example video replaced: the home hero, the 5/6 styles strip, the cinema showcase, the before→after, the aside preview in the create flow and the style picker previews.
   - Make them only AFTER the engine improvements (Phase 1/2: showcase style, scene kinds, beat sync, sound design, quality check) are done, using the new engine itself, so they are honest outputs of the product.
   - Make one strong sample per category, each in its best-fitting style:
     - food: a bakery/pizzeria in the showcase style;
     - beauty: a salon;
     - a shop/retail product;
     - services: a course or clinic with the question hook, presenter-stat and benefit cards;
     - a deal/event: a travel or event offer with the price sticker, object card and hanging price.
     Make both 9:16 and 16:9 versions.
   - Use high-quality, commercially licensed stock photos (Pexels/Unsplash license) of fictional businesses with fictional names. Label them "דוגמה שהופקה מתמונות סטוק". Never invent claims that look real (no real brand names, no real phone numbers; use clearly fictional ones like 050-0000000).
   - Quality bar: compare each sample against the owner's three reference ads (bakery, course, travel). Every sample must have:
     - a hook in the first second;
     - continuous motion and beat-synced cuts;
     - cutouts where relevant;
     - the gold-quality end card;
     - loud, clean music.
     Render at 1080×1920 / 1920×1080, 30 fps, H.264 + AAC where possible, with web-optimized file sizes (posters as WebP), hosted on the site's own domain.
   - Show me a contact sheet of every new sample in your report.
D. LOWER THE AI COST PER ORDER, without making customers wait or lowering quality:
   - Use Anthropic prompt caching (cache_control) for the fixed parts of every prompt: the system/instructions, the admin skills block and the reference notes. These are identical across orders.
   - Downscale every image sent to Claude to at most 1024 px on the long side (JPEG quality ~80) before sending. Send at most 8 customer photos plus the logo, and at most 4 reference frames.
   - Keep the 3 directions in one call, but cap max_tokens sensibly, ask for compact JSON (no prose), and don't resend unchanged images in revisions when the change is text-only.
   - Add a cost log per order: model, input/output/cached tokens, and the estimated $ and ₪ for every Claude call (scan, concepts, plan, revisions). Show it in /admin (orders tab, plus a monthly total on the statistics tab) so the owner sees the real cost per video.
   - Don't change which models are used without telling me.
