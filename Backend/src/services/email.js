import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transport = env.EMAIL_PROVIDER === "smtp" ? nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }) : null;
const send = async (to, subject, html) => { if (!transport) return console.log(`[email:console] ${subject} -> ${to}\n${html}`); await transport.sendMail({ from: env.EMAIL_FROM, to, subject, html }); };
const layout = (title, body, link) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:40px auto;color:#17232d"><h1>${title}</h1><p>${body}</p><p><a href="${link}" style="background:#e76f51;color:#fff;padding:12px 18px;text-decoration:none">Continue</a></p><p style="color:#667">This link expires soon. If you did not request this, you can ignore this email.</p></div>`;
export const emailService = { sendVerification: (user, token) => send(user.email, "Verify your Auth2 email", layout("Verify your email", `Hi ${user.name}, confirm your email to activate your account.`, `${env.FRONTEND_URL}/verify-email?token=${token}`)), sendReset: (user, token) => send(user.email, "Reset your Auth2 password", layout("Reset your password", "We received a password reset request.", `${env.FRONTEND_URL}/reset-password?token=${token}`)) };
