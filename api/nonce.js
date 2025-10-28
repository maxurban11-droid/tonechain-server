// api/nonce.ts
import { corsResponse, withCorsJson } from './_utils/cors';

export const config = { runtime: 'nodejs20.x' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsResponse(req);

  if (req.method !== 'GET') {
    return withCorsJson(req, { ok: false, error: 'Method Not Allowed' }, { status: 405 });
  }

  // stabiler, kryptographisch starker Nonce
  const nonce = crypto.randomUUID();

  // Falls du Nonce im Cookie brauchst, hier setzen (optional):
  // const headers = buildCorsHeaders(req.headers.get('origin'));
  // headers['Set-Cookie'] = `tc_nonce=${nonce}; Path=/; Max-Age=300; SameSite=Lax; HttpOnly; Secure`;

  return withCorsJson(req, { ok: true, nonce });
}
