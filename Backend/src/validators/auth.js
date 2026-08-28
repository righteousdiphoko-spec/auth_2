import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters").max(128).refine((value) => !/^password|12345678|qwerty/i.test(value), "Choose a less common password");
const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email, password, confirmPassword: z.string(), consent: z.literal(true) }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const loginSchema = z.object({ email, password: z.string().min(1).max(128), rememberMe: z.boolean().default(false) });
export const emailSchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().min(32).max(256) });
export const resetSchema = z.object({ token: z.string().min(32).max(256), password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100) });
export const deleteAccountSchema = z.object({ password: z.string().min(1), confirmation: z.literal("DELETE") });
