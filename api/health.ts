// pages/api/health.ts
// Lightweight, zero-deps Healthcheck + CORS (Node runtime)
import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS – minimal; bei Bedarf Whitelist ergänzen
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" })
    return
  }

  res.status(200).json({
    ok: true,
    service: "tonechain-server",
    time: new Date().toISOString(),
  })
}
