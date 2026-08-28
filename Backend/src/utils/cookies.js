import { isProduction } from "../config/env.js";

const base = { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", path: "/" };
export const setAuthCookies = (res, accessToken, refreshToken, refreshMaxAge) => {
  res.cookie("access_token", accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...base, maxAge: refreshMaxAge });
};
export const clearAuthCookies = (res) => {
  res.clearCookie("access_token", base);
  res.clearCookie("refresh_token", base);
};
