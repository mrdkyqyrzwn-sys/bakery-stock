import { after } from "next/server";
import type { Analysis } from "@/lib/ai";
import { type ProjectRow, sql } from "@/lib/db";
import { bearer, error, isUuid, json } from "@/lib/http";
import { advance } from "@/lib/pipeline";
import { quote } from "@/lib/pricing";
import { tokenMatches } from "@/lib/security";
import { DURATIONS } from "@/lib/styles";

export const runtime = "nodejs";
export const maxDuration = 300;

const IN_PROGRESS = new Set(["paid", "rendering", "merging"]);

/** Project state for its owner. Access requires the secret token issued at creation. */
export async function GET(req: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return error("not found", 404);
  const [project] = await sql()<ProjectRow[]>`select * from projects where id = ${id}`;
  if (!project || !tokenMatches(bearer(req.headers), project.access_hash)) return error("not found", 404);

  if (IN_PROGRESS.has(project.status)) after(() => advance(id));

  const [progress] = await sql()<{ total: number; done: number }[]>`
    select count(*)::int as total, count(*) filter (where status = 'done')::int as done
    from clips where project_id = ${id}`;

  const brief = project.brief as Analysis["brief"];
  const storyboard = project.storyboard as { shots: { description_he: string }[] } | null;
  return json({
    id: project.id,
    status: project.status,
    siteUrl: project.site_url,
    brandName: brief.brand_name,
    concepts: project.concepts,
    quotes: DURATIONS.map((d) => quote(d)),
    choice: project.style
      ? { style: project.style, durationS: project.duration_s, aspect: project.aspect, priceCents: project.price_cents }
      : null,
    shots: storyboard?.shots.map((s) => s.description_he) ?? [],
    progress,
    videoUrl: project.status === "done" ? project.video_url : null,
  });
}
