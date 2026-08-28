"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Alert, Card } from "@/components/ui";
import { request } from "@/lib/api";
export default function VerifyEmailPage() { const [state, setState] = useState({ loading: true, message: "" }); useEffect(() => { const token = new URLSearchParams(window.location.search).get("token"); if (!token) return setState({ loading: false, message: "This verification link is missing its token." }); request("/auth/verify-email", { token }).then((data) => setState({ loading: false, message: data.message })).catch((err) => setState({ loading: false, message: err.message })); }, []); return <AuthLayout eyebrow="Email verification" title="One small step." footer={<Link className="font-bold text-coral" href="/login">Go to sign in</Link>}><Card>{state.loading ? <p>Verifying your email...</p> : <Alert tone={state.message === "Email verified" ? "success" : "error"}>{state.message}</Alert>}</Card></AuthLayout>; }
