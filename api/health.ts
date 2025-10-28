import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors, json } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowCors(req, res)) return;
  json(res, 200, { ok: true, ts: Date.now() });
}
