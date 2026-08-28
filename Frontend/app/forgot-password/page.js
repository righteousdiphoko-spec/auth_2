"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Alert, Button, Card, Field } from "@/components/ui";
import { request } from "@/lib/api";
export default function ForgotPasswordPage() { const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const submit = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { setMessage((await request("/auth/forgot-password", { email })).message); } catch (err) { setError(err.message); } finally { setLoading(false); } }; return <AuthLayout eyebrow="Account recovery" title="A way back in." footer={<>Remembered it? <Link className="font-bold text-coral" href="/login">Return to sign in</Link></>}><Card><form className="grid gap-5" onSubmit={submit}><h2 className="font-display text-3xl">Forgot password?</h2><p className="text-sm leading-6 text-ink/60">Enter your email and we’ll send a reset link if an account exists.</p>{error && <Alert>{error}</Alert>}{message && <Alert tone="success">{message}</Alert>}<Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /><Button loading={loading}>Send reset link</Button></form></Card></AuthLayout>; }
