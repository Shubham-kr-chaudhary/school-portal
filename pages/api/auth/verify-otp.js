import { getPool } from '../../../lib/db.js';
import { hashOtp, signSession, setSessionCookie } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'email and otp required' });

  const normalized = String(email).trim().toLowerCase();
  const pool = getPool();

  try {
    const otpHash = hashOtp(String(otp));

    
    const [rows] = await pool.query(
      'SELECT id FROM otps WHERE email = ? AND otp_hash = ? AND used = FALSE AND expires_at >= NOW() ORDER BY id DESC LIMIT 1',
      [normalized, otpHash]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpRow = rows[0];

   
    await pool.query('UPDATE otps SET used = TRUE WHERE id = ?', [otpRow.id]);

    const [urows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalized]);
    let userId;
    if (!urows || urows.length === 0) {
      const [ins] = await pool.query('INSERT INTO users (email) VALUES (?)', [normalized]);
      userId = ins.insertId;
    } else {
      userId = urows[0].id;
    }

    
    const token = signSession({ userId, email: normalized });
    setSessionCookie(res, token);

    return res.status(200).json({ success: true, user: { id: userId, email: normalized } });
  } catch (err) {
    console.error('verify-otp handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
