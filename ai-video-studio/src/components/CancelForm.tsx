"use client";

import { useState } from "react";

export function CancelForm() {
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/cancel-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, order: order || undefined, details: details || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMsg({ ok: true, text: `בקשת הביטול התקבלה. מספר אסמכתה: ${data.reference}. נחזור אליכם בדוא״ל תוך 3 ימי עסקים.` });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "שגיאה" });
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-transparent p-3";
  return (
    <form onSubmit={submit} className="not-prose mt-6 space-y-4">
      <div>
        <label htmlFor="c-email" className="font-bold">הדוא״ל שאיתו שילמתם *</label>
        <input id="c-email" type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className={field} dir="ltr" />
      </div>
      <div>
        <label htmlFor="c-order" className="font-bold">מספר הזמנה או חשבונית מ־Paddle</label>
        <input id="c-order" maxLength={200} value={order} onChange={(e) => setOrder(e.target.value)} className={field} dir="ltr" />
      </div>
      <div>
        <label htmlFor="c-details" className="font-bold">פרטים נוספים</label>
        <textarea id="c-details" maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} className={field} />
      </div>
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "שולחים…" : "לשלוח בקשת ביטול"}</button>
      <div aria-live="polite">{msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "" : "text-danger"}>{msg.text}</p>}</div>
    </form>
  );
}
