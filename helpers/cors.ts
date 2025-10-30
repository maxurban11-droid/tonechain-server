// helpers/cors.ts
import { ALLOWED_ORIGINS } from "./env";

export function corsHeaders(originHeader?: string) {
  const origin = originHeader || "";
  const allowAll = ALLOWED_ORIGINS.length === 0;
  const allowed =
    allowAll || ALLOWED_ORIGINS.some(o => o.toLowerCase() === origin.toLowerCase());

  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
  if (allowed) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function preflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  const headers = corsHeaders(req.headers.get("Origin") || undefined);
  return new Response(null, { status: 204, headers });
}
