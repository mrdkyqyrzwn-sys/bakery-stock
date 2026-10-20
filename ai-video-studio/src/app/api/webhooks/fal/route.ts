import { after } from "next/server";
import { isUuid, json } from "@/lib/http";
import { advance } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * fal calls this when a clip or merge finishes. The body is ignored on purpose: advance()
 * reads the real result from fal's authenticated API, so a forged call can do no harm.
 */
export async function POST(req: Request) {
  const projectId = new URL(req.url).searchParams.get("project");
  if (isUuid(projectId)) after(() => advance(projectId));
  return json({ ok: true });
}
