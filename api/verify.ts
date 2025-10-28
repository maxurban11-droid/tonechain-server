// api/verify.ts
import { withCors, preflight } from "../lib/cors.js";
import { readCookie, setCookie, clearCookie } from "../lib/cookie.js";
import { verifySiweMessage } from "../lib/siwe.js";

export const config = { runtime: "nodejs18.x" };

type Body = { address?: string; message?: string; signature?: string };

export default async function handler(req: Request) {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return preflight(origin);
  }
  if (req.method !== "POST") {
    return withCors(new Response("Method Not Allowed", { status: 405 }), origin);
  }

  const { address, message, signature } = (await req.json().catch(() => ({}))) as Body;
  if (!address || !message || !signature) {
    return withCors(new Response("Bad Request", { status: 400 }), origin);
  }

  const nonce = readCookie(req, "tc_nonce");
  if (!nonce) {
    return withCors(new Response("Nonce missing", { status: 400 }), origin);
  }

  const res = await verifySiweMessage(message, signature, address, nonce);
  if (!res.ok) {
    // Nonce aufräumen
    const headers = new Headers({
      "content-type": "application/json",
      "set-cookie": clearCookie("tc_nonce")
    });
    return withCors(
      new Response(JSON.stringify({ ok: false, error: res.error }), { status: 401, headers }),
      origin
    );
  }

  // Session-Token minimal (hier: Adresse + simple Signatur der Adresse)
  // In echt: HMAC/Signatur mit Server-Secret.
  const session = Buffer.from(JSON.stringify({ a: res.address, t: Date.now() })).toString("base64url");

  const headers = new Headers({
    "content-type": "application/json",
    // Nonce invalidieren
    "set-cookie": [
      clearCookie("tc_nonce"),
      setCookie("tc_session", session, 60 * 60 * 24 * 7) // 7 Tage
    ].join(", ")
  });

  return withCors(new Response(JSON.stringify({ ok: true }), { status: 200, headers }), origin);
}
