// api/verify.ts
import { corsResponse, withCorsJson } from './_utils/cors';
// Wenn du viem/ethers verwendest, hier importieren. Beispiel mit viem verifyMessage:
import { verifyMessage, recoverMessageAddress } from 'viem';

export const config = { runtime: 'nodejs20.x' };

type VerifyBody = {
  message: string;
  signature: string;
  address: string;
  chainId?: number;
  // nonce?: string; // wenn du Nonce nicht per Cookie sendest, kannst du es im Body prüfen
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsResponse(req);
  if (req.method !== 'POST') {
    return withCorsJson(req, { ok: false, error: 'Method Not Allowed' }, { status: 405 });
  }

  let body: VerifyBody | null = null;
  try {
    body = await req.json();
  } catch {
    return withCorsJson(req, { ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { message, signature, address } = body || {};
  if (!message || !signature || !address) {
    return withCorsJson(req, { ok: false, error: 'Missing fields' }, { status: 400 });
    }

  try {
    const recovered = await recoverMessageAddress({ message, signature });
    const match = recovered.toLowerCase() === address.toLowerCase();
    if (!match) {
      return withCorsJson(req, { ok: false, error: 'Signature mismatch' }, { status: 401 });
    }

    // Optional: Nonce aus Cookie oder Body prüfen (Ablauf <= 5 min)
    // const cookies = req.headers.get('cookie') || '';
    // ...

    // Session-Cookie setzen (httpOnly)
    // const headers = buildCorsHeaders(req.headers.get('origin'));
    // headers['Set-Cookie'] = `tc_session=...; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly; Secure`;
    // return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

    return withCorsJson(req, { ok: true });
  } catch (e: any) {
    return withCorsJson(req, { ok: false, error: e?.message || 'Verify failed' }, { status: 400 });
  }
}
