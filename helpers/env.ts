// helpers/env.ts
export const IS_PROD = process.env.NODE_ENV === "production";

// Kommagetrennte Liste erlaubter Origins, z. B. "https://tonechain.app,https://preview.tonechain.app"
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Optional: explizite Cookie-Domain (ansonsten weglassen)
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// Session-Lifetime (in Sekunden)
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 Tage
export const NONCE_MAX_AGE = 60 * 10;            // 10 Minuten
