Legal and accuracy fixes for the whole site, from a compliance audit against Israeli law. Do not publish. Apply all of them, then report in Hebrew.

BUSINESS DETAILS
- Remove every bracket placeholder from the legal docs and the footer ([שם העסק המלא], [מספר עוסק], [support@example.com], [שם, טלפון ודוא״ל של רכז/ת הנגישות], [תל אביב-יפו]).
- Make all documents read the business details from the single BUSINESS object (src/lib/data.ts), and add a phone field.
- Render these details in the server HTML, not only after the page's script runs: today /legal/contact and the footer are empty in the server HTML.
- The owner will provide the real values (see the "OWNER DETAILS" section at the end, if filled). Until then, show "פרטי העסק יעודכנו בקרוב" instead of brackets.

FALSE OR OUTDATED STATEMENTS (fix everywhere)
1. "שום דבר לא נשמר אצלנו בשרת" / "ולא יישמרו אצלנו" (FAQ, step-1 notice) is false: photos, logo and plan are stored for 90 days. Replace them with the texts below.
2. Terms §2 mentions voice-over and image generation, which don't exist. Replace it with the §2 text below.
3. The accessibility statement claims the videos have narration with synced captions (false), mentions a Paddle window and a review date that wasn't a real audit. Replace it with the statement below.
4. Paddle is described as the merchant / invoice issuer (pricing section, contact, terms §3, refunds) while card payment is off. Say instead: "כרגע אפשר להזמין רק עם קוד קופון, בלי תשלום."
5. Remove leftover text from the in-Claude version: "אם Claude מבקש אישור להשתמש בחשבון שלכם", "Claude לא היה זמין בתצוגה הזו", and the cancel page's "בגרסה הזו של האתר, שפועלת בתוך Claude…".
6. The progress step "בודק שכל הכותרות נכנסות במסך" is only a 400 ms wait. Make it a real check (see the quality-check section of the showcase spec) or remove it.
7. Music claim: replace "בלי בעיות של זכויות יוצרים" with "מוזיקה שנוצרת במיוחד לכל סרטון, בלי שימוש ביצירות של אחרים".
8. The bill shows "$0" before its script runs (#sumPrice). Make it ₪.
9. VAT: the owner is an עוסק פטור, so he does not charge VAT. Remove the "מע״מ 18%" line from the bill and the words "כולל מע״מ", and show one final ₪ price. (When Paddle goes live as the seller of record, this will be revisited.)
10. Privacy policy recipients: remove ElevenLabs, fal.ai, "render server", Vercel and Paddle. Add the real ones (see below). Remove the false promises "unpaid project deleted after 7 days" and "scanned content after 30 days", and the "private project link".
11. Replace "החברה" with "העסק"/"אנחנו" (he is a sole proprietor).

TEXTS TO PASTE ({…} = business details from BUSINESS)
Footer:
{שם מלא של בעל העסק}, עוסק פטור מס׳ {מספר}, {כתובת}. טלפון: {טלפון} · דוא״ל: {דוא״ל}

Contact page:
יצירת קשר ופרטי העסק
השירות AdStudio מופעל על ידי {שם מלא}, עוסק פטור מס׳ {מספר}.
כתובת למשלוח דואר: {כתובת}
טלפון: {טלפון}
דוא״ל: {דוא״ל}
רכז/ת נגישות: {שם}, {טלפון}, {דוא״ל}
כרגע אפשר להזמין רק עם קוד קופון, בלי תשלום.
לביטול הזמנה: עמוד ״ביטול עסקה״.

TERMS
§1 מי אנחנו: השירות מופעל על ידי {שם מלא}, עוסק פטור מס׳ {מספר}, {כתובת} (״העסק״, ״אנחנו״). טלפון: {טלפון}. דוא״ל: {דוא״ל}.
§2 השירות: השירות קורא את דף הבית הציבורי של אתר שהזנת, או את הפרטים והתמונות שהעלית, ומפיק סרטון פרסומת. מודל הבינה המלאכותית Claude של חברת Anthropic כותב את התסריט והכותרות ובוחר תמונה לכל סצנה. הסרטון נבנה בדפדפן שלך מהתמונות שלך, עם תנועה, כותרות ומוזיקה שנוצרת בקוד. אין בשירות קריינות, ואיננו יוצרים תמונות חדשות. ייתכנו בסרטון טעויות, ולכן עליך לבדוק אותו לפני פרסום.
§2א (after the sentence about Google sign-in): בהתחברות עם Google תתבקש לאשר שאתה בן 18 ומעלה ואת התנאים האלה לפני ההזמנה הראשונה.
§3 תשלום (for now): כרגע ההזמנה אפשרית רק עם קוד קופון שמכסה את מלוא המחיר, ואין חיוב. אפשר לבצע עד 3 הזמנות כאלה ביום לכל חשבון. קוד קופון אינו ניתן להמרה בכסף. כשיופעל תשלום בכרטיס, נעדכן כאן מי גובה את התשלום ומי מנפיק את הקבלה או החשבונית.
§4 add:
• אתה בודק ומאשר כל טענה שמופיעה בסרטון (מחירים, מבצעים, כשרות, בריאות, זמני משלוח) לפני שאתה מפרסם אותו, והאחריות לתוכן הפרסומת שלך היא שלך.
• לא תבקש תוכן שאסור לפי מדיניות השימוש שלנו או לפי מדיניות השימוש של Anthropic. בקשה כזו תסורב.
§5 add: איננו משתמשים בתמונות, בלוגו או בסרטון שלך לשום מטרה אחרת, ולא נציג אותם כדוגמה בלי הסכמה בכתב ממך.
§5א הודעה על הפרת זכויות: אם אתה סבור שסרטון שנוצר בשירות משתמש בתוכן שלך בלי רשות (למשל תמונות שנלקחו מהאתר שלך), כתוב אלינו ל־{דוא״ל} עם פרטיך, התוכן שנפגע וקישור או תיאור של הסרטון. נבדוק תוך 7 ימים, ואם יש בסיס לטענה נמחק את התוכן מהשרתים שלנו ונחסום את החשבון שהפר.
§8 הגבלת אחריות: במידה שהדין מתיר, איננו אחראים לנזק עקיף או לאובדן רווחים, והאחריות שלנו מוגבלת לסכום ששילמת עבור הסרטון. ההגבלה לא חלה על נזק שנגרם בכוונה או ברשלנות רבה, ואינה גורעת מזכויותיך לפי חוק הגנת הצרכן.
§9 שיפוי: אם צד שלישי יתבע אותנו בגלל תוכן שאתה העלית או מסרת, או בגלל הפרה שלך של התנאים, תשפה אותנו על הנזק שנגרם, בתנאי שהודענו לך על התביעה ואפשרנו לך להתגונן.
§11 שינויים: נודיע על שינוי מהותי בתנאים בדוא״ל לבעלי חשבון ובאתר, 14 יום לפני שהוא נכנס לתוקף. על הזמנה שכבר בוצעה חלים התנאים שהיו בתוקף ביום ההזמנה.
§12 דין ושיפוט: על התנאים יחול הדין הישראלי. סכסוך יידון בבית המשפט המוסמך לפי הדין, כולל בית המשפט לתביעות קטנות.

PRIVACY (replace §2, §4, §6, §8, §9)
§2 איזה מידע אנחנו אוספים:
• פרטי חשבון: שם מלא, דוא״ל וסיסמה (שמורה מוצפנת אצל ספק ההתחברות). בהתחברות עם Google נקבל מ־Google את השם והדוא״ל.
• פרטי העסק שמסרת או שנקראו מהאתר: שם, תיאור, מחירים, טלפון, כתובת אתר, לוגו ותמונות.
• פרטי ההזמנה: סגנון, אורך, תסריט, בקשות תיקון, תאריך, קוד קופון.
• מידע טכני: גיבוב מוצפן של כתובת ה־IP, למניעת שימוש לרעה ולהגבלת בקשות.
• סטטיסטיקת ביקורים: איזה עמוד נצפה, מאיזה אתר הגעת (רק שם האתר), פרמטרי קמפיין (UTM), סוג מכשיר, ומזהה מבקר שמתחלף כל יום (גיבוב של IP ודפדפן). אין בזה עוגיות, ואי אפשר לזהות דרכו אדם בין ימים.
• הסכמה לדיוור, אם נתת, עם תאריך ונוסח ההסכמה.
• פניות ביטול: דוא״ל, מספר הזמנה ופרטים שכתבת.
§4 למי המידע מועבר:
• Anthropic (ארה״ב): פרטי העסק והתמונות נשלחים ל־Claude כדי לכתוב את התסריט.
• Lovable Cloud / Supabase ({אזור}): אחסון האתר, מסד הנתונים, החשבונות והתמונות (באחסון פרטי).
• Google: התחברות עם Google (רק אם בחרת בה). [Remove the Google Fonts part if fonts become self-hosted, see below.]
• Cloudflare: הגנה על האתר (עוגייה טכנית אחת, __cf_bm).
• רשויות, רק אם החוק מחייב.
איננו מוכרים מידע.
§6 כמה זמן נשמר המידע:
• תמונות, לוגו ותסריט של הזמנה: 90 יום, ואז נמחקים אוטומטית. קובץ הסרטון עצמו נוצר בדפדפן שלך ואינו נשמר אצלנו.
• שם ודוא״ל בחשבון: עד שתמחק את החשבון.
• רשומת ההזמנה (בלי תמונות ותסריט): 7 שנים, לצורך בירורים וחובות מס.
• פניות ביטול: שנתיים.
• סטטיסטיקת ביקורים: 13 חודשים.
• מידע להגבלת בקשות: יומיים.
§8 עוגיות ואחסון בדפדפן: אין באתר עוגיות פרסום או מעקב. בדפדפן נשמרים: פרטי ההתחברות לחשבון (נחוץ כדי שתישאר מחובר), והעדפות תפריט הנגישות. ספק האירוח (Cloudflare) מציב עוגייה טכנית אחת להגנה מפני תקיפות.
§9 הזכויות שלך: אפשר לראות את ההזמנות שלך ב״ההזמנות שלי״, להוריד את המידע שלך, למחוק את החשבון וכל המידע בכפתור ״מחיקת החשבון וכל המידע״, ולבטל הסכמה לדיוור בכל מייל או בפנייה אלינו. לעיון, לתיקון או לכל בקשה אחרת: {דוא״ל}. נענה תוך 30 יום. אפשר גם לפנות לרשות להגנת הפרטיות.

SHORT NOTICE under the sign-up button and the Google button:
אינך חייב למסור את הפרטים לפי חוק, אבל בלעדיהם אי אפשר לפתוח חשבון. השם והדוא״ל ישמשו לניהול החשבון וההזמנות, ויישמרו אצל ספק האחסון שלנו. דיוור נשלח רק אם סימנת את התיבה. אפשר לעיין במידע, לתקן ולמחוק אותו (פרטים במדיניות הפרטיות).
Marketing checkbox: אשמח לקבל בדוא״ל עדכונים ומבצעים (פרסומת) מ־AdStudio. אפשר להסיר בכל עת.

STEP-1 NOTICE (the line starting "אינכם חייבים"):
אינכם חייבים למסור לנו מידע לפי חוק, אבל בלי הפרטים והתמונות לא נוכל ליצור את הסרטון. הם יישלחו ל־Claude של Anthropic (ארה״ב) לכתיבת התסריט, ויישמרו בחשבון שלכם 90 יום. פרטים וזכויות: מדיניות הפרטיות.

FAQ "מה קורה עם התמונות שלי?":
התמונות ופרטי העסק נשלחים ל־Claude של Anthropic (ארה״ב) כדי לכתוב את התסריט. כדי שתוכלו לחזור לסרטון, התמונות, הלוגו והתסריט נשמרים בחשבון שלכם באחסון פרטי 90 יום ואז נמחקים. אפשר למחוק הכל קודם בעמוד ״ההזמנות שלי״. קובץ הסרטון עצמו נוצר בדפדפן ואינו נשמר אצלנו.

CANCELLATION page:
ביטול עסקה
אפשר לבטל הזמנה באתר (בטופס למטה או בכפתור ״לבטל״ בעמוד ״ההזמנות שלי״), בדוא״ל {דוא״ל}, בטלפון {טלפון} או בדואר ל־{כתובת}. כתבו שם, דוא״ל ומספר הזמנה.
כרגע ההזמנות נעשות עם קופון ואין בהן חיוב. ביטול לפני תחילת ההפקה מחזיר את השימוש בקופון.
כשיופעל תשלום: ביטול לפני תחילת ההפקה מזכה בהחזר מלא. אחרי שההפקה התחילה, זכות הביטול מוגבלת כפי שהחוק מאפשר. כשיש זכות ביטול, ההחזר יינתן תוך 14 יום, בניכוי דמי ביטול של 5% מהמחיר או 100 ש״ח, לפי הנמוך.
נשלח אישור על קבלת הבקשה לדוא״ל שכתבתם.
Refunds §1: אם ההפקה נכשלה, ההזמנה מסומנת ככושלת והשימוש בקופון חוזר אליך אוטומטית. אחרי שיופעל תשלום, ייעשה החזר מלא לאמצעי התשלום.
Refunds §3: replace "עם הקישור הפרטי לפרויקט" with "עם מספר ההזמנה מעמוד ״ההזמנות שלי״".
Checkout checkbox #c-terms: אני בן/בת 18 ומעלה, וקראתי ואני מסכים/ה לתנאי השימוש, למדיניות הפרטיות ולמדיניות הביטולים. ידוע לי שההפקה מתחילה מיד ושאחרי שהתחילה, זכות הביטול מוגבלת כפי שהחוק מאפשר.

ACCESSIBILITY STATEMENT:
הצהרת נגישות
אנחנו פועלים כדי שהאתר יעמוד בתקן הישראלי ת״י 5568 (המבוסס על WCAG 2.0 ברמה AA), לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013.
מה יש באתר: קישור לדילוג לתוכן, ניווט במקלדת עם סימון פוקוס, תוויות לשדות הטפסים, הודעות שגיאה שמוקראות לקוראי מסך, ותפריט נגישות (הגדלת טקסט, ניגודיות גבוהה, הדגשת קישורים, עצירת אנימציות וסרטונים, גופן פשוט).
מגבלות ידועות:
• סרטוני הדוגמה בעמוד הבית מתנגנים אוטומטית. אפשר לעצור אותם בכפתור העצירה שעל כל סרטון או בתפריט הנגישות.
• הסרטונים שהאתר מפיק כוללים טקסט על המסך ומוזיקה בלבד, בלי דיבור ובלי תיאור קולי. כשמפרסמים סרטון, מומלץ לכתוב בתיאור הפוסט את המסר, המחיר ודרכי ההתקשרות.
רכז/ת הנגישות: {שם}, טלפון {טלפון}, דוא״ל {דוא״ל}. נחזור אליכם תוך 3 ימי עסקים.
תאריך הבדיקה האחרונה: {after you run an axe/Lighthouse + keyboard check, write that real date}. עודכן לאחרונה: {תאריך}.

CODE FIXES
1. Order confirmation email after every order. Subject: "אישור הזמנה {מספר} – AdStudio". Body:
   - the order number and date;
   - what was ordered (business, style, length, format, 2 revisions);
   - price, coupon and the amount to pay;
   - 90-day storage;
   - the cancel link and contacts;
   - the business details footer.
   Also send an acknowledgment email for every cancellation request. Use the built-in email capability, or ask me which email service to connect.
2. "ההזמנות שלי":
   - a "לבטל" button per order that pre-fills the cancel form;
   - "להוריד את המידע שלי" (a JSON of the profile and orders);
   - editing the name;
   - a marketing-consent toggle to withdraw.
3. Google sign-in: after the first Google sign-in, show a one-time screen with the 18+ and terms checkboxes before the account can order. Store terms_accepted_at and age_confirmed_at for every account.
4. Marketing consent:
   - store consent_text_version and the source;
   - stop users from writing marketing_consent_at directly: restrict the own-profile UPDATE policy to full_name, and set the timestamps with a trigger or a server function.
5. Retention jobs:
   - rate_limits older than 2 days;
   - cancel_requests older than 2 years, and on account deletion, by email;
   - orders' customer_name/customer_email anonymised after 7 years;
   - admin_audit kept 2 years.
   Photo cleanup must delete the files through the Storage API (deleting storage.objects rows by SQL is blocked/does not remove the files). Make account deletion also remove cancel_requests by the user's email.
6. IP_HASH_SALT: require a long random secret. If it is missing, fail closed (do not hash with an empty salt). Create it if it does not exist.
7. Admin:
   - audit admin reads of personal data (dashboard views) too;
   - add "Disallow: /admin" to robots.txt and <meta name="robots" content="noindex"> on /admin;
   - raise the minimum password to 8 characters (form and auth setting).
8. Accessibility:
   - give each autoplaying, looping video on the home page a visible pause button;
   - don't autoplay when prefers-reduced-motion is set;
   - translate the 404 and error pages to Hebrew;
   - fix the sign-in tabs (role="tab", aria-selected);
   - trap keyboard focus inside dialogs and return it on close.
   Then run an axe/Lighthouse accessibility check and fix what it finds.
9. Self-host the Google Fonts (and the jsDelivr sample media if possible) on the site's own domain, so visitors' IPs don't go to third parties. Then remove those recipients from the privacy policy.
10. Result page: a short tip and a "העתקת תיאור לפוסט" button that copies a text description of the ad (message, price, contacts) generated from the plan, for blind viewers and for post captions.
11. Credits line in the footer or the terms: "חלק מהנחיות העריכה מבוססות על HyperFrames של HeyGen (רישיון Apache-2.0)."

Test:
- every legal page renders the business details in the server HTML (curl the page);
- no brackets remain anywhere (grep);
- the confirmation email arrives;
- Google sign-in shows the 18+ screen;
- an axe report.
Then clean up test data and reset MORDECHAI10 to 0.
