"use client";

import { useEffect, useState } from "react";
import { getStyle } from "@/lib/styles";

const SHOT_MS = 2600;

/**
 * Stand-in for the finished video in demo mode: an animated storyboard in the chosen style.
 * It is clearly labeled as an illustration, so nobody mistakes it for real AI output.
 */
export function DemoPreview({
  styleId,
  aspect,
  brandName,
  shots,
}: {
  styleId: string;
  aspect: string;
  brandName: string;
  shots: string[];
}) {
  const style = getStyle(styleId);
  const frames = [...shots, `END:${brandName}`];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % frames.length), SHOT_MS);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  const frame = frames[index];
  const isEnd = frame.startsWith("END:");
  const vertical = aspect === "9:16";

  return (
    <div>
      <div
        className={`relative mx-auto overflow-hidden rounded-2xl bg-black ${vertical ? "aspect-[9/16] max-h-[70vh]" : "aspect-video w-full"}`}
        role="img"
        aria-label={`תצוגה מקדימה להמחשה: ${isEnd ? brandName : frame}`}
      >
        <div
          key={index}
          className="demo-kenburns absolute inset-0"
          style={{ background: style?.gradient, filter: isEnd ? "brightness(0.55)" : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div key={`t${index}`} className="demo-fadein absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {isEnd ? (
            <>
              <p className="text-3xl font-black sm:text-5xl">{brandName}</p>
              <p className="mt-2 text-white/80">נכנסים לאתר עכשיו</p>
            </>
          ) : (
            <>
              <p className="text-sm text-white/70">סצנה {index + 1} מתוך {shots.length}</p>
              <p className="mt-2 max-w-md text-xl font-bold sm:text-2xl">{frame}</p>
            </>
          )}
        </div>
        <span className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs">דמו להמחשה</span>
        <div className="absolute inset-x-0 bottom-0 flex h-1 gap-1 px-2 pb-2">
          {frames.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setPlaying((p) => !p)} className="btn-primary">
          {playing ? "השהיה" : "הפעלה"}
        </button>
        <p className="text-sm text-muted">
          זהו מצב דמו. בגרסה האמיתית יופיע כאן סרטון שנוצר בבינה מלאכותית לפי התסריט, עם מוזיקה וסאונד, וכפתור הורדה.
        </p>
      </div>
    </div>
  );
}
