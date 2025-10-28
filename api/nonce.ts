// api/nonce.ts
import { withCors, preflight } from "../lib/cors.js";
import { setCookie } from "../lib/cookie.js";

export const config = { runtime: "nodejs18.x" };

export default async function handler(req: Request) {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return preflight(origin);
  }
  if (req.method !== "GET") {
    return withCors(new Response("Method Not Allowed", { status: 405 }), origin);
  }

  // 20 Bytes random → base64url
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const headers = new Headers({
    "content-type": "application/json",
    "set-cookie": setCookie("tc_nonce", nonce, 300) // 5 min gültig
  });

  return withCors(new Response(JSON.stringify({ nonce }), { status: 200, headers }), origin);
}
