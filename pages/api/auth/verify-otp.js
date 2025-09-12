import { hashOtp, signSession, setSessionCookie } from "../../../lib/auth.js";
import { getPool } from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });
  const normalized = String(email).trim().toLowerCase();
  const otpHash = hashOtp(String(otp));
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id FROM otps WHERE email = ? AND otp_hash = ? AND used = FALSE AND expires_at >= NOW() ORDER BY id DESC LIMIT 1`,
      [normalized, otpHash]
    );
    if (!rows.length) return res.status(400).json({ error: "Invalid or expired code" });
    const otpRow = rows[0];
    await pool.query(`UPDATE otps SET used = TRUE WHERE id = ?`, [otpRow.id]);
    const [urows] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [normalized]);
    const userId = urows.length ? urows[0].id : null;
    const token = signSession({ userId, email: normalized });
    setSessionCookie(res, token);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
