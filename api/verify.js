// /api/verify.js — Defensive SIWE Verify (Node runtime), kompatibel zu deiner bisherigen API

// Kein Top-Level-Import von "ethers": v6 ist ESM-only → dynamisch und nur bei Bedarf laden.
let _verifyMessage;
async function getVerifyMessage() {
  if (_verifyMessage) return _verifyMessage;
  const mod = await import("ethers");
  _verifyMessage = mod.verifyMessage || (mod.ethers && mod.ethers.verifyMessage);
  if (typeof _verifyMessage !== "function") {
    throw new Error("verifyMessage not available from ethers");
  }
  return _verifyMessage;
}

// Robust: kleinen JSON-Body einlesen, mit Größenlimit
async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    const MAX = 10 * 1024; // 10KB
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > MAX) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (e) => reject(e));
  });
}

module.exports = async (req, res) => {
  // CORS (kompatibel, aber vollständig)
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readJson(req);
    const { message, signature, expectedAddress } = body || {};

    if (
      typeof message !== "string" ||
      typeof signature !== "string" ||
      typeof expectedAddress !== "string" ||
      !message || !signature || !expectedAddress
    ) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const verifyMessage = await getVerifyMessage();
    const recovered = verifyMessage(message, signature);

    const match =
      recovered &&
      recovered.toLowerCase() === expectedAddress.toLowerCase();

    if (!match) {
      return res.status(401).json({ ok: false, error: "Signature mismatch", recovered });
    }

    return res.status(200).json({
      ok: true,
      verified: true,
      address: recovered,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    const msg = String(err && err.message || "");
    if (msg.toLowerCase().includes("payload too large")) {
      return res.status(413).json({ ok: false, error: "Payload too large" });
    }
    if (msg.toLowerCase().includes("invalid json")) {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
    console.error("Verify error:", err);
    return res.status(500).json({ ok: false, error: "Server verify error" });
  }
};
