// pages/api/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyMessage } from "ethers";
import { ORIGIN_ALLOW_REGEX } from "@/helpers/cors"; // optional re-export
// kleine Origin-Pick-Funktion für Node:
function pickOriginNode(req: NextApiRequest): string | null {
  const o = (req.headers.origin as string) || "";
  return ORIGIN_ALLOW_REGEX.some((re) => re.test(o)) ? o : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = pickOriginNode(req);
  if (!origin) {
    res.status(403).end("Forbidden");
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const { message, signature, expectedAddress } = req.body ?? {};
    if (
      typeof message !== "string" ||
      typeof signature !== "string" ||
      typeof expectedAddress !== "string" ||
      !message || !signature || !expectedAddress
    ) {
      res.status(400).json({ ok: false, error: "Missing fields" });
      return;
    }
    const recovered = verifyMessage(message, signature);
    const match = recovered?.toLowerCase() === expectedAddress.toLowerCase();
    if (!match) {
      res.status(401).json({ ok: false, error: "Signature mismatch", recovered });
      return;
    }
    res.status(200).json({ ok: true, verified: true, address: recovered, ts: new Date().toISOString() });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ ok: false, error: "Server verify error" });
  }
}
