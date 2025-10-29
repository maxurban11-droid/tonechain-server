// /api/nonce.js  (Edge Runtime, pures JS – keine TS-Typen)
import { pickOrigin, preflightCORS } from "../helpers/cors"
import { securityHeaders } from "../helpers/headers"

export const config = { runtime: "edge" }

export default async function handler(req) {
  const origin = pickOrigin(req)
  if (!origin) return new Response("Forbidden", { status: 403 })

  // CORS Preflight
  const pre = preflightCORS(req, origin)
  if (pre) return pre

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  // Nonce: bevorzugt Edge/Web Crypto, sonst stabiler Fallback
  const rand =
    (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function")
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)

  const headers = securityHeaders(origin)
  headers.set("Content-Type", "application/json; charset=utf-8")

  const body = JSON.stringify({
    ok: true,
    nonce: rand,
    issuedAt: new Date().toISOString(),
  })

  return new Response(body, { status: 200, headers })
}
