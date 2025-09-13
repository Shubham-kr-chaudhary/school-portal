
import { getUserFromReq } from "../../../lib/getUser.js";

export default function handler(req, res) {
  try {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(200).json({ authenticated: false });
    }
    
    return res.status(200).json({ authenticated: true, user: { email: user.email, userId: user.userId } });
  } catch (err) {
    console.error("api/auth/me error:", err);
    return res.status(500).json({ authenticated: false });
  }
}
