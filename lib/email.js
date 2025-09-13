import nodemailer from "nodemailer";

function getSmtpOptionsFromEnv() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true" || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
    },
  };
}

export async function createTransporter() {

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const smtpOpts = getSmtpOptionsFromEnv();
    const transporter = nodemailer.createTransport(smtpOpts);

    try {
    
      await transporter.verify();
      console.log("SMTP verified, using real SMTP transport.");
      return transporter;
    } catch (err) {
      console.warn("SMTP verify failed — falling back to Ethereal dev transport.", err.message || err);
      
    }
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  console.log("Using Ethereal test account for email (dev).");
  return transporter;
}

export async function sendOtpEmail({ to, otp }) {
  const transporter = await createTransporter();

  const ttl = process.env.OTP_TTL_MIN || 10;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `No Reply <no-reply@localhost>`,
    to,
    subject: "Your OTP Code",
    text: `Your login code is ${otp}. It expires in ${ttl} minutes.`,
    html: `<p>Your login code is <b>${otp}</b>. It expires in ${ttl} minutes.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  if (process.env.DEV_LOG_OTP === "true") {
    console.log(`[DEV OTP] ${to} => ${otp}`);
    if (previewUrl) console.log(`[DEV OTP Preview] ${previewUrl}`);
  }

  return { info, previewUrl };
}
