import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors, json, hmacVerify } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const secret = process.env.WEBHOOK_SECRET || '';
  if (!secret) return json(res, 500, { error: 'Missing WEBHOOK_SECRET' });

  const raw = JSON.stringify(req.body || {});
  const sig = req.headers['x-tonechain-signature'] as string | undefined;
  if (!sig) return json(res, 401, { error: 'No signature' });

  if (!hmacVerify(raw, sig, secret)) return json(res, 401, { error: 'Bad signature' });

  // TODO: persist event, update order, etc.
  json(res, 200, { ok: true });
}
