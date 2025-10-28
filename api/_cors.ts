// api/_cors.ts
const ALLOWED_ORIGINS = [
  "https://<dein-framer-preview>.framer.app",
  "https://<deine-prod-domain>" // falls vorhanden
];

export function withCors(res: Response, origin: string | null, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Headers", "content-type");
    headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }
  return new Response(res.body, { ...init, headers });
}

export function preflight(origin: string | null) {
  return withCors(new Response(null, { status: 204 }), origin);
}
