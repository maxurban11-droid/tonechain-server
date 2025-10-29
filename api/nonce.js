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
import { pickOrigin, preflightCORS } from "../helpers/cors"
import { securityHeaders } from "../helpers/headers"

export const config = { runtime: "edge" }

export default async function handler(req: Request) {
  const origin = pickOrigin(req)
  if (!origin) return new Response("Forbidden", { status: 403 })

  const pre = preflightCORS(req, origin)
  if (pre) return pre

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  // generate nonce (httpOnly cookie recommended; hier als JSON minimal)
  const nonce = crypto.randomUUID()

  const headers = securityHeaders(origin)
  headers.set("Content-Type", "application/json; charset=utf-8")

  return new Response(JSON.stringify({ nonce }), { status: 200, headers })
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
