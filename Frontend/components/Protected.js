"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Nav from "./Nav";
export default function Protected({ children }) { const router = useRouter(); const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => { api("/users/me").then((data) => setUser(data.user)).catch(() => router.replace("/login")).finally(() => setLoading(false)); }, [router]); if (loading) return <main className="grid min-h-screen place-items-center bg-mist text-sm">Checking your session...</main>; if (!user) return null; return <><Nav user={user} /><main className="mx-auto max-w-5xl px-5 py-10 sm:px-10">{children(user)}</main></>; }
