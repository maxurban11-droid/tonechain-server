export default function handler(req: Request): Response {
  return new Response(
    JSON.stringify({ ok: true, name: "tonechain-server", time: new Date().toISOString() }),
    { status: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }
  )
}
