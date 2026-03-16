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
    Menu,
    X as CloseIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import CompanySwitcher from "@/components/CompanySwitcher";
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
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const { isInstallable, installPWA } = usePWAInstall();

    const activeCompany = session?.user?.memberships?.find(
        (m: any) => m.companyId === session?.user?.activeCompanyId
    );

    // Redirect unauthenticated users — must be in useEffect, not render body
    useEffect(() => {
        if (status !== "loading" && !session) {
            router.push("/login");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetch("/api/employees")
                .then((res) => res.ok ? res.json() : [])
                .then((data) => setEmployees(Array.isArray(data) ? data : []))
                .catch((err) => {
                    console.error("Error fetching employees:", err);
                    setEmployees([]);
                });
        }
    }, [session]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('addTask') === 'true') {
            setIsModalOpen(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [pathname]);

    useEffect(() => {
        const companyName = activeCompany?.companyName;
        if (companyName) {
            document.title = `${companyName} | Agent OPS`;
        } else {
            document.title = "Dashboard | Agent OPS";
        }
    }, [activeCompany?.companyName]);

    // We don't return null if !session anymore, instead we handle the redirect
    // but allow the shell to render with skeletons if status is "loading"

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

                {/* Logo / Active Company Branding */}
                <div className="px-6 pt-7 pb-5 border-b border-[var(--border-muted)]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-[#00F5FF]/20 blur-md" />
                            {status === "loading" ? (
                                <div className="relative w-12 h-12 rounded-xl bg-zinc-900/50 animate-pulse border border-white/5" />
                            ) : activeCompany?.companyLogo ? (
                                <img
                                    src={activeCompany.companyLogo}
                                    alt={activeCompany?.companyName || "Logo"}
                                    key={activeCompany?.companyLogo} // Force re-render on logo change
                                    loading="eager"
                                    className="relative w-12 h-12 object-cover rounded-xl border border-[#00F5FF]/20 bg-zinc-900"
                                />
                            ) : (
                                <div className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-[#00F5FF]/20 bg-zinc-900 overflow-hidden shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                                    <img
                                        src="/ops-logo.png"
                                        alt="Agents OPS"
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            {status === "loading" ? (
                                <>
                                    <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-20 bg-white/5 rounded animate-pulse mt-2" />
                                </>
                            ) : (
                                <>
                                    <span className="text-lg font-bold tracking-tight text-white truncate">
                                        {activeCompany?.companyName || "Agents OPS"}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
                                        <span className="text-[10px] text-neon-blue/60 font-medium uppercase tracking-widest">
                                            {session?.user?.role === 'ADMIN' ? 'Command Center' : 'Network Active'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Company switcher */}
                <div className="px-4 pt-4">
                    {status === "loading" ? (
                        <div className="h-[52px] w-full bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                    ) : (
                        <CompanySwitcher />
                    )}
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
                    {session?.user?.role === "ADMIN" && (
                        <div className="pt-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-3 mb-3">Quick Actions</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary w-full text-sm font-semibold justify-start px-4 gap-3"
                            >
                                <PlusSquare className="w-4.5 h-4.5" />
                                Assign Task
                            </button>
                        </div>
                    )}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-[var(--border-muted)]">
                    {status === "loading" ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl mb-2">
                             <div className="h-9 w-9 rounded-xl bg-white/5 animate-pulse border border-white/5 shrink-0" />
                             <div className="space-y-2 flex-1">
                                 <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                                 <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default mb-2">
                                <div className="h-9 w-9 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-xl" />
                                    ) : (
                                        <User className="w-5 h-5" style={{ color: "#00F5FF" }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-100 truncate">{session?.user?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Zap className="w-3 h-3" style={{ color: "#00F5FF" }} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neon-blue/60">
                                            {session?.user?.role}
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
                        </>
                    )}
                </div>
            </aside>

            {/* ── Mobile Sidebar Drawer ── */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[300px] z-[160] glass-strong border-r border-white/10 md:hidden flex flex-col p-6 h-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#00F5FF]/20 bg-zinc-900 shadow-[0_0_15px_rgba(0,245,255,0.1)] overflow-hidden">
                                        <img src="/ops-logo.png" alt="Agents OPS" className="w-8 h-8 object-contain" />
                                    </div>
                                    <span className="font-bold text-white tracking-tight uppercase">Agents Ops</span>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                                    <CloseIcon className="w-5 h-5 text-neon-blue" />
                                </button>
                            </div>

                            {/* Mobile User Profile Section */}
                            <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-xl" />
                                        ) : (
                                            <User className="w-6 h-6 text-[#00F5FF]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-black text-white truncate tracking-tight">{session?.user?.name || "Guest"}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Zap className="w-3.5 h-3.5 text-[#00F5FF]" fill="#00F5FF" fillOpacity={0.2} />
                                            </motion.div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#00F5FF]">
                                                {session?.user?.role || "MEMBER"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsDrawerOpen(false)}
                                            className={`nav-item h-14 ${isActive ? "active" : ""}`}
                                        >
                                            <item.icon className="w-5 h-5" style={{ color: isActive ? "#00F5FF" : "rgba(0, 245, 255, 0.45)" }} />
                                            <span className="text-base font-bold tracking-wide">{item.name}</span>
                                        </Link>
                                    );
                                })}

                                {session?.user?.role === "ADMIN" && (
                                    <Link
                                        href="/dashboard/tasks/new"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="nav-item h-14 bg-[#00F5FF]/5 border border-[#00F5FF]/10 text-[#00F5FF]"
                                    >
                                        <PlusSquare className="w-5 h-5" />
                                        <span className="text-base font-bold tracking-wide">Add Task</span>
                                    </Link>
                                )}
                            </nav>

                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        setIsLogoutModalOpen(true);
                                    }}
                                    className="flex w-full items-center justify-start gap-3 px-4 h-14 text-base font-bold tracking-wide transition-all rounded-xl text-red-400 bg-red-500/5 border border-red-500/20"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Wrapper ── */}
            <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden md:mb-0 pt-[64px] md:pt-0 custom-scrollbar">

                {/* ── Mobile Header ── */}
                <header className="md:hidden fixed top-0 left-0 right-0 h-[64px] flex items-center justify-between px-4 glass-strong border-b border-white/5 z-[100]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 active:scale-95 transition-all"
                        >
                            <Menu className="w-6 h-6 text-neon-blue" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-lg bg-[#00F5FF]/20 blur-sm" />
                                {activeCompany?.companyLogo ? (
                                    <img
                                        src={activeCompany.companyLogo}
                                        alt={activeCompany.companyName}
                                        className="relative w-8 h-8 object-cover rounded-lg border border-[#00F5FF]/20 bg-zinc-900"
                                    />
                                ) : (
                                    <div className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-[#00F5FF]/20 bg-zinc-900 overflow-hidden">
                                        <img src="/ops-logo.png" alt="Agents OPS" className="w-6 h-6 object-contain" />
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-black tracking-tight text-white uppercase truncate max-w-[100px]">
                                {activeCompany?.companyName || "Agents OPS"}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 max-w-[140px] ml-2">
                        <CompanySwitcher compact />
                    </div>
                </header>

                {/* Ambient neon glow */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00F5FF]/[0.04] blur-3xl pointer-events-none -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#00F5FF]/[0.03] blur-3xl pointer-events-none -ml-32 -mb-32" />

                <main className="flex-1 animate-fade-in relative flex flex-col overflow-y-auto md:overflow-y-visible custom-scrollbar">
                    <div className="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-10 py-4 md:py-6 relative">
                        {status === "loading" ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/20 backdrop-blur-sm z-50">
                               <div className="w-10 h-10 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon-blue/40 mt-4">Syncing</span>
                           </div>
                        ) : (
                           children
                        )}
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
