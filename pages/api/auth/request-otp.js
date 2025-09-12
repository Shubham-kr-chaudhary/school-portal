import { genOtp, hashOtp } from "../../../lib/auth.js";
import { sendOtpEmail } from "../../../lib/email.js";
import { getPool } from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  const normalized = String(email).trim().toLowerCase();
  const otp = genOtp();
  const otpHash = hashOtp(otp);
  const ttl = Number(process.env.OTP_TTL_MIN || 10);
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
  try {
    const pool = getPool();
    await pool.query(`INSERT INTO users (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email`, [normalized]);
    await pool.query(`INSERT INTO otps (email, otp_hash, expires_at) VALUES (?, ?, ?)`, [normalized, otpHash, expiresAt]);
    if (process.env.DEV_LOG_OTP === "true") console.log(`[DEV OTP] ${normalized} => ${otp}`);
    try { await sendOtpEmail(normalized, otp); } catch (e) { console.error("Email send error:", e); }
    return res.json({ success: true, message: "If the email is valid an OTP was sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
