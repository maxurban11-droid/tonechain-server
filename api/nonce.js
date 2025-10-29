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

// /api/nonce.js
const crypto = require("crypto");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Zufälliger Nonce (32 Zeichen)
  const nonce = crypto.randomBytes(16).toString("hex");

  res.status(200).json({
    ok: true,
    nonce,
    issuedAt: new Date().toISOString()
  });
};
