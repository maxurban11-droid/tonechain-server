// helpers/cors.ts — Framer-kompatibles CORS mit ToneChain-Whitelist

const ORIGIN_ALLOW_REGEX: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*framer\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*framer\.website$/i,
  /^https:\/\/(www\.)?tonechain\.xyz$/i,
]

const ORIGIN_ALLOW_EXACT = new Set<string>([
  "https://concave-device-193297.framer.app", // dein Framer-Projekt
])

export function pickOrigin(req: Request): string | null {
  const o = req.headers.get("origin") || ""
  if (!o) return null
  if (ORIGIN_ALLOW_EXACT.has(o)) return o
  if (ORIGIN_ALLOW_REGEX.some((re) => re.test(o))) return o
  return null
}

export function corsHeadersFor(origin: string): Headers {
  const h = new Headers()
  h.set("Access-Control-Allow-Origin", origin)
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  h.set("Access-Control-Allow-Headers", "content-type, authorization")
  h.set("Access-Control-Max-Age", "600")
  h.set("Vary", "Origin")
  return h
}

export function preflightCORS(req: Request, origin: string): Response | null {
  if (req.method !== "OPTIONS") return null
  return new Response(null, { status: 204, headers: corsHeadersFor(origin) })
}
