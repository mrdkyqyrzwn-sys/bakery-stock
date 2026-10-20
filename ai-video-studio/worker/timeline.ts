/**
 * Turns the recorded narration into the edit's timeline: every scene cuts exactly where its
 * line of narration starts, and every spoken word has a time for the captions.
 */
import type { Word } from "./media";
import type { TimelineScene } from "./renderer";

/** Narration starts a beat after the first frame. */
export const VOICE_OFFSET = 0.5;
/** Room after the last word for the end card to breathe. */
const TAIL = 1.2;
const MIN_SCENE = 1.4;
const LEAD = 0.15;

export interface ScriptScene {
  narration: string;
  onScreenText: string;
  direction: string;
  image: number;
}

/** The text sent to text-to-speech: scene lines joined by single spaces. */
export function narrationText(scenes: ScriptScene[]): string {
  return scenes.map((s) => s.narration.trim()).join(" ");
}

/** How much faster the voice must be to fit, or 1 when it already fits. */
export function fitRatio(voiceDuration: number, videoDuration: number): number {
  const available = videoDuration - VOICE_OFFSET - TAIL;
  return voiceDuration <= available ? 1 : voiceDuration / available;
}

export function buildTimeline(
  scenes: ScriptScene[],
  charStarts: number[],
  words: Word[],
  videoDuration: number,
): { scenes: TimelineScene[]; words: Word[] } {
  let offset = 0;
  const starts = scenes.map((s, i) => {
    const at = i === 0 ? 0 : Math.max(0, VOICE_OFFSET + (charStarts[Math.min(offset, charStarts.length - 1)] ?? 0) - LEAD);
    offset += s.narration.trim().length + 1;
    return at;
  });
  // Keep every scene long enough to register, and leave the last one room for the end card.
  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1] + MIN_SCENE);
  const lastLatest = videoDuration - 3;
  for (let i = starts.length - 1; i >= 1; i--) {
    const latest = i === starts.length - 1 ? lastLatest : starts[i + 1] - MIN_SCENE;
    starts[i] = Math.min(starts[i], latest);
  }
  return {
    scenes: scenes.map((s, i) => ({
      start: round(starts[i]),
      end: round(i === scenes.length - 1 ? videoDuration : starts[i + 1]),
      image: s.image,
      onScreenText: s.onScreenText,
      narration: s.narration,
      direction: s.direction,
    })),
    words: words.map((w) => ({ text: w.text, start: round(w.start + VOICE_OFFSET), end: round(w.end + VOICE_OFFSET) })),
  };
}

const round = (n: number) => Math.round(n * 1000) / 1000;
