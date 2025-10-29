import { pickOrigin, preflightCORS } from "../helpers/cors"
import { securityHeaders } from "../helpers/headers"

export const config = { runtime: "edge" }

export default async function handler(req: Request): Promise<Response> {
  const origin = pickOrigin(req)
  if (!origin) return new Response("Forbidden", { status: 403 })

  const pre = preflightCORS(req, origin)
  if (pre) return pre

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const nonce =
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)

  const headers = securityHeaders(origin)
  headers.set("Content-Type", "application/json; charset=utf-8")

  return new Response(
    JSON.stringify({ ok: true, nonce, issuedAt: new Date().toISOString() }),
    { status: 200, headers }
  )
}
