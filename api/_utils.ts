// api/_util.ts
import { randomBytes, createHmac } from "crypto"

export const FIVE_MIN = 60 * 5
export const ONE_DAY  = 60 * 60 * 24

export function makeNonce(len = 16) {
  return randomBytes(len).toString("hex") // 32 hex chars
}

export function json(body: any, init: number | ResponseInit = 200) {
  const resInit: ResponseInit = typeof init === "number" ? { status: init } : init
  return new Response(JSON.stringify(body), {
    ...resInit,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(resInit.headers || {}),
    },
  })
}

export function corsPreflight(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-max-age": "86400"
      }
    })
  }
  return null
}

export function cookie(name: string, value: string, opt?: {
  httpOnly?: boolean; secure?: boolean; sameSite?: "Lax"|"Strict"|"None";
  path?: string; maxAge?: number; expires?: Date;
}) {
  const p: string[] = [`${name}=${encodeURIComponent(value)}`]
  if (opt?.path !== undefined)     p.push(`Path=${opt.path}`)
  else                              p.push("Path=/")
  if (opt?.httpOnly !== false)      p.push("HttpOnly")
  if (opt?.secure !== false)        p.push("Secure")
  p.push(`SameSite=${opt?.sameSite || "Lax"}`)
  if (opt?.maxAge)                  p.push(`Max-Age=${opt.maxAge}`)
  if (opt?.expires)                 p.push(`Expires=${opt.expires.toUTCString()}`)
  return p.join("; ")
}

export function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || ""
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

export function clearCookie(name: string) {
  return cookie(name, "", { maxAge: 0 })
}

// extrem simpler HMAC-Token (statt JWT), nur fürs Demo
export function makeSession(address: string, nonce: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me"
  const payload = JSON.stringify({ a: address.toLowerCase(), iat: Date.now() })
  const sig = createHmac("sha256", secret).update(payload + "." + nonce).digest("base64url")
  return Buffer.from(payload).toString("base64url") + "." + sig
}
