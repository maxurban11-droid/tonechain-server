// lib/cookie.ts
export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  path = "/"
): string {
  const parts = [
    `${name}=${value}`,
    `Path=${path}`,
    `HttpOnly`,
    `SameSite=None`,
    `Secure`,
    `Max-Age=${maxAgeSeconds}`
  ];
  return parts.join("; ");
}

export function clearCookie(name: string, path = "/") {
  return `${name}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=None; Secure`;
}

export function readCookie(req: Request, key: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const items = raw.split(";").map(s => s.trim());
  for (const it of items) {
    const idx = it.indexOf("=");
    if (idx > -1) {
      const k = it.substring(0, idx);
      if (k === key) return it.substring(idx + 1);
    }
  }
  return null;
}
