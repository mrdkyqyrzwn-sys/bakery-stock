"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Quote } from "@/lib/pricing-core";
import { STYLES } from "@/lib/styles";
import { DEMO, demoCheckout, demoProject } from "./demo";
import { DemoPreview } from "./DemoPreview";
import { PhotoUploader } from "./PhotoUploader";
import { RevisionPanel } from "./RevisionPanel";
import { readToken } from "./token";

interface Project {
  id: string;
  status: "draft" | "awaiting_payment" | "paid" | "rendering" | "revising" | "done" | "failed" | "refunded";
  siteUrl: string;
  brandName: string;
  concepts: { style_id: string; title_he: string; pitch_he: string }[];
  quotes: Quote[];
  choice: { style: string; durationS: number; aspect: string; priceCents: number } | null;
  uploads: string[];
  stage: "planning" | "media" | "writing" | "reviewing" | "rendering" | null;
  renderProgress: number;
  videoUrl: string | null;
  headlines: string[];
  revisionsLeft: number;
  lastRevisionFailed: boolean;
  /** Demo mode only: lines shown in the animated preview. */
  demoLines?: string[];
}

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (opts: { token: string; eventCallback?: (e: { name?: string }) => void }) => void;
      Checkout: { open: (opts: { transactionId: string; settings?: Record<string, unknown> }) => void };
    };
  }
}

const noopSubscribe = () => () => {};

async function fetchProject(id: string, token: string): Promise<Project | null> {
  if (DEMO) return demoProject(id);
  const res = await fetch(`/api/projects/${id}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  return res.ok ? res.json() : null;
}
const usd = (n: number) => `$${n.toFixed(2)}`;
const BREAKDOWN_LABELS: Record<keyof Quote["breakdown"], string> = {
  aiUsd: "בינה מלאכותית: תסריט, בימוי, עריכה ובקרת איכות",
  mediaUsd: "קריינות, מוזיקה מקורית ויצירת תמונות",
  renderUsd: "ייצוא הסרטון ואחסון",
  serviceFeeUsd: "עמלת שירות",
  paymentProcessingUsd: "עמלת סליקה",
};

export function Studio({ id }: { id: string }) {
  // undefined while rendering on the server, then the token (or null) in the browser.
  const token = useSyncExternalStore(
    noopSubscribe,
    () => readToken(id),
    () => undefined,
  );
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);

  const apply = useCallback((r: Project | null) => {
    if (r) setProject(r);
    else setLoadError("הפרויקט לא נמצא, או שהקישור אינו מלא. השתמשו בקישור הפרטי שקיבלתם.");
  }, []);

  useEffect(() => {
    if (!token) return;
    let live = true;
    void fetchProject(id, token).then((r) => live && apply(r));
    return () => {
      live = false;
    };
  }, [id, token, apply]);

  // Poll while the video is being produced.
  const producing = project && ["awaiting_payment", "paid", "rendering", "revising"].includes(project.status);
  // After checkout the row may still read draft/awaiting_payment until the payment webhook lands.
  const polling = !!token && (justPaid || (!!producing && project?.status !== "awaiting_payment"));
  useEffect(() => {
    if (!polling || !token) return;
    const t = setInterval(() => void fetchProject(id, token).then(apply), DEMO ? 1000 : 8000);
    return () => clearInterval(t);
  }, [polling, id, token, apply]);

  if (token === null || loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p role="alert" className="text-lg">{loadError ?? "חסר קוד גישה בקישור. השתמשו בקישור הפרטי המלא."}</p>
        <Link href="/" className="btn-primary mt-8 inline-block">לדף הבית</Link>
      </div>
    );
  }
  if (!project || !token) {
    return <p className="py-24 text-center text-muted" aria-live="polite">טוען…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted" dir="ltr">{project.siteUrl}</p>
      <h1 className="mt-1 text-3xl font-black sm:text-4xl">
        הפרסומת של <span className="gradient-text">{project.brandName}</span>
      </h1>
      {!justPaid && (project.status === "draft" || project.status === "awaiting_payment") ? (
        <Chooser project={project} token={token} onPaid={() => setJustPaid(true)} />
      ) : (
        <Production project={project} token={token} onChanged={() => void fetchProject(id, token).then(apply)} />
      )}
    </div>
  );
}

function Chooser({ project, token, onPaid }: { project: Project; token: string; onPaid: () => void }) {
  const [style, setStyle] = useState(project.choice?.style ?? project.concepts[0]?.style_id ?? STYLES[0].id);
  const [duration, setDuration] = useState(project.choice?.durationS ?? 30);
  const [aspect, setAspect] = useState(project.choice?.aspect ?? "16:9");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(DEMO);
  const q = project.quotes.find((x) => x.durationS === duration)!;

  function initPaddle() {
    const p = window.Paddle;
    const tokenPublic = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!p || !tokenPublic) return;
    if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "production") p.Environment.set("sandbox");
    p.Initialize({
      token: tokenPublic,
      eventCallback: (e) => {
        if (e.name === "checkout.completed") onPaid();
      },
    });
    setPaddleReady(true);
  }

  async function pay() {
    setErr(null);
    setBusy(true);
    if (DEMO) {
      // Demo: no checkout, no charge. Just start the simulated production.
      await new Promise((r) => setTimeout(r, 1200));
      demoCheckout(project.id, { style, durationS: duration, aspect });
      setBusy(false);
      onPaid();
      return;
    }
    try {
      const res = await fetch(`/api/projects/${project.id}/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ style, durationS: duration, aspect, acceptTerms: accept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      window.Paddle?.Checkout.open({ transactionId: data.transactionId, settings: { displayMode: "overlay", theme: "dark" } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!DEMO && (
        <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" onReady={initPaddle} />
      )}

      <section aria-labelledby="pick-style" className="mt-10">
        <h2 id="pick-style" className="mb-4 text-xl font-bold">1. בחרו סגנון</h2>
        <div role="radiogroup" aria-labelledby="pick-style" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STYLES.map((s) => {
            const c = project.concepts.find((x) => x.style_id === s.id);
            const selected = style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setStyle(s.id)}
                className={`overflow-hidden rounded-3xl border text-start transition ${
                  selected ? "border-accent ring-2 ring-accent" : "border-line hover:border-white/30"
                } bg-card`}
              >
                <div className="h-24" style={{ background: s.gradient }} aria-hidden />
                <div className="p-5">
                  <p className="text-xs text-muted">{s.nameHe}</p>
                  <p className="mt-1 text-lg font-bold">{c?.title_he ?? s.taglineHe}</p>
                  <p className="mt-2 text-sm text-muted">{c?.pitch_he ?? s.taglineHe}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <PhotoUploader projectId={project.id} token={token} initial={project.uploads} />

      <section aria-labelledby="pick-length" className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="pick-length" className="mb-4 text-xl font-bold">3. אורך ופורמט</h2>
          <div role="radiogroup" aria-label="אורך הסרטון" className="flex flex-wrap gap-2">
            {project.quotes.map((x) => (
              <button
                key={x.durationS}
                type="button"
                role="radio"
                aria-checked={duration === x.durationS}
                onClick={() => setDuration(x.durationS)}
                className={`rounded-full border px-4 py-2 ${
                  duration === x.durationS ? "border-accent bg-accent/20" : "border-line"
                }`}
              >
                {x.durationS < 60 ? `${x.durationS} שניות` : x.durationS === 60 ? "דקה" : x.durationS === 90 ? "דקה וחצי" : "2 דקות"}
              </button>
            ))}
          </div>
          <div role="radiogroup" aria-label="פורמט" className="mt-4 flex gap-2">
            {[
              ["16:9", "לרוחב (יוטיוב, אתר)"],
              ["9:16", "לאורך (Reels, TikTok)"],
            ].map(([v, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={aspect === v}
                onClick={() => setAspect(v)}
                className={`rounded-full border px-4 py-2 ${aspect === v ? "border-accent bg-accent/20" : "border-line"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-card p-6">
          <h2 className="mb-4 text-xl font-bold">4. מחיר שקוף</h2>
          <dl className="space-y-2 text-sm">
            {(Object.keys(BREAKDOWN_LABELS) as (keyof Quote["breakdown"])[]).map((k) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{BREAKDOWN_LABELS[k]}</dt>
                <dd dir="ltr">{usd(q.breakdown[k])}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
              <dt>סה״כ</dt>
              <dd dir="ltr">{usd(q.totalUsd)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">
            סרטון של {q.durationS} שניות באיכות Full HD. מע״מ או מס מכירה מקומי, אם חלים, יתווספו בעמוד התשלום.
          </p>
          <label className="mt-5 flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 h-4 w-4 accent-violet-500" />
            <span>
              קראתי ואני מסכים/ה ל<Link href="/legal/terms" target="_blank" className="underline">תנאי השימוש</Link> ול
              <Link href="/legal/refunds" target="_blank" className="underline">מדיניות הביטולים</Link>. ידוע לי שהסרטון מופק במיוחד עבורי
              ושההפקה מתחילה מיד לאחר התשלום, ולכן לא ניתן לבטל אותה אחרי שהתחילה, למעט במקרים המפורטים במדיניות.
            </span>
          </label>
          <button type="button" onClick={pay} disabled={busy || !accept || !paddleReady} className="btn-primary mt-5 w-full text-lg">
            {busy ? (DEMO ? "מדמה תשלום…" : "פותח תשלום…") : DEMO ? `המשך (דמו, ללא חיוב): ${usd(q.totalUsd)}` : `לתשלום מאובטח: ${usd(q.totalUsd)}`}
          </button>
          {!paddleReady && <p className="mt-2 text-xs text-muted">טוען את מערכת התשלום…</p>}
          <div aria-live="polite">{err && <p role="alert" className="mt-3 text-danger">{err}</p>}</div>
        </div>
      </section>
    </>
  );
}

const STAGES = [
  { id: "planning", label: "כותבים תסריט ובוחרים תמונות" },
  { id: "media", label: "מקליטים קריינות, מלחינים מוזיקה ויוצרים תמונות" },
  { id: "writing", label: "עורכים את הסרטון: תנועה, מעברים וטקסט" },
  { id: "reviewing", label: "בקרת איכות ותיקונים" },
  { id: "rendering", label: "ייצוא הסרטון הסופי" },
] as const;

function Production({ project, token, onChanged }: { project: Project; token: string; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const { status, stage, renderProgress } = project;
  const pct =
    status === "done"
      ? 100
      : stage === "rendering"
        ? 50 + Math.round(renderProgress / 2)
        : stage === "reviewing"
          ? 42
          : stage === "writing"
            ? 32
            : stage === "media"
              ? 18
              : stage === "planning"
                ? 8
                : 3;
  const activeIndex = STAGES.findIndex((s) => s.id === stage);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  }

  if (status === "failed" || status === "refunded") {
    return (
      <div className="mt-10 rounded-3xl border border-line bg-card p-8" role="alert">
        <h2 className="text-2xl font-bold">לא הצלחנו להפיק את הסרטון</h2>
        <p className="mt-3 text-muted">
          {status === "refunded"
            ? "ביצענו החזר כספי מלא. הוא יופיע באמצעי התשלום תוך כמה ימי עסקים."
            : "אנחנו מטפלים בזה. אם שילמתם, יבוצע החזר כספי מלא."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl border border-line bg-card p-6">
        {status === "done" && project.videoUrl === "demo" ? (
          <DemoPreview
            styleId={project.choice?.style ?? STYLES[0].id}
            aspect={project.choice?.aspect ?? "16:9"}
            brandName={project.brandName}
            lines={project.demoLines ?? []}
            photos={project.uploads}
          />
        ) : null}
        {status === "done" && project.videoUrl === "demo" && (
          <RevisionPanel
            key={`r${project.revisionsLeft}`}
            projectId={project.id}
            token={token}
            headlines={project.headlines}
            revisionsLeft={project.revisionsLeft}
            lastFailed={project.lastRevisionFailed}
            onSent={onChanged}
          />
        )}
        {status === "done" && project.videoUrl === "demo" ? null : status === "done" && project.videoUrl ? (
          <>
            <video
              src={project.videoUrl}
              controls
              playsInline
              className={`w-full rounded-2xl bg-black ${project.choice?.aspect === "9:16" ? "mx-auto max-h-[80vh] w-auto" : ""}`}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={project.videoUrl} download className="btn-primary">הורדת הסרטון</a>
              <button type="button" onClick={copyLink} className="rounded-full border border-line px-5 py-3">
                {copied ? "הקישור הועתק ✓" : "העתקת קישור פרטי"}
              </button>
            </div>
            <p className="mt-4 text-xs text-muted">
              הסרטון נוצר בבינה מלאכותית. כשמפרסמים אותו מומלץ לציין זאת, ובחלק מהפלטפורמות ומהמדינות זו חובה.
              הסרטון נשמר אצלנו 90 יום. הורידו עותק.
            </p>
            <RevisionPanel
              key={`r${project.revisionsLeft}`}
              projectId={project.id}
              token={token}
              headlines={project.headlines}
              revisionsLeft={project.revisionsLeft}
              lastFailed={project.lastRevisionFailed}
              onSent={onChanged}
            />
          </>
        ) : (
          <div aria-live="polite">
            <h2 className="text-2xl font-bold">
              {status === "awaiting_payment"
                ? "מאשרים את התשלום…"
                : status === "revising"
                  ? "מתקנים את הסרטון לפי הבקשה שלך…"
                  : "מפיקים את הסרטון שלך…"}
            </h2>
            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-l from-violet-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">
              {stage === "rendering" ? `מרנדרים: ${renderProgress}%` : "בדרך כלל 5 עד 15 דקות"}
            </p>
            <div className="mt-6 rounded-2xl border border-line p-4 text-sm">
              <p className="font-bold">שמרו את הקישור הפרטי כדי לחזור לסרטון:</p>
              <button type="button" onClick={copyLink} className="mt-2 rounded-full border border-line px-4 py-2">
                {copied ? "הועתק ✓" : "העתקת הקישור"}
              </button>
              <p className="mt-2 text-xs text-muted">כל מי שיש לו את הקישור יכול לצפות בסרטון. אל תשתפו אותו.</p>
            </div>
          </div>
        )}
      </div>
      <aside className="rounded-3xl border border-line bg-card p-6" aria-labelledby="steps">
        <h2 id="steps" className="mb-4 font-bold">שלבי ההפקה</h2>
        <ol className="space-y-3 text-sm">
          {STAGES.map((s, i) => {
            const state = status === "done" || i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
            return (
              <li key={s.id} className={`flex items-center gap-3 ${state === "todo" ? "text-muted" : ""}`}>
                <span
                  aria-hidden
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${
                    state === "done" ? "border-ok bg-ok/20 text-ok" : state === "active" ? "animate-pulse border-accent2 text-accent2" : "border-line"
                  }`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span>
                  {s.label}
                  <span className="sr-only">{state === "done" ? " (הושלם)" : state === "active" ? " (בתהליך)" : ""}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
