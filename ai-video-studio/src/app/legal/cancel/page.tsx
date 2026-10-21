import type { Metadata } from "next";
import Link from "next/link";
import { CancelForm } from "@/components/CancelForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "ביטול עסקה" };

export default function Cancel() {
  return (
    <>
      <h1>ביטול עסקה</h1>
      <p>
        אפשר לבטל הזמנה באותה דרך שבה הזמנתם, כאן באתר. הדרך הכי מהירה היא כפתור &quot;לבטל את ההזמנה&quot; בעמוד ההזמנה
        (הקישור הפרטי שקיבלתם). אם ההפקה עוד לא התחילה, ההזמנה מתבטלת מיד ומקבלים החזר מלא.
      </p>
      <p>
        אין לכם את הקישור? מלאו את הטופס, ונחזור אליכם בדוא״ל תוך 3 ימי עסקים. אפשר גם לשלוח הודעת ביטול בדוא״ל אל{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> או בדואר אל {SITE.address}. מה קורה אחרי ביטול מוסבר ב
        <Link href="/legal/refunds">מדיניות הביטולים וההחזרים</Link>.
      </p>
      <CancelForm />
    </>
  );
}
