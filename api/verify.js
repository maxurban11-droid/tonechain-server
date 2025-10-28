// /api/verify.js
const { verifyMessage } = require("ethers");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { message, signature, expectedAddress } = req.body || {};
    if (!message || !signature || !expectedAddress)
      return res.status(400).json({ ok: false, error: "Missing fields" });

    const recovered = verifyMessage(message, signature);

    if (recovered.toLowerCase() !== expectedAddress.toLowerCase()) {
      return res.status(401).json({ ok: false, error: "Signature mismatch" });
    }

    return res.status(200).json({
      ok: true,
      verified: true,
      address: recovered
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ ok: false, error: "Server verify error" });
  }
};
