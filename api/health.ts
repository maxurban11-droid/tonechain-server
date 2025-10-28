import { handleOptions, setCors } from "./_lib/cors";

type Req = { method?: string };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  send: (s: string) => void;
  end: () => void;
};

export default function handler(req: any, res: any) {
  res.status(200).send("ok")
}
