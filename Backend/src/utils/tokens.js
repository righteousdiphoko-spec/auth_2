import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createOpaqueToken = () => crypto.randomBytes(32).toString("hex");
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
export const signAccessToken = (user) => jwt.sign({ sub: user.id, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
export const signRefreshToken = (userId, sessionId, expiresIn) => jwt.sign({ sub: userId, sid: sessionId, type: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn });
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
export const durationMs = (value) => {
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) throw new Error("Invalid duration configuration");
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * units[match[2]];
};
