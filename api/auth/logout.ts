import { handleOptions, setCors } from "../_lib/cors";

type Req = { method?: string };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  json: (d: any) => void;
  end: () => void;
};

export default function handler(req: Req, res: Res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  // Falls du später HttpOnly-Session-Cookies nutzt:
  // res.setHeader("Set-Cookie", "tc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");

  res.status(200).json({ ok: true });
}
