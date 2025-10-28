// /api/nonce.js
const crypto = require("crypto");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Zufälliger Nonce (32 Zeichen)
  const nonce = crypto.randomBytes(16).toString("hex");

  res.status(200).json({
    ok: true,
    nonce,
    issuedAt: new Date().toISOString()
  });
};
