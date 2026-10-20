import { UrlForm } from "@/components/UrlForm";
import { STYLES } from "@/lib/styles";

const HOW = [
  { n: "1", title: "מדביקים כתובת אתר", text: "המערכת סורקת את האתר ומבינה מה אתם מוכרים, למי, ובאיזה טון." },
  { n: "2", title: "בוחרים סגנון ואורך", text: "חמישה קונספטים שנכתבו במיוחד בשבילכם, מ־20 שניות ועד 2 דקות, לרוחב או ל־Reels." },
  { n: "3", title: "משלמים ומקבלים סרטון", text: "תסריט, צילום AI, מוזיקה וסאונד. המחיר שקוף ומחושב לפי האורך." },
];

const FAQ = [
  {
    q: "כמה זה עולה?",
    a: "המחיר נקבע לפי אורך הסרטון ומוצג לפני התשלום, כולל פירוט של עלות יצירת הווידאו, עלות הבינה המלאכותית ועמלת השירות. בלי מנויים ובלי הפתעות.",
  },
  {
    q: "כמה זמן לוקחת ההפקה?",
    a: "בדרך כלל 5 עד 20 דקות, לפי האורך. אפשר לסגור את הדף ולחזור אליו דרך הקישור הפרטי.",
  },
  {
    q: "למי שייך הסרטון?",
    a: "לכם. אתם מקבלים רישיון מלא לשימוש מסחרי בסרטון, בכפוף לתנאי השימוש. שימו לב שבחלק מהמדינות תוכן שנוצר בבינה מלאכותית אינו מוגן בזכויות יוצרים.",
  },
  {
    q: "מה אם ההפקה נכשלת?",
    a: "אם לא הצלחנו לספק את הסרטון, אתם מקבלים החזר כספי מלא באופן אוטומטי.",
  },
  {
    q: "האם יופיעו בסרטון אנשים אמיתיים או לוגו?",
    a: "לא. המערכת יוצרת דמויות בדיוניות בלבד, ולא מעתיקה מותגים, דמויות או יצירות של אחרים. מודלי וידאו עדיין מתקשים בכיתוב ובלוגואים, ולכן הסרטון בנוי מתמונה, מוזיקה וסאונד. את הלוגו והטקסט אפשר להוסיף בכל עורך וידאו.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:pt-24">
        <p className="mb-5 inline-block rounded-full border border-line bg-card px-4 py-1 text-sm text-muted">
          ✦ סרטוני פרסומת בבינה מלאכותית, בלי סטודיו ובלי מעצב
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-black sm:text-6xl">
          כתובת אתר אחת.
          <br />
          <span className="gradient-text">סרטון פרסומת שעוצר גלילה.</span>
        </h1>
        <p className="mx-auto mt-6 mb-10 max-w-2xl text-lg text-muted">
          מדביקים קישור לאתר, והבינה המלאכותית קוראת אותו, מבינה את המותג ומפיקה סרטון פרסומת קולנועי
          בסגנון שבחרתם, מוכן לפייסבוק, אינסטגרם, טיקטוק ויוטיוב.
        </p>
        <UrlForm />
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="how-title">
        <h2 id="how-title" className="mb-10 text-center text-3xl font-extrabold">איך זה עובד</h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {HOW.map((s) => (
            <li key={s.n} className="rounded-3xl border border-line bg-card p-6">
              <span className="gradient-text text-4xl font-black" aria-hidden>{s.n}</span>
              <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="styles" className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="styles-title">
        <h2 id="styles-title" className="mb-3 text-center text-3xl font-extrabold">חמישה סגנונות, אינסוף אפשרויות</h2>
        <p className="mb-10 text-center text-muted">לכל אתר נכתב קונספט ייחודי בכל אחד מהסגנונות.</p>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STYLES.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-3xl border border-line bg-card">
              <div className="aspect-[4/5]" style={{ background: s.gradient }} aria-hidden />
              <div className="p-4">
                <h3 className="font-bold">{s.nameHe}</h3>
                <p className="mt-1 text-sm text-muted">{s.taglineHe}</p>
                <p className="mt-2 text-xs text-muted/80">מתאים ל: {s.bestForHe}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-8 text-center text-3xl font-extrabold">שאלות נפוצות</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl border border-line bg-card p-5">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
