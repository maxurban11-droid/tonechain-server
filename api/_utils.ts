import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { serialize } from 'cookie';

export function allowCors(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function json(res: VercelResponse, status: number, data: any) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const cookie = serialize('tc_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true, // always true on vercel https
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res: VercelResponse) {
  const cookie = serialize('tc_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0
  });
  res.setHeader('Set-Cookie', cookie);
}

export function hmacSign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function hmacVerify(payload: string, signature: string, secret: string) {
  const expected = hmacSign(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
