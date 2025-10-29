const ALLOWED_ORIGINS = [
  "https://your-framer-site.framer.website",
  "https://www.tonechain.xyz",
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
  h.set("Access-Control-Allow-Headers", "content-type, authorization")
  h.set("Access-Control-Max-Age", "600")
  h.set("Vary", "Origin")
  return new Response(null, { status: 204, headers: h })
}
