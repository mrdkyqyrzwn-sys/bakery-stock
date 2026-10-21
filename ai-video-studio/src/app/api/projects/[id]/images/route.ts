import sharp from "sharp";
import { type ProjectRow, sql } from "@/lib/db";
import { bearer, error, isUuid, json } from "@/lib/http";
import { MAX_UPLOADS, sniffImageType } from "@/lib/image-check";
import { clientIp, hashIp, isSameOrigin, rateLimit, tokenMatches } from "@/lib/security";
import { deleteFiles, storeFile } from "@/lib/storage";

export const runtime = "nodejs";

// The browser shrinks photos to max 2560px JPEG before upload, so real uploads are ~0.5-2 MB.
const MAX_BYTES = 4_000_000;

async function authorize(req: Request, id: string): Promise<ProjectRow | Response> {
  if (!isSameOrigin(req.headers)) return error("forbidden", 403);
  if (!isUuid(id)) return error("not found", 404);
  const [project] = await sql()<ProjectRow[]>`select * from projects where id = ${id}`;
  if (!project || !tokenMatches(bearer(req.headers), project.access_hash)) return error("not found", 404);
  if (project.status !== "draft" && project.status !== "awaiting_payment") return error("ההזמנה כבר בהפקה", 409);
  return project;
}

/** Upload one customer photo (raw image bytes in the body). */
export async function POST(req: Request, ctx: RouteContext<"/api/projects/[id]/images">) {
  const { id } = await ctx.params;
  const project = await authorize(req, id);
  if (project instanceof Response) return project;
  if (!(await rateLimit(`upload:${hashIp(clientIp(req.headers))}`, 60, 3600))) return error("יותר מדי העלאות", 429);
  if (project.uploads.length >= MAX_UPLOADS) return error(`אפשר להעלות עד ${MAX_UPLOADS} תמונות`, 400);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return error("התמונה גדולה מדי", 413);
  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) return error("התמונה גדולה מדי", 413);
  const type = sniffImageType(bytes);
  if (!type) return error("אפשר להעלות רק תמונות JPG, PNG או WEBP", 415);

  // Re-encode on the server: drops GPS and all other metadata even if the browser step was skipped,
  // and turns any file that merely looks like an image (a "polyglot") into a plain JPEG.
  let clean: Buffer;
  try {
    clean = await sharp(bytes, { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } catch {
    return error("לא הצלחנו לקרוא את התמונה. נסו קובץ אחר.", 415);
  }
  const url = await storeFile(`uploads/${id}/photo.jpg`, clean, "image/jpeg");
  // Append atomically and re-check the limit, so parallel uploads cannot exceed it.
  const updated = await sql()`
    update projects set uploads = uploads || ${sql().json([{ url }])}, updated_at = now()
    where id = ${id} and jsonb_array_length(uploads) < ${MAX_UPLOADS}
    returning id`;
  if (updated.length === 0) {
    await deleteFiles([url]);
    return error(`אפשר להעלות עד ${MAX_UPLOADS} תמונות`, 400);
  }
  return json({ url });
}

/** Remove one uploaded photo. Body: { url } */
export async function DELETE(req: Request, ctx: RouteContext<"/api/projects/[id]/images">) {
  const { id } = await ctx.params;
  const project = await authorize(req, id);
  if (project instanceof Response) return project;
  const body = (await req.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url : "";
  if (!project.uploads.some((u) => u.url === url)) return error("not found", 404);
  await sql()`
    update projects set uploads = (
      select coalesce(jsonb_agg(u), '[]'::jsonb) from jsonb_array_elements(uploads) u where u->>'url' <> ${url}
    ), updated_at = now()
    where id = ${id}`;
  await deleteFiles([url]);
  return json({ ok: true });
}
