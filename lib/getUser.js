
import cookie from "cookie";
import { verifySession } from "./auth.js";

export function getUserFromReq(req) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.sp_session;
  if (!token) return null;
  return verifySession(token);
}
