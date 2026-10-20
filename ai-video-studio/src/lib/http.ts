import "server-only";
import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "cache-control": "no-store" } });
}

export function error(message: string, status: number) {
  return json({ error: message }, status);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string | null | undefined): value is string {
  return !!value && UUID.test(value);
}

export function bearer(headers: Headers): string | null {
  const h = headers.get("authorization");
  return h?.startsWith("Bearer ") ? h.slice(7) : null;
}
