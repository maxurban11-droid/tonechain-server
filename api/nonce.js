// /api/nonce.js  — CommonJS, Vercel/Node serverless compatible
const crypto = require("crypto");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // stateless variant
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // simple random nonce (32 hex characters)
  const nonce = crypto.randomBytes(16).toString("hex");
  return res.status(200).json({ ok: true, nonce, issuedAt: new Date().toISOString() });
};
