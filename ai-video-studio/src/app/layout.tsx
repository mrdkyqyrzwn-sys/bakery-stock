import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Link from "next/link";
import { SITE } from "@/lib/site";
import "./globals.css";

const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: `${SITE.brand} | סרטון פרסומת AI לאתר שלך תוך דקות`,
  description: "מדביקים כתובת אתר, בוחרים סגנון, ומקבלים סרטון פרסומת איכותי שנוצר בבינה מלאכותית.",
  metadataBase: new URL(SITE.url),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          דילוג לתוכן הראשי
        </a>
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">{SITE.brand}</span>
          </Link>
          <nav aria-label="ניווט ראשי" className="flex gap-5 text-sm text-muted">
            <Link href="/#how" className="hover:text-fg">איך זה עובד</Link>
            <Link href="/#styles" className="hover:text-fg">סגנונות</Link>
            <Link href="/#faq" className="hover:text-fg">שאלות</Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-24 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-2">
            <div>
              <p className="font-bold text-fg">{SITE.brand}</p>
              <p>{SITE.legalName} · {SITE.businessId}</p>
              <p>{SITE.address}</p>
              <p>
                פניות: <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </p>
              <p className="mt-3 text-xs">
                הסרטונים נוצרים באמצעות בינה מלאכותית. התשלום מעובד על ידי Paddle.com, המשמשת כמוכר הרשמי (Merchant of Record).
              </p>
            </div>
            <nav aria-label="מסמכים משפטיים" className="flex flex-col gap-2 sm:items-end">
              <Link href="/legal/terms" className="hover:text-fg">תנאי שימוש</Link>
              <Link href="/legal/privacy" className="hover:text-fg">מדיניות פרטיות</Link>
              <Link href="/legal/refunds" className="hover:text-fg">מדיניות ביטולים והחזרים</Link>
              <Link href="/legal/acceptable-use" className="hover:text-fg">מדיניות שימוש הוגן בתוכן</Link>
              <Link href="/legal/accessibility" className="hover:text-fg">הצהרת נגישות</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
