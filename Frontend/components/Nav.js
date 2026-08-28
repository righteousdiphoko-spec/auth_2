"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";
export default function Nav({ user }) { const router = useRouter(); const logout = async () => { await request("/auth/logout", {}); router.push("/login"); router.refresh(); }; return <nav className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 sm:px-10"><Link href="/dashboard" className="font-bold tracking-[0.18em]">AUTH2</Link><div className="flex items-center gap-4 text-sm"><Link className="hidden hover:text-coral sm:block" href="/profile">{user.name}</Link><button className="font-semibold text-coral hover:text-ink" onClick={logout}>Sign out</button></div></nav>; }
