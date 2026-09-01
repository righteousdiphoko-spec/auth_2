import "dotenv/config";
import { z } from "zod";

const frontendUrl = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const backendUrl = process.env.BACKEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5000");
const accessSecret = process.env.JWT_ACCESS_SECRET || "development-access-secret-key-1234567890";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "development-refresh-secret-key-1234567890";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  JWT_ACCESS_SECRET: z.string().min(32).default(accessSecret),
  JWT_REFRESH_SECRET: z.string().min(32).default(refreshSecret),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("1d"),
  REMEMBER_ME_EXPIRES_IN: z.string().default("30d"),
  FRONTEND_URL: z.string().url().default(frontendUrl),
  BACKEND_URL: z.string().url().default(backendUrl),
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Auth2 <no-reply@example.com>"),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional()
});

const parsed = schema.safeParse({ ...process.env, JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || accessSecret, JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || refreshSecret, FRONTEND_URL: frontendUrl, BACKEND_URL: backendUrl });
if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
