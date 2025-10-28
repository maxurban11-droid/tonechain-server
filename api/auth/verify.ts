import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowCors, json, setSessionCookie } from '../_utils';
import { SiweMessage } from 'siwe';

const DOMAIN = process.env.SIWE_DOMAIN || 'tonechain.app';
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'; // your Framer origin on preview/publish

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const { message, signature } = req.body || {};
    if (!message || !signature) return json(res, 400, { error: 'Missing body' });

    const siwe = new SiweMessage(message);

    // Optional: validate domain & origin to prevent phishing
    if (siwe.domain !== DOMAIN) return json(res, 400, { error: 'Invalid domain' });
    if (siwe.uri !== ORIGIN) return json(res, 400, { error: 'Invalid origin' });

    const result = await siwe.verify({ signature });
    if (!result.success) return json(res, 401, { error: 'Invalid signature' });

    // Create a simple signed token (skeleton): DO NOT use in production as-is.
    // For production, issue a JWT with a secret or store a session in a DB.
    const token = Buffer.from(
      JSON.stringify({ sub: siwe.address, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
    ).toString('base64url');

    setSessionCookie(res, token);
    json(res, 200, { ok: true, address: siwe.address });
  } catch (e: any) {
    json(res, 500, { error: e?.message || 'verify failed' });
  }
}
