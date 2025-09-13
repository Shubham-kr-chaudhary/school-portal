import { getPool } from '../../../lib/db.js';
import { genOtp, hashOtp } from '../../../lib/auth.js';
import { sendOtpEmail } from '../../../lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email required' });
  }

  const normalized = String(email).trim().toLowerCase();
  const pool = getPool();

  try {
   
    const [recent] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM otps WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
      [normalized]
    );
    const recentCount = recent[0]?.cnt || 0;
    if (recentCount >= 3) {
      return res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
    }

    const otp = genOtp();
    const otpHash = hashOtp(otp);
    const ttl = Number(process.env.OTP_TTL_MIN || 10);


    await pool.query(
      'INSERT INTO users (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email',
      [normalized]
    );

    await pool.query(
      'INSERT INTO otps (email, otp_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
      [normalized, otpHash, ttl]
    );

    if (process.env.DEV_LOG_OTP === 'true') {
      console.log(`[DEV OTP] ${normalized} => ${otp}`);
    }

   
    try {
      await sendOtpEmail({ to: normalized, otp });
    } catch (sendErr) {
      console.error('sendOtpEmail error:', sendErr);
     
    }

    return res.status(200).json({
      success: true,
      message: 'If the email is valid, an OTP was sent (check email or dev log).',
    });
  } catch (err) {
    console.error('request-otp handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
