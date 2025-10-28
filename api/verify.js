// /api/verify.js
// Defensive SIWE-Verify (vereinfacht): verifiziert die Signatur einer Nachricht.
// Erwartet JSON-Body: { message: string, signature: string, expectedAddress: string }

const { verifyMessage } = require("ethers");

// kleine Helfer, um den JSON-Body zuverlässig einzulesen
async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (e) => reject(e));
  });
}

module.exports = async (req, res) => {
  // CORS – erstmal permissiv (für Tests); später Domain whitelisten
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readJson(req); // <— WICHTIG: Body selbst lesen
    const { message, signature, expectedAddress } = body || {};

    if (
      typeof message !== "string" ||
      typeof signature !== "string" ||
      typeof expectedAddress !== "string" ||
      !message ||
      !signature ||
      !expectedAddress
    ) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // ECDSA-Recover → Adresse aus Signatur gewinnen
    const recovered = verifyMessage(message, signature);

    const match =
      recovered &&
      recovered.toLowerCase() === expectedAddress.toLowerCase();

    if (!match) {
      return res.status(401).json({ ok: false, error: "Signature mismatch", recovered });
    }

    // Optional: hier könntest du eine Session setzen (HTTP-only Cookie)
    // Für jetzt nur Bestätigung zurückgeben:
    return res.status(200).json({
      ok: true,
      verified: true,
      address: recovered,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ ok: false, error: "Server verify error" });
  }
};
