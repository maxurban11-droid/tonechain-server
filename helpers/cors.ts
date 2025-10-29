// helpers/cors.ts

// 1) Whitelist per Regex (breit, aber kontrolliert)
const ORIGIN_ALLOW_REGEX: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*framer\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*framer\.website$/i,
  /^https:\/\/www\.tonechain\.xyz$/i,
  /^https:\/\/tonechain\.xyz$/i,
]

// 2) Exakte Whitelist-Einträge (schnelle, direkte Treffer)
const ORIGIN_ALLOW_EXACT = new Set<string>([
  // ← aus deinem Screenshot/Setup übernommen:
  "https://concave-device-193297.framer.app",
])

// 3) Optional: zusätzliche Origins per ENV anhängen (kommagetrennt)
;(typeof process !== "undefined" &&
  process?.env?.ALLOWED_EXTRA_ORIGINS &&
  process.env.ALLOWED_EXTRA_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((o) => ORIGIN_ALLOW_EXACT.add(o)))

// -- API ---------------------------------------------------------------------

/** Nimmt den Origin-Header entgegen und entscheidet, ob er erlaubt ist. */
export function pickOrigin(req: Request): string | null {
  const o = req.headers.get("origin") || ""
  if (!o) return null
  if (ORIGIN_ALLOW_EXACT.has(o)) return o
  if (ORIGIN_ALLOW_REGEX.some((re) => re.test(o))) return o
  return null
}

/** Basale CORS-Header für erfolgreiche Antworten. */
export function corsHeadersFor(origin: string): Headers {
  const h = new Headers()
  h.set("Access-Control-Allow-Origin", origin)
  // wichtig: verhindert Cache-Vergiftungen über Proxies/CDNs
  h.set("Vary", "Origin")
  return h
}

/** Einheitliches Preflight-Handling für OPTIONS-Requests. */
export function preflightCORS(
  req: Request,
  origin: string,
  {
    allowMethods = "GET,POST,OPTIONS",
    allowHeaders = "content-type, authorization",
    maxAge = "600",
  }: {
    allowMethods?: string
    allowHeaders?: string
    maxAge?: string
  } = {}
) {
  if (req.method !== "OPTIONS") return null
  const h = corsHeadersFor(origin)
  h.set("Access-Control-Allow-Methods", allowMethods)
  h.set("Access-Control-Allow-Headers", allowHeaders)
  h.set("Access-Control-Max-Age", maxAge)
  return new Response(null, { status: 204, headers: h })
}

// (optional) Exportiere Rohdaten, falls du sie in Node-Routen wiederverwenden willst
export { ORIGIN_ALLOW_REGEX }
