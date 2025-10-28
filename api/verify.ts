import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SiweMessage } from "siwe";
import {
  cors, preflight, sendJSON, verifyNonce, clearCookie, setCookie
} from "./_utils";

const COOKIE_NONCE = "tc_nonce";
const COOKIE_SIG   = "tc_nsig";
const COOKIE_SESS  = "tc_sess"; // Demo-Session (nur als Platzhalter)

function readCookie(req: VercelRequest, name: string): string | null {
  const raw = req.headers.cookie || "";
  const m = raw.split(/;\s*/).find(c => c.startsWith(name + "="));
  return m ? decodeURIComponent(m.split("=").slice(1).join("=")) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return;
  cors(req, res);

  if (req.method !== "POST") {
    sendJSON(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const { message, signature } = req.body || {};
    if (!message || !signature) {
      sendJSON(res, 400, { error: "Missing message/signature" });
      return;
    }

    // 1) Nonce aus Cookies validieren
    const nonce = readCookie(req, COOKIE_NONCE);
    const nsig  = readCookie(req, COOKIE_SIG);
    const origin = (req.headers.origin as string) || null;

    if (!nonce || !nsig || !verifyNonce(nonce, origin, nsig)) {
      sendJSON(res, 400, { error: "Invalid or missing nonce" });
      return;
    }

    // 2) SIWE prüfen
    const msg = new SiweMessage(message);
    const fields = await msg.validate(signature);

    // 3) Nonce muss SIWE-Message entsprechen
    if (fields.nonce !== nonce) {
      sendJSON(res, 400, { error: "Nonce mismatch" });
      return;
    }

    // 4) Erfolgreich → Demo-Session setzen (httpOnly)
    clearCookie(res, COOKIE_NONCE);
    clearCookie(res, COOKIE_SIG);
    setCookie(res, COOKIE_SESS, "1", 60 * 30); // 30min

    sendJSON(res, 200, { ok: true, address: fields.address });
  } catch (e: any) {
    sendJSON(res, 400, { error: e?.message || "Verify failed" });
  }
}
