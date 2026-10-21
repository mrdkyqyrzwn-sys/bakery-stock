"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Prefs = { size: number; contrast: boolean; links: boolean; still: boolean; plainFont: boolean };
const DEFAULTS: Prefs = { size: 0, contrast: false, links: false, still: false, plainFont: false };
const KEY = "a11y-prefs";

function apply(p: Prefs) {
  const c = document.documentElement.classList;
  c.toggle("a11y-text-1", p.size === 1);
  c.toggle("a11y-text-2", p.size === 2);
  c.toggle("a11y-contrast", p.contrast);
  c.toggle("a11y-links", p.links);
  c.toggle("a11y-still", p.still);
  c.toggle("a11y-font", p.plainFont);
  document.querySelectorAll("video").forEach((v) => (p.still ? v.pause() : v.autoplay && v.play().catch(() => {})));
}

/** Accessibility menu: bigger text, high contrast, underlined links, no motion, plain font. Remembered per browser. */
export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    let saved = DEFAULTS;
    try {
      saved = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
    } catch {}
    apply(saved);
    // Restoring a saved setting after hydration is exactly what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(saved);
  }, []);

  function update(next: Partial<Prefs>) {
    const p = { ...prefs, ...next };
    setPrefs(p);
    apply(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
  }

  const toggle = (k: keyof Omit<Prefs, "size">, label: string) => (
    <button type="button" aria-pressed={prefs[k]} onClick={() => update({ [k]: !prefs[k] })} className="a11y-opt">
      {label}
    </button>
  );

  return (
    <div className="a11y-root">
      <button
        type="button"
        className="a11y-fab"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen(!open)}
        aria-label="תפריט נגישות"
      >
        <span aria-hidden>♿</span>
      </button>
      {open && (
        <div id="a11y-panel" role="dialog" aria-label="הגדרות נגישות" className="a11y-panel">
          <p className="font-bold">נגישות</p>
          <div className="a11y-row">
            <span>גודל טקסט</span>
            <button type="button" className="a11y-opt" onClick={() => update({ size: Math.max(0, prefs.size - 1) })} aria-label="הקטנת טקסט">א-</button>
            <button type="button" className="a11y-opt" onClick={() => update({ size: Math.min(2, prefs.size + 1) })} aria-label="הגדלת טקסט">א+</button>
          </div>
          {toggle("contrast", "ניגודיות גבוהה")}
          {toggle("links", "הדגשת קישורים")}
          {toggle("still", "עצירת אנימציות וסרטונים")}
          {toggle("plainFont", "גופן פשוט וקריא")}
          <button type="button" className="a11y-opt" onClick={() => update(DEFAULTS)}>איפוס</button>
          <Link href="/legal/accessibility" className="underline" onClick={() => setOpen(false)}>הצהרת נגישות</Link>
        </div>
      )}
    </div>
  );
}
