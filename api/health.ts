// helpers/headers.ts
export function securityHeaders(origin?: string) {
  const h = new Headers()
  h.set("Content-Security-Policy",
    "default-src 'none'; img-src 'none'; font-src 'none'; style-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; connect-src 'self';"
  )
  h.set("Referrer-Policy", "no-referrer")
  h.set("X-Content-Type-Options", "nosniff")
  h.set("X-Frame-Options", "DENY")
  h.set("Cross-Origin-Opener-Policy", "same-origin")
  h.set("Cross-Origin-Resource-Policy", "same-site")
  h.set("Permissions-Policy", "accelerometer=(), geolocation=(), camera=(), microphone=()")
  // CORS (streng, siehe unten)
  if (origin) {
    h.set("Access-Control-Allow-Origin", origin)
    h.set("Vary", "Origin")
  }
  return h
}
// Lightweight, zero-deps Healthcheck + CORS
export default async function handler(req: any, res: any) {
  // CORS – minimal, aber robust; du kannst hier origin-Whitelists ergänzen
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  res.status(200).json({
    ok: true,
    service: "tonechain-server",
    time: new Date().toISOString()
  });
}
