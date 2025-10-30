// helpers/crypto.ts
import crypto from "crypto";

export function randomNonce(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function randomSessionId(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
