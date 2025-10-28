import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, preflight, sendJSON, setCookie, signNonce } from "./_utils";

const COOKIE_NONCE = "tc_nonce";
const COOKIE_SIG   = "tc_nsig";
const NONCE_TTL = 5 * 60; // 5 Minuten

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return;
  cors(req, res);

  if (req.method !== "GET" && req.method !== "POST") {
    sendJSON(res, 405, { error: "Method not allowed" });
    return;
  }

  const nonce = crypto.randomBytes(16).toString("hex");
  const origin = (req.headers.origin as string) || "";
  const sig = signNonce(nonce, origin);

  setCookie(res, COOKIE_NONCE, nonce, NONCE_TTL);
  setCookie(res, COOKIE_SIG, sig, NONCE_TTL);

  sendJSON(res, 200, { nonce });
}
