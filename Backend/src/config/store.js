import crypto from "node:crypto";
import argon2 from "argon2";
import prisma from "./prisma.js";

export const users = new Map();
export const usersByEmail = new Map();
export const refreshSessions = new Map();
export const verificationTokens = new Map();
export const passwordResetTokens = new Map();
export const createId = () => crypto.randomUUID();

export const seedDemoUser = async () => {
  const email = "demo@auth2.local";
  const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);

  if (existing) {
    users.set(existing.id, existing);
    usersByEmail.set(existing.email, existing.id);
    return;
  }

  const password = "Password123!";
  const user = await prisma.user.create({
    data: {
      id: createId(),
      name: "Demo User",
      email,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      emailVerified: true,
      status: "ACTIVE",
      createdAt: new Date(),
    },
  });

  users.set(user.id, user);
  usersByEmail.set(user.email, user.id);

  console.log(`Demo account ready: ${email} / ${password}`);
};
