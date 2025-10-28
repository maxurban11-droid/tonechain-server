// api/me.ts
import { withCors, preflight } from "../lib/cors.js";
import { readCookie } from "../lib/cookie.js";

export const config = { runtime: "nodejs18.x" };

export default async function handler(req: Request) {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return preflight(origin);
  }
  if (req.method !== "GET") {
    return withCors(new Response("Method Not Allowed", { status: 405 }), origin);
  }

  const session = readCookie(req, "tc_session");
  if (!session) {
    return withCors(new Response(JSON.stringify({ ok: false }), { status: 200, headers: { "content-type": "application/json" } }), origin);
  }

  try {
    const data = JSON.parse(Buffer.from(session, "base64url").toString("utf8"));
    return withCors(
      new Response(JSON.stringify({ ok: true, address: data.a }), {
        status: 200,
        headers: { "content-type": "application/json" }
      }),
      origin
    );
  } catch {
    return withCors(new Response(JSON.stringify({ ok: false }), { status: 200, headers: { "content-type": "application/json" } }), origin);
  }
}
