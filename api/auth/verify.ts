// /api/auth/verify.ts
import { pickOrigin, preflightCORS, corsHeadersFor } from "../../helpers/cors";
import { securityHeaders } from "../../helpers/headers";
import { verifyMessage } from "ethers";

export const config = { runtime: "edge" }; // <-- Edge Runtime

function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: Request): Promise<Response> {
  const origin = pickOrigin(req);
  if (!origin) return new Response("Forbidden", { status: 403 });

  const pre = preflightCORS(req, origin);
  if (pre) return pre;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const base = securityHeaders(origin);
  const cors = corsHeadersFor(origin);
  const headers = new Headers([...base, ...cors]);
  headers.set("Content-Type", "application/json; charset=utf-8");

  try {
    const { message, signature } = await req.json().catch(() => ({} as any));
    if (typeof message !== "string" || typeof signature !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), {
        status: 400, headers,
      });
    }

    const nonceCookie = getCookie(req, "tc_nonce");
    if (!nonceCookie) {
      return new Response(JSON.stringify({ ok: false, error: "Missing nonce" }), {
        status: 400, headers,
      });
    }

    const recovered = verifyMessage(message, signature);

    // Adresse & Nonce aus der Nachricht ziehen (entspricht deinem AuthWidget-Format)
    const lines = message.split("\n");
    const msgAddress = (lines[1] || "").trim();
    const nonceLine = lines.find((l) => l.startsWith("Nonce: "));
    const msgNonce = nonceLine ? nonceLine.slice("Nonce: ".length).trim() : "";

    const addressOk =
      recovered && msgAddress && recovered.toLowerCase() === msgAddress.toLowerCase();

    if (!addressOk) {
      return new Response(
        JSON.stringify({ ok: false, error: "Signature mismatch", recovered }),
        { status: 401, headers }
      );
    }
    if (!msgNonce || msgNonce !== nonceCookie) {
      return new Response(JSON.stringify({ ok: false, error: "Bad nonce" }), {
        status: 401, headers,
      });
    }

    // Nonce ungültig machen
    headers.append("Set-Cookie",
      ["tc_nonce=;", "Path=/", "HttpOnly", "Secure", "SameSite=None", "Max-Age=0"].join("; ")
    );

    // einfache „Session“
    const session = `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    headers.append("Set-Cookie",
      [`tc_session=${encodeURIComponent(session)}`, "Path=/", "HttpOnly", "Secure", "SameSite=None", "Max-Age=86400"].join("; ")
    );

    return new Response(JSON.stringify({ ok: true, address: recovered }), {
      status: 200, headers,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "Verify error" }),
      { status: 500, headers }
    );
  }
}
