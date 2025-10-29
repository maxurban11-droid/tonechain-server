export function securityHeaders(origin?: string) {
  const h = new Headers()
  h.set(
    "Content-Security-Policy",
    "default-src 'none'; img-src 'none'; font-src 'none'; style-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; connect-src 'self';"
  )
  h.set("Referrer-Policy", "no-referrer")
  h.set("X-Content-Type-Options", "nosniff")
  h.set("X-Frame-Options", "DENY")
  h.set("Cross-Origin-Opener-Policy", "same-origin")
  h.set("Cross-Origin-Resource-Policy", "same-site")
  h.set("Permissions-Policy", "accelerometer=(), geolocation=(), camera=(), microphone=()")
  if (origin) {
    h.set("Access-Control-Allow-Origin", origin)
    h.set("Access-Control-Allow-Credentials", "true")
    h.set("Vary", "Origin")
  }
  return h
}
