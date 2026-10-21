# איך מעלים את האתר לאוויר, כך שיעבוד כל הזמן

האתר המלא בנוי משלושה חלקים. כל אחד רץ במקום אחר:

| חלק | מה הוא עושה | איפה הוא רץ | מחיר משוער לחודש |
|---|---|---|---|
| האתר | הדפים, הסריקה, התשלום, הקופונים | [Vercel](https://vercel.com) | ‎$20 (תוכנית Pro) |
| מסד הנתונים | שומר הזמנות, קופונים ובקשות ביטול | [Neon](https://neon.tech) | חינם בהתחלה |
| שרת ההפקה | מכין את הסרטונים (דפדפן + ffmpeg) | [Railway](https://railway.com) | ‎$5 עד $30, לפי כמות הסרטונים |

ובנוסף, תשלום לפי שימוש בלבד, שכבר כלול במחיר שהלקוח משלם:
[Anthropic](https://console.anthropic.com) (Claude), [ElevenLabs](https://elevenlabs.io) (קריין ומוזיקה), [fal.ai](https://fal.ai) (תמונות).

למה Vercel בתשלום ולא בחינם?
- התוכנית החינמית שלהם (Hobby) מיועדת לשימוש אישי, לא לעסק.
- אפשר להתחיל בחינם כל עוד רק אתה בודק את האתר. לפני שפותחים אותו ללקוחות, עוברים ל־Pro.
- המשימה האוטומטית (החזרים, מחיקת מידע ישן) רצה מתוך שרת ההפקה כל 15 דקות, ולכן היא עובדת בכל תוכנית.

## לפני התשלום באשראי: מצב "רק קופון"

אפשר להעלות את כל האתר עכשיו, עוד לפני שיש Paddle:
- `PAYMENTS_ENABLED=false` ו־`NEXT_PUBLIC_PAYMENTS_ENABLED=false`.
- את הגדרות `PADDLE_*` משאירים ריקות.
- בדף התשלום יופיע "תשלום בכרטיס אשראי, בקרוב", וההזמנה עוברת רק עם קוד קופון.
- כש־Paddle מאשרת אותך, ממלאים את ההגדרות שלה ומשנים את שני ההגדרות ל־`true`.

---

## שלב 1: דומיין (כתובת לאתר)

קונים כתובת, למשל `adstudio.co.il`:
- לכתובת שמסתיימת ב־co.il: אצל אחד הרשמים המאושרים ב[רשימת איגוד האינטרנט הישראלי](https://www.isoc.org.il/domains/registrars). עולה בערך ₪50 עד ₪100 לשנה.
- לכתובת ‎.com: למשל ב־[Namecheap](https://www.namecheap.com).

## שלב 2: מסד נתונים ב־Neon

1. נרשמים ב־[neon.tech](https://neon.tech) ולוחצים Create project. כדאי לבחור אזור באירופה, Frankfurt.
2. מעתיקים את ה־Connection string. זה `DATABASE_URL`.
3. ב־SQL Editor מדביקים את כל התוכן של הקובץ `db/schema.sql` ולוחצים Run.
   זה יוצר את הטבלאות ואת הקופון MORDECHAI10.

## שלב 3: המפתחות של שירותי הבינה המלאכותית

| מפתח | איפה יוצרים אותו |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com), בתפריט API keys. צריך להטעין קרדיט. |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io), בפרופיל ואז API keys. בשביל שימוש מסחרי צריך תוכנית בתשלום. |
| `FAL_KEY` | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | [dash.cloudflare.com](https://dash.cloudflare.com), בתפריט Turnstile ואז Add widget. חינם. |

בכל אחד מהם כדאי להגדיר **תקרת הוצאה חודשית**, כדי שלא תגיע הפתעה.

## שלב 4: האתר ב־Vercel

1. נרשמים ב־[vercel.com](https://vercel.com) עם חשבון הגיטהאב. לבדיקות אפשר להתחיל ב־Hobby (חינם), וללקוחות עוברים ל־Pro.
2. לוחצים Add New ואז Project, ובוחרים את הריפו `bakery-stock`.
3. ב־**Root Directory** בוחרים `ai-video-studio`.
4. ב־**Environment Variables** מכניסים את כל ההגדרות מהקובץ `.env.example`:
   - פרטי העסק;
   - `DATABASE_URL`;
   - המפתחות משלב 3;
   - `PAYMENTS_ENABLED=false` ו־`NEXT_PUBLIC_PAYMENTS_ENABLED=false` (עד שיש Paddle);
   - `NEXT_PUBLIC_DEMO_MODE=false`;
   - `CRON_SECRET`: 32 תווים אקראיים או יותר;
   - `IP_HASH_SALT`: 32 תווים אקראיים או יותר.

   כדי ליצור מחרוזת אקראית, אפשר להריץ במחשב `openssl rand -hex 32`.
5. מוסיפים אחסון קבצים: בלשונית Storage, ואז Create, ואז Blob. זה מוסיף לבד את `BLOB_READ_WRITE_TOKEN`.
6. לוחצים Deploy.
7. ב־Settings ואז Domains מחברים את הדומיין משלב 1. אחר כך מעדכנים את `NEXT_PUBLIC_SITE_URL` לכתובת הזו ועושים Redeploy.

## שלב 5: שרת ההפקה ב־Railway

1. נרשמים ב־[railway.com](https://railway.com) עם הגיטהאב, ובוחרים בתוכנית Hobby.
2. לוחצים New Project ואז Deploy from GitHub repo, ובוחרים את `bakery-stock`.
3. בהגדרות השירות, ב־**Root Directory**, כותבים `ai-video-studio`.
   Railway ימצא לבד את הקובץ `railway.json` ויבנה את השרת מ־`worker/Dockerfile`.
4. ב־Variables מכניסים את אותן הגדרות כמו ב־Vercel. השרת צריך במיוחד את אלה:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `FAL_KEY`
   - `BLOB_READ_WRITE_TOKEN`
   - `PAYMENTS_ENABLED` (וכשיהיה Paddle, גם ההגדרות שלו, בשביל החזרים)
   - `IP_HASH_SALT`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`
5. כדי לחסוך בהתחלה, מוסיפים `RENDER_CONCURRENCY=2`. השרת יכין פחות סרטונים במקביל ויעלה פחות.
6. השרת מוגדר להפעיל את עצמו מחדש אם הוא נופל (`restartPolicyType: ALWAYS`), כך שהוא עובד כל הזמן.

## שלב 6: תשלומים

ממשיכים ל[מדריך התשלומים](./payments-guide.md).

## שלב 7: בדיקה לפני שמפרסמים

- [ ] נכנסים לאתר מהטלפון ומהמחשב.
- [ ] מדביקים כתובת אתר ומקבלים קונספטים.
- [ ] מזמינים עם MORDECHAI10 ומקבלים סרטון.
- [ ] מזמינים בכרטיס הניסיון של Paddle ומבטלים, ובודקים שההחזר נוצר.
- [ ] בודקים את תפריט הנגישות ואת הניווט עם המקלדת בלבד (מקש Tab).
- [ ] בודקים שפרטי העסק מופיעים בתחתית ובדף יצירת קשר, בלי סוגריים מרובעים.
- [ ] מבקשים מעורך דין לעבור על המסמכים המשפטיים.

## אם משהו לא עובד

- **האתר:** ב־Vercel, בלשונית Logs.
- **שרת ההפקה:** ב־Railway, בלשונית Deployments ואז View logs.
- **הזמנה תקועה:** המשימה האוטומטית מחזירה כסף לבד אחרי 3 שעות.
