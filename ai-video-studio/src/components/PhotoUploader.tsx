"use client";

import { useState } from "react";
import { MAX_UPLOADS } from "@/lib/image-check";
import { DEMO, demoSetPhotos } from "./demo";
import { preparePhoto } from "./photos";

export function PhotoUploader({ projectId, token, initial }: { projectId: string; token: string; initial: string[] }) {
  const [photos, setPhotos] = useState<string[]>(initial);
  const [pending, setPending] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files) return;
    setErr(null);
    const list = [...files].slice(0, MAX_UPLOADS - photos.length);
    if (files.length > list.length) setErr(`אפשר להעלות עד ${MAX_UPLOADS} תמונות`);
    setPending((n) => n + list.length);
    for (const file of list) {
      try {
        const blob = await preparePhoto(file);
        let url: string;
        if (DEMO) {
          url = URL.createObjectURL(blob);
        } else {
          const res = await fetch(`/api/projects/${projectId}/images`, {
            method: "POST",
            headers: { "content-type": "image/jpeg", authorization: `Bearer ${token}` },
            body: blob,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "ההעלאה נכשלה");
          url = data.url;
        }
        setPhotos((p) => {
          const next = [...p, url];
          if (DEMO) demoSetPhotos(projectId, next);
          return next;
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "ההעלאה נכשלה");
      } finally {
        setPending((n) => n - 1);
      }
    }
  }

  async function remove(url: string) {
    if (!DEMO) {
      const res = await fetch(`/api/projects/${projectId}/images`, {
        method: "DELETE",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return setErr("המחיקה נכשלה");
    }
    setPhotos((p) => {
      const next = p.filter((u) => u !== url);
      if (DEMO) demoSetPhotos(projectId, next);
      return next;
    });
  }

  return (
    <section aria-labelledby="pick-photos" className="mt-10">
      <h2 id="pick-photos" className="mb-1 text-xl font-bold">2. תמונות (מומלץ)</h2>
      <p className="mb-4 text-sm text-muted">
        העלו תמונות של המוצרים, המקום או העבודות שלכם, עד {MAX_UPLOADS}. בלי תמונות? נשתמש בלוגו ובתמונות מהאתר שלכם, ונשלים בתמונות מקצועיות שניצור.
        העלו רק תמונות שהן שלכם, ושמי שמופיע בהן הסכים לכך.
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {photos.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`תמונה ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => void remove(url)}
              className="absolute top-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-sm"
              aria-label={`הסרת תמונה ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {Array.from({ length: pending }, (_, i) => (
          <div key={`p${i}`} className="aspect-square animate-pulse rounded-2xl border border-line bg-white/5" aria-hidden />
        ))}
        {photos.length + pending < MAX_UPLOADS && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-line text-center text-sm text-muted hover:border-accent hover:text-fg focus-within:border-accent">
            <span>
              <span className="block text-3xl" aria-hidden>+</span>
              הוספת תמונות
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="sr-only"
              onChange={(e) => {
                void add(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <div aria-live="polite">
        {pending > 0 && <p className="mt-2 text-sm text-accent2">מעלים {pending} תמונות…</p>}
        {err && <p role="alert" className="mt-2 text-sm text-danger">{err}</p>}
      </div>
    </section>
  );
}
