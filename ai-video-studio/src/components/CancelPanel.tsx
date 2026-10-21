"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO } from "./demo";

/** "Cancel order" on every order page, as the consumer protection law requires for online sales. */
export function CancelPanel({
  projectId,
  token,
  status,
  onDone,
}: {
  projectId: string;
  token: string;
  status: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const started = status !== "paid" && status !== "awaiting_payment";

  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      if (DEMO) {
        setMsg("מצב דמו: לא בוצע ביטול אמיתי.");
        return;
      }
      const res = await fetch(`/api/projects/${projectId}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      if (data.result === "requested") {
        setMsg(`בקשת הביטול התקבלה. מספר אסמכתה: ${data.reference}. נחזור אליכם תוך 3 ימי עסקים, ושמרו את המספר.`);
      } else {
        onDone();
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-6 text-sm" aria-labelledby="cancel-title">
      <h2 id="cancel-title" className="font-bold">ביטול עסקה</h2>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 rounded-full border border-line px-4 py-2">
          לבטל את ההזמנה
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-muted">
            {started
              ? "ההפקה כבר התחילה, אז הבקשה תיבדק לפי מדיניות הביטולים. אם החוק מקנה לכם זכות ביטול, נכבד אותה."
              : "ההפקה עוד לא התחילה, אז ההזמנה תבוטל מיד ותקבלו החזר מלא."}{" "}
            <Link href="/legal/refunds" className="underline">מדיניות הביטולים</Link>
          </p>
          <label htmlFor="cancel-reason" className="block font-bold">סיבה (לא חובה)</label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={600}
            className="w-full rounded-xl border border-line bg-transparent p-3"
          />
          <button type="button" onClick={send} disabled={busy} className="rounded-full bg-danger px-5 py-2 font-bold text-white">
            {busy ? "שולחים…" : "לאשר ביטול"}
          </button>
        </div>
      )}
      <div aria-live="polite">{msg && <p className="mt-3">{msg}</p>}</div>
    </section>
  );
}
