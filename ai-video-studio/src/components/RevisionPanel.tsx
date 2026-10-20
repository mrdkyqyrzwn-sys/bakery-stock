"use client";

import { useState } from "react";
import { FREE_REVISIONS, MAX_REVISION_TEXT } from "@/lib/limits";
import { DEMO, demoRevise } from "./demo";

/** After delivery: fix headlines directly, or describe a small change in free text. */
export function RevisionPanel({
  projectId,
  token,
  headlines,
  revisionsLeft,
  lastFailed,
  onSent,
}: {
  projectId: string;
  token: string;
  headlines: string[];
  revisionsLeft: number;
  lastFailed: boolean;
  onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [edits, setEdits] = useState<string[]>(headlines);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const changed = edits.map((h, i) => (h.trim() && h.trim() !== headlines[i] ? h.trim() : null));
  const hasChange = text.trim().length > 0 || changed.some(Boolean);

  async function send() {
    setErr(null);
    setBusy(true);
    try {
      const request = { text: text.trim(), headlines: changed };
      if (DEMO) {
        demoRevise(projectId, request);
      } else {
        const res = await fetch(`/api/projects/${projectId}/revisions`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify(request),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "שליחת התיקון נכשלה");
      }
      setOpen(false);
      setText("");
      onSent();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "שליחת התיקון נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-line p-5" aria-labelledby="revise-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="revise-title" className="font-bold">צריכים תיקון קטן?</h2>
          <p className="text-sm text-muted">
            {revisionsLeft > 0
              ? `נשארו לכם ${revisionsLeft} מתוך ${FREE_REVISIONS} סבבי תיקונים, כלולים במחיר.`
              : `נוצלו כל ${FREE_REVISIONS} סבבי התיקונים.`}
          </p>
        </div>
        {revisionsLeft > 0 && !open && (
          <button type="button" className="rounded-full border border-line px-5 py-2" onClick={() => setOpen(true)}>
            בקשת תיקון
          </button>
        )}
      </div>
      {lastFailed && (
        <p role="status" className="mt-3 text-sm text-danger">
          לא הצלחנו לבצע את התיקון האחרון, והסרטון נשאר כמו שהיה. הסבב לא נוצל, ואפשר לנסות שוב בניסוח אחר.
        </p>
      )}
      {open && (
        <div className="mt-5 space-y-5">
          {edits.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold">הכותרות שבסרטון (ערכו ישירות)</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {edits.map((h, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-16 shrink-0 text-muted">סצנה {i + 1}</span>
                    <input
                      id={`headline-${i}`}
                      value={h}
                      maxLength={120}
                      onChange={(e) => setEdits((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
                      className="min-w-0 flex-1 rounded-xl border border-line bg-transparent px-3 py-2"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="block text-sm">
            <span className="mb-2 block font-bold">או תארו במילים מה לשנות</span>
            <textarea
              id="revision-text"
              value={text}
              maxLength={MAX_REVISION_TEXT}
              rows={3}
              onChange={(e) => setText(e.target.value)}
              placeholder="למשל: להגדיל את הלוגו בסוף, לשנות את צבע הכותרות לכחול, לתקן את מספר הטלפון ל־03-1234567"
              className="w-full rounded-xl border border-line bg-transparent px-3 py-2"
            />
            <span className="mt-1 block text-xs text-muted">
              אפשר לשנות טקסט על המסך, צבעים, גדלים, סדר ותזמון. את הקריינות ואת המוזיקה אי אפשר לשנות בתיקון.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={!hasChange || busy} onClick={() => void send()}>
              {busy ? "שולחים…" : "שליחת התיקון"}
            </button>
            <button type="button" className="rounded-full border border-line px-5 py-3" onClick={() => setOpen(false)}>
              ביטול
            </button>
          </div>
          <div aria-live="polite">{err && <p role="alert" className="text-danger">{err}</p>}</div>
        </div>
      )}
    </section>
  );
}
