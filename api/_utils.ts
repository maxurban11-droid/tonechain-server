import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGINS = [
  "https://*.framer.app",                    // Wildcard-Match per checkOrigin()
  "https://*.framercanvas.com",
  "https://tonechain.framer.website",        // falls eigene Framer-Domain
  "http://localhost:5173",
  "http://localhost:3000"
];

// DEMO: fester Secret-Fallback, weil Framer keine ENV kann.
// Für Produktion in Vercel als ENV setzen (SESSION_SECRET).
const SESSION_SECRET = process.env.SESSION_SECRET || "tonechain_demo_secret";

export function checkOrigin(origin?: string): string | null {
  if (!origin) return null;
  // grobe Wildcard-Unterstützung
  for (const rule of ALLOWED_ORIGINS) {
    if (rule.includes("*")) {
      const re = new RegExp("^" + rule.replace(".", "\\.").replace("*", ".*") + "$");
      if (re.test(origin)) return origin;
    } else if (origin === rule) {
      return origin;
    }
  }
  return null;
}

export function cors(req: VercelRequest, res: VercelResponse) {
  const origin = checkOrigin(req.headers.origin as string | undefined);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export function preflight(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    cors(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}

export function sendJSON(res: VercelResponse, code: number, data: any) {
  res.status(code).setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export function setCookie(res: VercelResponse, name: string, value: string, maxAgeSec: number) {
  const cookie = [
    `${name}=${value}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=None`,
    `Secure`,
    `Max-Age=${maxAgeSec}`
  ].join("; ");
  res.setHeader("Set-Cookie", cookie);
}

export function clearCookie(res: VercelResponse, name: string) {
  res.setHeader(
    "Set-Cookie",
    `${name}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`
  );
}

// HMAC-Signatur für Nonce (bindet grob an Origin + Secret)
export function signNonce(nonce: string, origin: string | null) {
  const h = crypto.createHmac("sha256", SESSION_SECRET);
  h.update(nonce + "|" + (origin || ""));
  return h.digest("hex");
}

export function verifyNonce(nonce: string, origin: string | null, sig: string) {
  const calc = signNonce(nonce, origin);
  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(sig));
}
