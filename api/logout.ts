// api/logout.ts
import { withCors, preflight } from "../lib/cors.js";
import { clearCookie } from "../lib/cookie.js";

export const config = { runtime: "nodejs18.x" };

export default async function handler(req: Request) {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return preflight(origin);
  }
  if (req.method !== "POST") {
    return withCors(new Response("Method Not Allowed", { status: 405 }), origin);
  }

  const headers = new Headers({
    "content-type": "application/json",
    "set-cookie": clearCookie("tc_session")
  });
  return withCors(new Response(JSON.stringify({ ok: true }), { status: 200, headers }), origin);
}
