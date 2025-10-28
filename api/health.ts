import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, preflight, sendJSON } from "./_utils";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return;
  cors(req, res);
  sendJSON(res, 200, { ok: true, name: "tonechain-server", time: Date.now() });
}
