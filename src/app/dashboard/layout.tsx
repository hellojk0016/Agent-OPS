"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    PenTool,
    LayoutDashboard,
    PlusSquare,
    LogOut,
    User,
    ChevronRight,
    X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import TaskForm from "./tasks/new/TaskForm";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetch("/api/employees")
                .then((res) => res.json())
                .then((data) => setEmployees(data))
                .catch((err) => console.error("Error fetching employees:", err));
        }
    }, [session]);

    // Handle query param for adding task
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('addTask') === 'true') {
            setIsModalOpen(true);
            // Optionally clear the param without reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [pathname]); // Check on navigation

    if (status === "loading") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ...(session?.user?.role === "ADMIN" ? [{ name: "Employees", href: "/dashboard/employees", icon: User }] : []),
    ];

    const isAdminDashboard = session.user?.role === "ADMIN" && pathname === "/dashboard";

    const activeMembership = session.user?.memberships?.find(
        (m: any) => m.companyId === session.user.activeCompanyId
    );

    return (
        <div className={cn("flex h-screen w-full text-zinc-100 overflow-hidden font-sans", isAdminDashboard ? "bg-[#0B0B0B]" : "bg-zinc-950")}>
            {/* Sidebar */}
            <aside className="w-[280px] hidden md:flex flex-col glass border-r border-zinc-800/50 z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Image
                            src="/images/ops-logo.png"
                            alt="OPS Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight text-gradient">Agents OPS</span>
                    </div>

                    <WorkspaceSwitcher />
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-lg shadow-neon-blue/5"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 transition-colors text-neon-blue`} />
                                    {item.name}
                                </div>
                                {isActive && (
                                    <motion.div layoutId="active" className="w-1 h-1 rounded-full bg-neon-blue" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-zinc-800/50 space-y-4">
                    <div className="flex items-center gap-4 px-2 py-1">
                        <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                            {session.user.image ? (
                                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-neon-blue" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate text-zinc-100">{session.user.name}</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${session.user.role === 'ADMIN' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{session.user.role}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all outline-none"
                    >
                        <LogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                {/* Header */}
                <header className={cn(
                    "h-[72px] flex items-center justify-between px-6 lg:px-10 z-10 transition-colors duration-300",
                    isAdminDashboard ? "bg-[#0B0B0B]" : "border-b border-zinc-800/50 glass"
                )}>
                    <div className="flex items-center gap-4 md:hidden">
                        <Image
                            src="/images/ops-logo.png"
                            alt="OPS Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                        <span className="text-sm font-bold truncate text-zinc-100">{activeMembership?.companyName}</span>
                    </div>

                    <div className="flex-1 hidden md:flex items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 border-l border-zinc-800/50 pl-6 ml-2">
                            {activeMembership?.companyName}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                    </div>
                </header>

                <main className="flex-1 overflow-hidden animate-fade-in relative flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

                    <div className="flex-1 flex flex-col overflow-hidden w-full px-6 lg:px-10 pt-6">
                        {children}
                    </div>
                </main>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden glass"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

                                <div className="p-8 lg:p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Task</h2>
                                            <p className="text-zinc-400 text-sm">Assign a mission to your team member.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 rounded-lg text-neon-blue hover:text-white hover:bg-zinc-800 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-neon-blue" />
                                        </button>
                                    </div>
                                    <TaskForm
                                        employees={employees}
                                        onSuccess={() => {
                                            setIsModalOpen(false);
                                            router.refresh();
                                        }}
                                        onCancel={() => setIsModalOpen(false)}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
