// Minimal-CORS utils, ohne externe Typ-Pakete
type Req = { method?: string };
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => Res;
  json: (d: any) => void;
  send: (s: string) => void;
  end: () => void;
};

export function setCors(res: Res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Demo: kein Cookie-Flow
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleOptions(req: Req, res: Res) {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(200).end();
    return true;
  }
  return false;
}
