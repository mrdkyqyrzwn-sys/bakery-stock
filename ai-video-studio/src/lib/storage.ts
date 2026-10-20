import "server-only";
import { del, put } from "@vercel/blob";
import { env } from "./env";

function token(): string {
  const t = env().BLOB_READ_WRITE_TOKEN;
  if (!t) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  return t;
}

/** Store a file publicly under an unguessable URL (random suffix). */
export async function storeFile(pathname: string, body: Buffer | ReadableStream | NodeJS.ReadableStream, contentType: string) {
  const blob = await put(pathname, body as Buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    multipart: !(body instanceof Buffer),
    token: token(),
  });
  return blob.url;
}

export function isOurBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function deleteFiles(urls: string[]) {
  const ours = urls.filter(isOurBlobUrl);
  if (ours.length > 0 && env().BLOB_READ_WRITE_TOKEN) await del(ours, { token: token() }).catch(() => {});
}
