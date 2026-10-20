"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO, createDemoProject } from "./demo";
import { saveToken } from "./token";

const STEPS = ["קוראים את האתר שלך…", "מזהים את המותג, הקהל והמסרים…", "כותבים קונספטים לכל סגנון…"];

export function UrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), DEMO ? 2400 : 9000);
    try {
      if (DEMO) {
        const demo = await createDemoProject(url);
        router.push(`/create/${demo.id}#t=${demo.token}`);
        return;
      }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש");
      saveToken(data.id, data.token);
      router.push(`/create/${data.id}#t=${data.token}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "משהו השתבש");
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl" aria-describedby="url-help">
      <label htmlFor="site-url" className="sr-only">כתובת האתר שלך</label>
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-2 backdrop-blur sm:flex-row">
        <input
          id="site-url"
          type="text"
          inputMode="url"
          dir="ltr"
          required
          autoComplete="url"
          placeholder="www.your-website.co.il"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-2xl bg-transparent px-5 py-4 text-lg outline-none placeholder:text-muted/60"
          disabled={busy}
        />
        <button type="submit" className="btn-primary text-lg" disabled={busy || !consent || url.length < 4}>
          {busy ? "סורקים…" : "צרו לי סרטון"}
        </button>
      </div>
      <p id="url-help" className="mt-3 text-center text-sm text-muted">
        {DEMO
          ? "מצב דמו: האתר לא באמת נסרק, והקונספטים הם דוגמה."
          : "הסריקה והקונספטים חינם. משלמים רק כשבוחרים סגנון ואורך."}
      </p>
      <label className="mt-4 flex items-start justify-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-violet-500"
          disabled={busy}
        />
        <span>
          אני מאשר/ת שהאתר שייך לי או שאני מורשה לפרסם אותו, ושקראתי את{" "}
          <Link href="/legal/terms" className="underline" target="_blank">תנאי השימוש</Link> ואת{" "}
          <Link href="/legal/privacy" className="underline" target="_blank">מדיניות הפרטיות</Link>.
        </span>
      </label>
      <div aria-live="polite" className="mt-4 min-h-6 text-center">
        {busy && <p className="animate-pulse text-accent2">{STEPS[step]}</p>}
        {err && <p role="alert" className="text-danger">{err}</p>}
      </div>
    </form>
  );
}
