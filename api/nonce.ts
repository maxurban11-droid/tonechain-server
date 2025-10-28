import { randomBytes } from "crypto";
import { handleOptions, setCors } from "./_lib/cors";

type Req = { method?: string; body?: any };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  json: (d: any) => void;
  end: () => void;
};

export default function handler(req: Req, res: Res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const nonce = randomBytes(16).toString("hex");
  res.status(200).json({ nonce, issuedAt: new Date().toISOString() });
}
