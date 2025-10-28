// lib/siwe.ts
import { recoverMessageAddress } from "viem";

export type VerifyResult =
  | { ok: true; address: string }
  | { ok: false; error: string };

export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedAddress: string,
  expectedNonce: string
): Promise<VerifyResult> {
  try {
    // 1) Adresse aus Signatur recovern
    const recovered = await recoverMessageAddress({ message, signature });

    if (recovered.toLowerCase() !== expectedAddress.toLowerCase()) {
      return { ok: false, error: "Address mismatch" };
    }

    // 2) Nonce im Message-Text finden
    const nonceMatch =
      message.match(/Nonce:\s*([a-zA-Z0-9-_.:+/]+)/) ||
      message.match(/nonce[:=]\s*([a-zA-Z0-9-_.:+/]+)/i);

    if (!nonceMatch?.[1]) {
      return { ok: false, error: "Nonce not present in message" };
    }
    const nonceInMsg = nonceMatch[1];

    if (nonceInMsg !== expectedNonce) {
      return { ok: false, error: "Nonce mismatch" };
    }

    return { ok: true, address: recovered };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Verify failed" };
  }
}
