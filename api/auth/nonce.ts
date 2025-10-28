import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors, json } from '../_utils';
import crypto from 'node:crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const nonce = crypto.randomBytes(16).toString('hex');
  // OPTIONAL: store nonce in a short-lived in-memory map or external KV keyed by ip/session
  // For the skeleton we simply return it to the client; they must echo it back in the SIWE message.
  json(res, 200, { nonce });
}
