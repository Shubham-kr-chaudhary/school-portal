import { clearSessionCookie } from "../../../lib/auth.js";
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  clearSessionCookie(res);
  res.status(200).json({ success: true });
}
