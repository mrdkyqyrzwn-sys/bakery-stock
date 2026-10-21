import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "יצירת קשר ופרטי העסק" };

export default function Contact() {
  return (
    <>
      <h1>יצירת קשר ופרטי העסק</h1>
      <ul>
        <li>שם העסק: {SITE.legalName}</li>
        <li>מספר עוסק: {SITE.businessId}</li>
        <li>כתובת: {SITE.address}</li>
        <li>דוא״ל: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        <li>רכז/ת נגישות: {SITE.accessibilityCoordinator}</li>
      </ul>
      <p>
        המכירה והתשלום מתבצעים מול Paddle.com Market Ltd, המוכר הרשמי (Merchant of Record) של השירות. Paddle מנפיקה את
        החשבונית ואפשר לפנות אליה בנושאי חיוב דרך <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a>.
      </p>
      <p>
        לביטול הזמנה: <Link href="/legal/cancel">ביטול עסקה</Link>.
      </p>
    </>
  );
}
