import { users } from "../config/store.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { AppError } from "../utils/errors.js";

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies.access_token;
    if (!token) throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") throw new Error("Invalid token type");
    const user = users.get(payload.sub);
    if (!user || user.status !== "ACTIVE") throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
    req.user = user;
    next();
  } catch { next(new AppError(401, "Authentication required", "AUTH_REQUIRED")); }
}
export const requireVerifiedEmail = (req, res, next) => req.user.emailVerified ? next() : next(new AppError(403, "Please verify your email first", "EMAIL_NOT_VERIFIED"));
