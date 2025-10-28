import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors, json, clearSessionCookie } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  clearSessionCookie(res);
  json(res, 200, { ok: true });
}
