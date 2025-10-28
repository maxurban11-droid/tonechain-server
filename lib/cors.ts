// lib/cors.ts
const ALLOWED_ORIGINS = [
  // <<< HIER deine Framer-URLs eintragen >>>
  "https://*.framer.app",
  // Optional: Production-Domain später
  // "https://app.tonechain.xyz"
];

function originAllowed(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    // primitive wildcard für *.framer.app
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    if (ALLOWED_ORIGINS.includes(`https://${hostname}`)) return origin;
    if (hostname.endsWith(".framer.app")) return origin;
  } catch {}
  return null;
}

export function withCors(res: Response, origin: string | null, init?: ResponseInit) {
  const allowed = originAllowed(origin);
  const headers = new Headers(init?.headers);

  if (allowed) {
    headers.set("Access-Control-Allow-Origin", allowed);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Headers", "content-type");
    headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }
  return new Response(res.body, { ...init, headers, status: res.status });
}

export function preflight(origin: string | null) {
  return withCors(new Response(null, { status: 204 }), origin);
}
