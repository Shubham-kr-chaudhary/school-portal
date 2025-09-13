import crypto from "crypto";
import jwt from "jsonwebtoken";

export function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
export function signSession(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
}
export function verifySession(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}
export function setSessionCookie(res, token) {
  const maxAge = 60 * 60 * 24 * 30;
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", `sp_session=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; ${secure ? "Secure;" : ""}`);
}
export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `sp_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`);
}