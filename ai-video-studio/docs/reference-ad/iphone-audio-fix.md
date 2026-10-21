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
