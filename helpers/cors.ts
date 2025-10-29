// helpers/cors.ts
const ORIGIN_ALLOW_REGEX: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*framer\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*framer\.website$/i,
  /^https:\/\/tonechain\.xyz$/i,
  /^https:\/\/www\.tonechain\.xyz$/i,
];

const ORIGIN_ALLOW_EXACT = new Set<string>([
  // Trage hier optional *konkrete* Preview-URLs ein, z. B.:
  "https://concave-device-193297.framer.app",
]);

export function pickOrigin(req: Request): string | null {
  const o = req.headers.get("origin") || "";
  if (!o) return null;
  if (ORIGIN_ALLOW_EXACT.has(o)) return o;
  if (ORIGIN_ALLOW_REGEX.some((re) => re.test(o))) return o;
  return null;
}

export function corsHeadersFor(origin: string): Headers {
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", origin);
  h.set("Access-Control-Allow-Credentials", "true"); // <- WICHTIG bei credentials: "include"
  h.set("Vary", "Origin");
  return h;
}

export function preflightCORS(
  req: Request,
  origin: string,
  {
    allowMethods = "GET,POST,OPTIONS",
    allowHeaders = "content-type, authorization",
    maxAge = "600",
  }: { allowMethods?: string; allowHeaders?: string; maxAge?: string } = {}
) {
  if (req.method !== "OPTIONS") return null;
  const h = corsHeadersFor(origin);
  h.set("Access-Control-Allow-Methods", allowMethods);
  h.set("Access-Control-Allow-Headers", allowHeaders);
  h.set("Access-Control-Max-Age", maxAge);
  return new Response(null, { status: 204, headers: h });
}
