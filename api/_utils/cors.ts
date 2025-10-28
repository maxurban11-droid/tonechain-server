// api/_utils/cors.ts
export function buildCorsHeaders(origin: string | null) {
  // Erlaubte Origins – erweitere bei Bedarf (weitere Framer-Previews, eigene Domains)
  const allowed = [
    'https://concave-device-193297.framer.app',
    'https://*.framer.app', // grob – wird unten nicht als Wildcard gesetzt, nur für Test/Matching
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  let allowOrigin = '';
  if (origin) {
    try {
      const o = new URL(origin);
      // einfache Allow-Logik:
      if (
        o.hostname.endsWith('.framer.app') ||
        o.origin === 'http://localhost:3000' ||
        o.origin === 'http://127.0.0.1:3000'
      ) {
        allowOrigin = origin;
      }
    } catch {}
  }

  // Fallback (kein credentials-Case): nichts erlauben, damit Browser nicht irrtümlich Cookies schickt
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function corsResponse(req: Request, status = 204) {
  const headers = buildCorsHeaders(req.headers.get('origin'));
  return new Response(null, { status, headers });
}

export function withCorsJson(req: Request, data: unknown, init?: ResponseInit) {
  const headers = buildCorsHeaders(req.headers.get('origin'));
  headers['Content-Type'] = 'application/json; charset=utf-8';
  return new Response(JSON.stringify(data), { ...(init || {}), headers });
}
