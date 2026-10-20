// NOTE for the site owner: these documents are a careful starting template, not legal advice.
// Have an Israeli lawyer (privacy + consumer law) review them before going live.
import { SITE } from "@/lib/site";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="legal mx-auto max-w-3xl px-4 py-12">
      {children}
      <p className="mt-12 text-sm text-muted">עודכן לאחרונה: {SITE.legalUpdated}</p>
    </article>
  );
}
