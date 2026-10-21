# איך מחברים תשלום באשראי ([Paddle](https://www.paddle.com))

Paddle היא חברת סליקה שמשמשת "מוכר רשמי" (Merchant of Record). במילים פשוטות: הלקוח קונה מ־Paddle,
ו־Paddle מעבירה לך את הכסף. היא גובה את האשראי, מנפיקה חשבונית, מטפלת במע״מ ובהחזרים.
העמלה שלה היא בערך 5% ועוד 50 סנט לעסקה. היא כבר כלולה במחיר באתר.

## שלב 0: מה צריך לפני שמתחילים

1. **עוסק פטור.** פותחים תיק במע״מ, במס הכנסה ובביטוח לאומי. אפשר לעשות את זה ב[אתר רשות המסים](https://www.gov.il/he/service/opening-a-file-in-vat) ובאתר [ביטוח לאומי](https://www.btl.gov.il).
   מקבלים מספר עוסק.
2. **חשבון בנק עסקי או פרטי על שמך.** לשם Paddle תעביר את הכסף.
3. **האתר צריך להיות באוויר, בכתובת אמיתית** (ראו [מדריך העלאת האתר](./hosting-guide.md)). Paddle בודקת את האתר לפני שהיא מאשרת אותך.
   הם בודקים שיש באתר, בלי צורך להירשם:
   - מחירים
   - תנאי שימוש שמציינים ש־Paddle היא המוכר הרשמי (כבר כתוב)
   - מדיניות פרטיות
   - מדיניות החזרים
   - דף יצירת קשר (כבר קיים: `/legal/contact`)
4. **למלא את פרטי העסק בהגדרות האתר:** `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_BUSINESS_ID`,
   `NEXT_PUBLIC_POSTAL_ADDRESS`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_ACCESSIBILITY_COORDINATOR`.
   בלי זה יופיעו באתר סוגריים מרובעים, ו־Paddle לא תאשר.

## שלב 1: חשבון ניסיון (בלי כסף אמיתי)

1. נרשמים לחשבון ניסיון ב־[sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com/signup).
2. **מוצר:** בתפריט Catalog, ואז Products, ואז New product.
   - שם: `AI video ad`.
   - סוג המס (Tax category): `Standard digital goods`.
   - שומרים, ומעתיקים את המספר שמתחיל ב־`pro_`. זה `PADDLE_PRODUCT_ID`.
   - לא צריך ליצור מחיר. האתר קובע את המחיר לכל הזמנה בעצמו.
3. **מפתחות:** בתפריט Developer tools, ואז Authentication.
   - יוצרים **API key** עם הרשאות לעסקאות (Transactions) ולהחזרים (Adjustments). זה `PADDLE_API_KEY`.
   - יוצרים **Client-side token**. זה `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`.
4. **התראות על תשלום:** בתפריט Developer tools, ואז Notifications, ואז New destination.
   - כתובת: `https://הדומיין-שלך/api/webhooks/paddle`
   - מסמנים את האירועים: `transaction.completed`, `transaction.paid`, `adjustment.created`, `adjustment.updated`.
   - שומרים, ומעתיקים את ה־**Secret key**. זה `PADDLE_WEBHOOK_SECRET`.
5. **כתובת ברירת מחדל לתשלום:** בתפריט Checkout, ואז Checkout settings.
   - ב־Default payment link שמים את כתובת האתר.
   - מוסיפים את הדומיין ל־Approved domains.

## שלב 2: מכניסים את המפתחות לאתר

בשרת שבו האתר רץ ([Vercel](https://vercel.com), בתפריט Settings ואז Environment Variables, וגם ב־[Railway](https://railway.com)):

```
PADDLE_ENV=sandbox
NEXT_PUBLIC_PADDLE_ENV=sandbox
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...
PADDLE_PRODUCT_ID=pro_...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_DEMO_MODE=false
```

את מסד הנתונים כבר הכנתם ב[מדריך העלאת האתר](./hosting-guide.md). הוא כולל גם את הקופון MORDECHAI10.

## שלב 3: בודקים

1. נכנסים לאתר, מדביקים כתובת, בוחרים סגנון ולוחצים "לתשלום".
2. משלמים עם כרטיס הניסיון של Paddle: `4242 4242 4242 4242`.
   תוקף: כל תאריך עתידי. CVC: `100`.
3. בודקים שההזמנה עוברת ל"בהפקה", ושהסרטון מגיע.
4. בודקים החזר:
   - לוחצים "לבטל את ההזמנה" לפני שההפקה מתחילה.
   - בודקים ב־Paddle שההחזר נוצר, תחת Transactions ואז Adjustments.
5. בודקים גם את הקופון MORDECHAI10. הוא אמור לדלג על התשלום.

## שלב 4: עוברים לכסף אמיתי

1. נרשמים לחשבון האמיתי ב־[vendors.paddle.com](https://vendors.paddle.com/signup).
2. ממלאים את האימות:
   - **בדיקת האתר (domain review):** Paddle בודקת את האתר.
   - **אימות זהות:** תעודה מזהה וצילום.
   - **בדיקת עסק:** לעוסק יחיד לא צריך אותה.
   - **פרטי בנק:** לאן להעביר את הכסף.
3. חוזרים על שלבים 1.2 עד 1.5 בחשבון האמיתי. המפתחות שם שונים.
4. מחליפים בהגדרות האתר:
   - `PADDLE_ENV=production` ו־`NEXT_PUBLIC_PADDLE_ENV=production`.
   - את המפתחות החדשים מהחשבון האמיתי.
5. עושים קנייה אמיתית אחת קטנה ומבטלים אותה, כדי לראות שהכל עובד.

## כמה דברים חשובים

- **אף פעם לא לשלוח את המפתחות** בצ'אט, בוואטסאפ או בגיטהאב. הם נכנסים רק להגדרות השרת.
  `PADDLE_API_KEY` ו־`PADDLE_WEBHOOK_SECRET` הם סודיים. מי שמחזיק אותם יכול לבצע פעולות בחשבון.
- **המחירים באתר בשקלים וכוללים מע״מ**, כמו שחוק הגנת הצרכן דורש. Paddle מחייבת בדיוק את הסכום שמוצג.
- **שער הדולר:** העלויות שלנו (בינה מלאכותית, קריינות, מוזיקה) בדולרים. האתר ממיר לפי `USD_ILS_RATE`.
  כדאי לעדכן אותו פעם בכמה חודשים.
- **הכנסה כעוסק פטור:** הכסף שמגיע מ־Paddle הוא הכנסה של העסק. צריך לדווח עליו ולשמור את דוחות ההעברה מ־Paddle.
  כדאי לשאול רואה חשבון איך לדווח על הכנסה ממוכר רשמי בחו״ל, ומה קורה כשמתקרבים לתקרת העוסק הפטור.
- **לפני שעולים לאוויר,** כדאי שעורך דין יעבור על המסמכים המשפטיים.
