import { createHmac } from "crypto";
import { handleOptions, setCors } from "./_lib/cors";

type Req = { method?: string; body?: any };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  json: (d: any) => void;
  end: () => void;
};

const DEMO_SECRET = "REPLACE_ME_WITH_A_LONG_RANDOM_SECRET"; // später ENV

export default function handler(req: Req, res: Res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { address, message, signature } = req.body ?? {};
    if (!address || !message || !signature) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    // ⚠️ Demo: KEINE echte SIWE/EIP-191 Verifikation.
    // Später: SIWE korrekt prüfen und Nonce serverseitig validieren.

    const payload = JSON.stringify({ sub: address, ts: Date.now() });
    const mac = createHmac("sha256", DEMO_SECRET).update(payload).digest("hex");
    const token = Buffer.from(`${payload}.${mac}`).toString("base64url");

    res.status(200).json({ ok: true, token });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "verify failed" });
  }
}
