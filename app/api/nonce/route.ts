// app/api/nonce/route.ts
import { pickOrigin, preflightCORS, corsHeadersFor } from "@/helpers/cors"

export const runtime = "edge"

export async function OPTIONS(req: Request) {
  const origin = pickOrigin(req)
  if (!origin) return new Response("Forbidden", { status: 403 })
  return preflightCORS(req, origin)
}

export async function GET(req: Request) {
  const origin = pickOrigin(req)
  if (!origin) return new Response("Forbidden", { status: 403 })

  const nonce =
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)

  const headers = corsHeadersFor(origin)
  headers.set("Content-Type", "application/json; charset=utf-8")

  return new Response(
    JSON.stringify({ ok: true, nonce, issuedAt: new Date().toISOString() }),
    { status: 200, headers }
  )
}
