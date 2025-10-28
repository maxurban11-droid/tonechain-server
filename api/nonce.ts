// api/nonce.ts
import { corsPreflight, json, makeNonce, cookie, FIVE_MIN } from "./_util"

export default async function handler(req: Request): Promise<Response> {
  const pre = corsPreflight(req)
  if (pre) return pre

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405)
  }

  const nonce = makeNonce(16)

  return new Response(JSON.stringify({ nonce }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "set-cookie": [
        // Nonce 5 Minuten gültig, httpOnly, Secure, Lax
        cookie("tc_nonce", nonce, { maxAge: FIVE_MIN }),
      ].join(", ")
    }
  })
  // api/nonce.ts
export default async function handler(req, res) {
  const origin = req.headers.origin || null;
  if (req.method === "OPTIONS") {
    return res.send(preflight(origin)); // 204
  }

  // Nonce generieren …
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // httpOnly Cookie setzen (SameSite=None + Secure!)
  res.setHeader("Set-Cookie", `tc_nonce=${nonce}; HttpOnly; Path=/; Max-Age=300; SameSite=None; Secure`);

  return withCors(
    res.json({ nonce }),
    origin
  );
}
}
