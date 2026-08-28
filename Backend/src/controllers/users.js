import { authService } from "../services/auth.js";
import { clearAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/errors.js";
export const me = asyncHandler(async (req, res) => res.json({ success: true, user: authService.publicUser(req.user) }));
export const updateMe = asyncHandler(async (req, res) => res.json({ success: true, user: await authService.updateProfile(req.user, req.validated) }));
export const deleteMe = asyncHandler(async (req, res) => { await authService.deleteAccount(req.user, req.validated.password); clearAuthCookies(res); res.json({ success: true, message: "Account deleted" }); });
