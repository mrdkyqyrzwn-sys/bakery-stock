import { SITE } from "@/lib/site";

/** Tells security researchers how to report a problem (RFC 9116). */
export function GET() {
  const expires = new Date(Date.now() + 180 * 86400_000).toISOString();
  const body = [
    `Contact: mailto:${SITE.email}`,
    `Expires: ${expires}`,
    "Preferred-Languages: he, en",
    `Canonical: ${SITE.url}/.well-known/security.txt`,
  ].join("\n");
  return new Response(body + "\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
