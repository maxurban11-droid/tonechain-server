// /api/verify.js — CommonJS, Vercel/Node serverless compatible
// Expects JSON: { message: string, signature: string }
const { verifyMessage } = require("ethers");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // stateless variant
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Minimal streaming JSON body reader (no framework)
async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (e) => reject(e));
  });
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readJson(req);
    const { message, signature } = body || {};

    if (typeof message !== "string" || typeof signature !== "string" || !message || !signature) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Recover signer address from signature
    const recovered = verifyMessage(message, signature);
    if (!recovered) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    // Stateless OK (kein Nonce-/Session-Check hier)
    return res.status(200).json({
      ok: true,
      address: recovered,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ ok: false, error: "Server verify error" });
  }
};
