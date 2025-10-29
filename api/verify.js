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

// helpers/cors.ts
const ALLOWED_ORIGINS = [
  "https://your-framer-site.framer.website", // <— deine Framer-Domain
  "https://www.tonechain.xyz",               // <— deine Prod-Domain (wenn vorhanden)
]

export function pickOrigin(req: Request): string | null {
  const o = req.headers.get("origin") || ""
  return ALLOWED_ORIGINS.includes(o) ? o : null
}

export function preflightCORS(req: Request, origin: string) {
  if (req.method !== "OPTIONS") return null
  const h = new Headers()
  h.set("Access-Control-Allow-Origin", origin)
  h.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  h.set("Access-Control-Allow-Headers", "content-type")
  h.set("Access-Control-Max-Age", "600")
  h.set("Vary", "Origin")
  return new Response(null, { status: 204, headers: h })
}

// /api/verify.js
// Defensive SIWE-Verify (vereinfacht): verifiziert die Signatur einer Nachricht.
// Erwartet JSON-Body: { message: string, signature: string, expectedAddress: string }

const { verifyMessage } = require("ethers");

// kleine Helfer, um den JSON-Body zuverlässig einzulesen
async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (e) => reject(e));
  });
}

module.exports = async (req, res) => {
  // CORS – erstmal permissiv (für Tests); später Domain whitelisten
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readJson(req); // <— WICHTIG: Body selbst lesen
    const { message, signature, expectedAddress } = body || {};

    if (
      typeof message !== "string" ||
      typeof signature !== "string" ||
      typeof expectedAddress !== "string" ||
      !message ||
      !signature ||
      !expectedAddress
    ) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // ECDSA-Recover → Adresse aus Signatur gewinnen
    const recovered = verifyMessage(message, signature);

    const match =
      recovered &&
      recovered.toLowerCase() === expectedAddress.toLowerCase();

    if (!match) {
      return res.status(401).json({ ok: false, error: "Signature mismatch", recovered });
    }

    // Optional: hier könntest du eine Session setzen (HTTP-only Cookie)
    // Für jetzt nur Bestätigung zurückgeben:
    return res.status(200).json({
      ok: true,
      verified: true,
      address: recovered,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ ok: false, error: "Server verify error" });
  }
};
