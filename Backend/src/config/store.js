import crypto from "node:crypto";

export const users = new Map();
export const usersByEmail = new Map();
export const refreshSessions = new Map();
export const verificationTokens = new Map();
export const passwordResetTokens = new Map();
export const createId = () => crypto.randomUUID();
