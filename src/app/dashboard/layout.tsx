"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    LogOut,
    User,
    PlusSquare,
    ChevronRight,
    Zap,
    Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import CreateTaskModal from "@/components/CreateTaskModal";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pathname, setPathname] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const { isInstallable, installPWA } = usePWAInstall();

    // Redirect unauthenticated users — must be in useEffect, not render body
    useEffect(() => {
        if (status !== "loading" && !session) {
            router.push("/login");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetch("/api/employees")
                .then((res) => res.json())
                .then((data) => setEmployees(data))
                .catch((err) => console.error("Error fetching employees:", err));
        }
    }, [session]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('addTask') === 'true') {
            setIsModalOpen(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [pathname]);

    if (status === "loading") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-base)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-10 w-10">
                        <div className="absolute inset-0 rounded-full border-2 border-neon-blue/20" />
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00F5FF]" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-blue/50">Loading</span>
                </div>
            </div>
        );
    }

    // The redirection for unauthenticated users is handled by the useEffect above.
    // If session is null here, it means the useEffect has already triggered a redirect,
    // so we can safely return null to prevent rendering the rest of the layout.
    if (!session) {
        return null;
    }

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ...(session?.user?.role === "ADMIN"
            ? [{ name: "Employees", href: "/dashboard/employees", icon: Users }]
            : []),
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)]">

            {/* ── Sidebar ── */}
            <aside className="w-[280px] hidden md:flex flex-col glass-strong border-r border-[var(--border-muted)]">

                {/* Logo */}
                <div className="px-6 pt-7 pb-5 border-b border-[var(--border-muted)]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-[#00F5FF]/20 blur-md" />
                            <Image
                                src="/ops-logo.png"
                                alt="OPS Logo"
                                width={48}
                                height={48}
                                className="relative w-12 h-12 object-cover rounded-xl border border-[#00F5FF]/20"
                            />
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight text-white">Agents OPS</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
                                <span className="text-[10px] text-neon-blue/60 font-medium uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workspace switcher */}
                <div className="px-4 pt-4">
                    <WorkspaceSwitcher />
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-3 mb-3">Navigation</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                            >
                                <item.icon
                                    className="w-4.5 h-4.5 flex-shrink-0"
                                    style={{ width: 18, height: 18, color: isActive ? "#00F5FF" : "rgba(0, 245, 255, 0.45)" }}
                                />
                                <span className="flex-1">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]"
                                    />
                                )}
                            </a>
                        );
                    })}

                    {/* Install App (Visible only if installable) */}
                    {isInstallable && (
                        <div className="pt-2">
                            <button
                                onClick={installPWA}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 rounded-xl hover:bg-neon-blue/20 transition-all shadow-[0_0_15px_rgba(0,245,255,0.1)]"
                            >
                                <Download className="w-4.5 h-4.5" />
                                Install Project
                            </button>
                        </div>
                    )}

                    {/* Assign Task (Admin only) */}
                    {session.user.role === "ADMIN" && (
                        <div className="pt-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-3 mb-3">Quick Actions</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary w-full text-sm font-semibold"
                            >
                                <PlusSquare className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                Assign Task
                            </button>
                        </div>
                    )}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-[var(--border-muted)]">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default mb-2">
                        <div className="h-9 w-9 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                            {session.user.image ? (
                                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                                <User className="w-5 h-5" style={{ color: "#00F5FF" }} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-100 truncate">{session.user.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Zap className="w-3 h-3" style={{ color: "#00F5FF" }} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neon-blue/60">
                                    {session.user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex w-full items-center justify-start gap-3 px-4 text-sm font-bold tracking-wide transition-all duration-200 rounded-xl"
                        style={{
                            height: 40,
                            color: "#FF4D6A",
                            border: "1px solid rgba(255, 77, 106, 0.4)",
                            background: "rgba(255, 77, 106, 0.05)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 77, 106, 0.12)";
                            e.currentTarget.style.borderColor = "rgba(255, 77, 106, 0.8)";
                            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 77, 106, 0.3)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 77, 106, 0.05)";
                            e.currentTarget.style.borderColor = "rgba(255, 77, 106, 0.4)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0px)";
                        }}
                    >
                        <LogOut className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Mobile Nav (Bottom Bar) ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] glass-strong border-t border-white/5 px-4 pt-3 pb-8">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center gap-1.5 transition-all duration-300 min-w-[64px] min-h-[48px] ${isActive ? "text-[#00F5FF]" : "text-[#00F5FF]/30"}`}
                            >
                                <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-[#00F5FF]/10 shadow-[0_0_20px_rgba(0,245,255,0.2)] ring-1 ring-[#00F5FF]/40" : "bg-white/[0.03] border border-white/5"}`}>
                                    <item.icon style={{ width: 24, height: 24, color: isActive ? "#00F5FF" : "rgba(0, 245, 255, 0.4)" }} strokeWidth={isActive ? 2.5 : 2} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-active-glow"
                                            className="absolute inset-0 bg-[#00F5FF]/20 blur-xl rounded-full"
                                        />
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold tracking-widest transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}>{item.name}</span>
                            </a>
                        );
                    })}
                    {isInstallable && (
                        <button
                            onClick={installPWA}
                            className="flex flex-col items-center justify-center gap-1.5 text-neon-blue min-w-[64px] min-h-[48px]"
                        >
                            <div className="p-2.5 rounded-2xl bg-neon-blue/15 border border-neon-blue/40 shadow-[0_0_15px_rgba(0,245,255,0.25)] animate-pulse">
                                <Download style={{ width: 24, height: 24 }} strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Install</span>
                        </button>
                    )}
                    {session.user.role === "ADMIN" && (
                        <Link
                            href="/dashboard/tasks/new"
                            className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] min-h-[48px]"
                        >
                            <div className="p-2.5 rounded-2xl bg-[#00F5FF]/10 border border-[#00F5FF]/30">
                                <PlusSquare style={{ width: 24, height: 24, color: "#00F5FF" }} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-neon-blue/60">Add</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] min-h-[48px]"
                    >
                        <div className="p-2.5 rounded-2xl bg-[#00F5FF]/5 border border-[#00F5FF]/10 hover:bg-red-500/10 transition-colors">
                            <LogOut style={{ width: 24, height: 24, color: "#00F5FF" }} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Out</span>
                    </button>
                </div>
            </div>

            {/* ── Main Wrapper ── */}
            <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden mb-[85px] md:mb-0 pt-[64px] md:pt-0 custom-scrollbar">

                {/* ── Mobile Header ── */}
                <header className="md:hidden fixed top-0 left-0 right-0 h-[64px] flex items-center justify-between px-4 glass-strong border-b border-white/5 z-[100]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-lg bg-[#00F5FF]/20 blur-sm" />
                            <Image
                                src="/ops-logo.png"
                                alt="OPS Logo"
                                width={32}
                                height={32}
                                className="relative w-8 h-8 object-cover rounded-lg border border-[#00F5FF]/20"
                            />
                        </div>
                        <span className="text-sm font-black tracking-tight text-white uppercase italic">Agents OPS</span>
                    </div>
                    <div className="flex-1 max-w-[160px] ml-4">
                        <WorkspaceSwitcher />
                    </div>
                </header>

                {/* Ambient neon glow */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00F5FF]/[0.04] blur-3xl pointer-events-none -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#00F5FF]/[0.03] blur-3xl pointer-events-none -ml-32 -mb-32" />

                <main className="flex-1 animate-fade-in relative flex flex-col overflow-y-auto md:overflow-y-visible custom-scrollbar">
                    <div className="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-10 py-4 md:py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
            />

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={async () => {
                    setIsLogoutModalOpen(false);
                    await signOut({ redirect: false });
                    router.push("/login");
                }}
            />
        </div>
    );
}
