import { handleOptions, setCors } from "./_lib/cors";

type Req = { method?: string };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  send: (s: string) => void;
  end: () => void;
};

export default function handler(req: Req, res: Res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  res.status(200).send("ok");
}
