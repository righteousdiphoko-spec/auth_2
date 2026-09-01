import argon2 from "argon2";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { createId, passwordResetTokens, refreshSessions, users, usersByEmail, verificationTokens } from "../config/store.js";
import { AppError } from "../utils/errors.js";
import { createOpaqueToken, durationMs, hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { emailService } from "./email.js";

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, createdAt: user.createdAt });
const activeSessionsFor = (userId) => [...refreshSessions.values()].filter((session) => session.userId === userId && !session.revokedAt);
const revokeSessions = (userId) => activeSessionsFor(userId).forEach((session) => { session.revokedAt = new Date(); });
const issueSession = (user, rememberMe) => { const raw = createOpaqueToken(); const expiresAt = new Date(Date.now() + durationMs(rememberMe ? env.REMEMBER_ME_EXPIRES_IN : env.REFRESH_TOKEN_EXPIRES_IN)); const session = { id: createId(), userId: user.id, tokenHash: hashToken(raw), expiresAt, revokedAt: null }; refreshSessions.set(session.id, session); return { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user.id, session.id, rememberMe ? env.REMEMBER_ME_EXPIRES_IN : env.REFRESH_TOKEN_EXPIRES_IN), maxAge: expiresAt.getTime() - Date.now() }; };
const createVerification = async (user) => { for (const [key, token] of verificationTokens) if (token.userId === user.id && !token.usedAt) verificationTokens.delete(key); const raw = createOpaqueToken(); verificationTokens.set(hashToken(raw), { id: createId(), userId: user.id, expiresAt: new Date(Date.now() + 24 * 3600000), usedAt: null }); await emailService.sendVerification(user, raw); };

export const authService = {
  publicUser,
  async register(data) {
    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (existing) return null;

    const user = await prisma.user.create({
      data: {
        id: createId(),
        name: data.name,
        email,
        passwordHash: await argon2.hash(data.password, { type: argon2.argon2id }),
        emailVerified: false,
        status: "ACTIVE",
      },
    });

    users.set(user.id, user);
    usersByEmail.set(user.email, user.id);
    await createVerification(user);
    return publicUser(user);
  },
  async login(data) {
    const email = data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } }).catch(() => null) ?? users.get(usersByEmail.get(email));
    if (!user || !(await argon2.verify(user.passwordHash, data.password)) || user.status !== "ACTIVE") throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    users.set(user.id, user);
    usersByEmail.set(user.email, user.id);
    return { user: publicUser(user), session: issueSession(user, data.rememberMe) };
  },
  async refresh(rawToken) { if (!rawToken) throw new AppError(401, "Authentication required", "AUTH_REQUIRED"); let payload; try { payload = verifyRefreshToken(rawToken); } catch { throw new AppError(401, "Authentication required", "AUTH_REQUIRED"); } const old = refreshSessions.get(payload.sid); const user = users.get(payload.sub) ?? await prisma.user.findUnique({ where: { id: payload.sub } }).catch(() => null); if (!old || !user || old.tokenHash !== hashToken(rawToken)) throw new AppError(401, "Authentication required", "AUTH_REQUIRED"); if (old.revokedAt || old.expiresAt < new Date()) { revokeSessions(old.userId); throw new AppError(401, "Session expired", "SESSION_REVOKED"); } old.revokedAt = new Date(); const remaining = old.expiresAt.getTime() - Date.now(); const nextRaw = createOpaqueToken(); const next = { id: createId(), userId: old.userId, tokenHash: hashToken(nextRaw), expiresAt: old.expiresAt, revokedAt: null }; refreshSessions.set(next.id, next); return { user: publicUser(user), session: { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user.id, next.id, Math.max(60, Math.floor(remaining / 1000)) + "s"), maxAge: remaining } }; },
  async logout(rawToken) { if (rawToken) for (const session of refreshSessions.values()) if (session.tokenHash === hashToken(rawToken)) session.revokedAt = new Date(); },
  async verifyEmail(raw) { const record = verificationTokens.get(hashToken(raw)); if (!record || record.usedAt || record.expiresAt < new Date()) throw new AppError(400, "Verification link is invalid or expired", "INVALID_TOKEN"); const user = users.get(record.userId) ?? await prisma.user.findUnique({ where: { id: record.userId } }).catch(() => null); record.usedAt = new Date(); if (user) { user.emailVerified = true; await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }); } },
  async resendVerification(email) { const user = users.get(usersByEmail.get(email.toLowerCase())) ?? await prisma.user.findUnique({ where: { email: email.toLowerCase() } }).catch(() => null); if (user && !user.emailVerified) await createVerification(user); },
  async forgotPassword(email) { const normalized = email.toLowerCase(); const user = users.get(usersByEmail.get(normalized)) ?? await prisma.user.findUnique({ where: { email: normalized } }).catch(() => null); if (!user) return; for (const [key, token] of passwordResetTokens) if (token.userId === user.id && !token.usedAt) passwordResetTokens.delete(key); const raw = createOpaqueToken(); passwordResetTokens.set(hashToken(raw), { id: createId(), userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000), usedAt: null }); await emailService.sendReset(user, raw); },
  async resetPassword(data) { const record = passwordResetTokens.get(hashToken(data.token)); if (!record || record.usedAt || record.expiresAt < new Date()) throw new AppError(400, "Reset link is invalid or expired", "INVALID_TOKEN"); const user = users.get(record.userId) ?? await prisma.user.findUnique({ where: { id: record.userId } }).catch(() => null); if (!user) throw new AppError(400, "Reset link is invalid or expired", "INVALID_TOKEN"); user.passwordHash = await argon2.hash(data.password, { type: argon2.argon2id }); record.usedAt = new Date(); await prisma.user.update({ where: { id: user.id }, data: { passwordHash: user.passwordHash } }); revokeSessions(user.id); },
  async changePassword(user, data) { if (!(await argon2.verify(user.passwordHash, data.currentPassword))) throw new AppError(400, "Current password is incorrect", "INVALID_PASSWORD"); user.passwordHash = await argon2.hash(data.password, { type: argon2.argon2id }); await prisma.user.update({ where: { id: user.id }, data: { passwordHash: user.passwordHash } }); revokeSessions(user.id); },
  async updateProfile(user, data) { const updated = await prisma.user.update({ where: { id: user.id }, data: { name: data.name } }); users.set(updated.id, updated); return publicUser(updated); },
  async deleteAccount(user, password) { if (!(await argon2.verify(user.passwordHash, password))) throw new AppError(400, "Password is incorrect", "INVALID_PASSWORD"); revokeSessions(user.id); users.delete(user.id); usersByEmail.delete(user.email); await prisma.user.delete({ where: { id: user.id } }); }
};
