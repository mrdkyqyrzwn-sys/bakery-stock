import "server-only";
import postgres from "postgres";
import { env } from "./env";

declare global {
  var __sql: postgres.Sql | undefined;
}

/** Shared Postgres client. All queries go through tagged templates, which are parameterized. */
export function sql(): postgres.Sql {
  if (!globalThis.__sql) {
    globalThis.__sql = postgres(env().DATABASE_URL, {
      max: 5,
      idle_timeout: 20,
      prepare: false,
    });
  }
  return globalThis.__sql;
}

export type ProjectStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "rendering"
  | "revising"
  | "done"
  | "failed"
  | "refunded";

export interface ProjectRow {
  id: string;
  access_hash: string;
  site_url: string;
  site_data: unknown;
  brief: unknown;
  concepts: unknown;
  style: string | null;
  duration_s: number | null;
  aspect: string | null;
  price_cents: number | null;
  currency: string | null;
  paddle_txn_id: string | null;
  coupon_code: string | null;
  status: ProjectStatus;
  error: string | null;
  uploads: { url: string }[];
  plan: unknown;
  media: unknown;
  animation_html: string | null;
  revision_request: RevisionRequest | null;
  revision_count: number;
  revisions: { at: string; request: RevisionRequest; previousVideoUrl: string | null; failed?: boolean }[];
  stage: "planning" | "media" | "writing" | "reviewing" | "rendering" | null;
  render_progress: number;
  error_count: number;
  video_url: string | null;
  created_at: Date;
  paid_at: Date | null;
}

/** A customer's change request after delivery: free text and/or exact new headline texts. */
export interface RevisionRequest {
  text: string;
  /** New on-screen headline per scene; null keeps the current one. */
  headlines: (string | null)[];
}
