// /api/auth/nonce.ts
import { pickOrigin, preflightCORS, corsHeadersFor } from "../../helpers/cors";
import { securityHeaders } from "../../helpers/headers";

export const config = { runtime: "edge" }; // <-- Erzwingt Edge, passend zu (req: Request)

export default async function handler(req: Request): Promise<Response> {
  const origin = pickOrigin(req);
  if (!origin) return new Response("Forbidden", { status: 403 });

  const pre = preflightCORS(req, origin);
  if (pre) return pre;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const nonce =
    (globalThis.crypto as any)?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  // HttpOnly Nonce-Cookie setzen
  const cookie = [
    `tc_nonce=${encodeURIComponent(nonce)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=None",
    "Max-Age=300",
  ].join("; ");

  const base = securityHeaders(origin);
  const cors = corsHeadersFor(origin);
  const headers = new Headers([...base, ...cors]);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.append("Set-Cookie", cookie);

  return new Response(
    JSON.stringify({ ok: true, nonce, issuedAt: new Date().toISOString() }),
    { status: 200, headers }
  );
}
