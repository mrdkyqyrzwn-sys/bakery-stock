# Morning notes for the owner (prepared overnight, 22 Oct)

Things the night agent should include in the morning summary, in simple Hebrew.

## 1. Name and domain
- DECIDED 22 Oct ~02:20 Israel time: the owner chose the name "קליפי" (Klipi). The rename was sent to Lovable (item E).
- klipi.com is TAKEN (registered since 2005).
- klipi.co.il LOOKS FREE: a DNS check at ~02:40 Israel time found no such domain. The owner confirmed on 22 Oct that he stays with קליפי. He should buy it at an Israeli registrar (~₪60–100/yr) after confirming it there.
- English backup: kleepi.com also looks free (the Verisign registry check found no record). Other backups: getklipi.com, tryklipi.com, klipiapp.com.
- Trademark check done 22 Oct in the Israeli registry (https://trademarks.justice.gov.il): no mark named קליפי / Klipi / Clipi / Klippi / Kleepi / Klipy. The sound-alike search found only "CLIP" marks, mostly closed or in unrelated classes. The closest active one is "T.V. Clip" (class 41, registered until 2029), a different name. Not legal advice; a lawyer can confirm before registering the name.

### Earlier analysis (kept for reference)
- adstudio.co.il, adstudio.com and adstudio.io are all already taken (they resolve to existing sites).
- "Ad Studio" is also the name of Spotify's well-known advertising product (Spotify Ad Studio), in exactly the same field (ads). Building a brand on that name invites confusion and a trademark risk. A lawyer can confirm, but a distinctive name is safer and better for marketing.
- Recommendation: pick a distinctive name before buying a domain and before printing anything. Candidates whose domains did not resolve at 23:10 UTC (they may be free, but this must be checked at a registrar):
  - פרסומי / Pirsumi: pirsumi.co.il, pirsumi.com. A Hebrew meaning ("my ad"); easy to say.
  - סרטלי / Seretly: seretly.co.il, seretly.com. "My little video"; friendly.
  - AdZap: adzap.co.il, adzap.com. Short and fast.
  - Klipo: klipo.co.il (the .com is taken).
  - Promoti: promoti.co.il (the .com is taken).
- Prices: a .co.il domain costs about ₪60–100 a year at an Israeli registrar (list: https://www.isoc.org.il/domains/registrars). A .com costs about $10–15 a year (e.g. Cloudflare Registrar or Namecheap).
- Connecting it: Lovable → the project → Settings → Domains → Connect domain, then add the DNS records it shows at the registrar. Custom domains need a paid Lovable plan; the owner has Pro.

## 2. Things only the owner can do (unchanged)
- Test the new version on the phone. Then, if happy, say "לפרסם".
- Open an עוסק פטור online (https://www.gov.il/he/service/request-open-exempt-dealer-via-internet), then send the business details: name, number, address, phone, email, accessibility coordinator.
- Set a monthly spend limit at Anthropic: https://console.anthropic.com/settings/limits
- Rotate the coupon MORDECHAI10 (it is written in the code) when going public.
- Later: enable payment setup in the Lovable editor, once there is a business number and a payment provider has been chosen.

## 3. Design notes
- The design follows the installed Lovable workspace skill "adstudio-design-excellence" plus the redesign mockup.
- Contrast: the orange accent is only for buttons, icons and big text, not small text.

## 4. Night run result (22 Oct)
- Sent to Lovable: the iPhone-audio message (items A–E) and the continue-plan message. Lovable ran out of credits partway through the first one. The mockup (step c) and the new products (step d) were NOT sent.
- Done by Lovable (not yet verified end to end):
  - an AAC audio fallback for iPhone (ffmpeg.wasm);
  - the last frame now holds the end card instead of going black;
  - download names are klipi-…;
  - the misleading "try another browser" message is gone;
  - a "לבחור בכיוון הזה" button;
  - unit tests.
- Open issues:
  - the call api.logExportFailure may not exist yet, so the build could be broken;
  - @ffmpeg/core is GPL-2.0-or-later, not LGPL. Lovable added public/licenses/ffmpeg.txt. Fine for a website in practice (the code runs in the browser and source links are given), but a lawyer can confirm.
- Next, after credits reset: re-send step (c), the mockup files already uploaded (8 screenshots + index/picker/css), then step (d).
