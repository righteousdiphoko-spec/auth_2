import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("1d"),
  REMEMBER_ME_EXPIRES_IN: z.string().default("30d"),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Auth2 <no-reply@example.com>"),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional()
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
