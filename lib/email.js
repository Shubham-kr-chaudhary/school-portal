import nodemailer from "nodemailer";

const provider = process.env.EMAIL_PROVIDER || "smtp";

export async function sendOtpEmail(toEmail, otp) {
  if (provider === "smtp") {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP not configured.");
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const ttl = process.env.OTP_TTL_MIN || 10;
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Your one-time login code",
      text: `Your one-time code is: ${otp}. It expires in ${ttl} minutes.`,
      html: `<p>Your one-time code is: <strong>${otp}</strong></p><p>It expires in ${ttl} minutes.</p>`,
    });
    return;
  }
  throw new Error("No email provider configured");
}