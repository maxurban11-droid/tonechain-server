// helpers/cookies.ts
type CookieOpts = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  path?: string;
  maxAge?: number; // seconds
  domain?: string;
};

export function serializeCookie(name: string, value: string, opts: CookieOpts = {}) {
  const enc = encodeURIComponent;
  const parts = [`${name}=${enc(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  parts.push(`Path=${opts.path || "/"}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.secure) parts.push("Secure");
  if (opts.httpOnly) parts.push("HttpOnly");
  return parts.join("; ");
}

export function deleteCookie(name: string, domain?: string) {
  return serializeCookie(name, "", {
    maxAge: 0,
    path: "/",
    domain,
    sameSite: "Lax",
    secure: true,
    httpOnly: true,
  });
}
