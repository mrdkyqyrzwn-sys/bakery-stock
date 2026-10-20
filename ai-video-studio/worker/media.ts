/**
 * Media for the video: generated photos (fal.ai), narration with word timings and original
 * music (ElevenLabs). Every call is server-to-server with our own API keys.
 */
import { createFalClient } from "@fal-ai/client";
import { env } from "../src/lib/env";
import { canvasSize } from "./renderer";

const ELEVEN = "https://api.elevenlabs.io/v1";
const MAX_DOWNLOAD = 15_000_000;

function required(name: "FAL_KEY" | "ELEVENLABS_API_KEY"): string {
  const value = env()[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

let fal: ReturnType<typeof createFalClient> | undefined;

/** Generate one photorealistic image at the video's full resolution. Returns JPEG bytes. */
export async function generateImage(prompt: string, aspect: string): Promise<Buffer> {
  fal ??= createFalClient({ credentials: required("FAL_KEY") });
  const { width, height } = canvasSize(aspect);
  const result = await fal.subscribe(env().FAL_IMAGE_MODEL, {
    input: {
      prompt,
      image_size: { width, height },
      output_format: "jpeg",
      safety_tolerance: "2",
      enable_safety_checker: true,
    },
  });
  const url = (result.data as { images?: { url?: string }[] }).images?.[0]?.url;
  if (!url?.startsWith("https://")) throw new Error("image model returned no image");
  return download(url);
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_DOWNLOAD) throw new Error("downloaded file too large");
  return bytes;
}

export interface Word {
  text: string;
  start: number;
  end: number;
}

export interface Narration {
  audio: Buffer;
  words: Word[];
  /** Start time of every character, for mapping script lines to times. */
  charStarts: number[];
  duration: number;
}

/** Text to speech with character timings, so on-screen text can follow the voice exactly. */
export async function narrate(opts: {
  text: string;
  voiceId: string;
  languageCode: string;
  speed?: number;
}): Promise<Narration> {
  const res = await fetch(`${ELEVEN}/text-to-speech/${encodeURIComponent(opts.voiceId)}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST",
    headers: { "xi-api-key": required("ELEVENLABS_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({
      text: opts.text,
      model_id: env().ELEVENLABS_TTS_MODEL,
      language_code: opts.languageCode,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: opts.speed ?? 1 },
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    audio_base64: string;
    alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } | null;
  };
  const a = data.alignment;
  if (!a || a.characters.length === 0) throw new Error("TTS returned no timing data");
  return {
    audio: Buffer.from(data.audio_base64, "base64"),
    words: groupWords(a.characters, a.character_start_times_seconds, a.character_end_times_seconds),
    charStarts: a.character_start_times_seconds,
    duration: a.character_end_times_seconds.at(-1) ?? 0,
  };
}

export function groupWords(chars: string[], starts: number[], ends: number[]): Word[] {
  const words: Word[] = [];
  let current: Word | null = null;
  chars.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (current) words.push(current);
      current = null;
      return;
    }
    if (!current) current = { text: "", start: starts[i], end: ends[i] };
    current.text += ch;
    current.end = ends[i];
  });
  if (current) words.push(current);
  return words;
}

/** Original instrumental music of an exact length. Returns MP3 bytes. */
export async function composeMusic(prompt: string, seconds: number): Promise<Buffer> {
  const res = await fetch(`${ELEVEN}/music?output_format=mp3_44100_192`, {
    method: "POST",
    headers: { "xi-api-key": required("ELEVENLABS_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({
      prompt,
      music_length_ms: Math.round(Math.max(3, seconds) * 1000),
      model_id: env().ELEVENLABS_MUSIC_MODEL,
      force_instrumental: true,
    }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`ElevenLabs music ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}
