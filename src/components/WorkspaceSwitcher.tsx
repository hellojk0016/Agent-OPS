/* eslint-disable @next/next/no-img-element */
'use client';

import { useSession } from "next-auth/react";
import { ChevronDown, Building2, Check, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCompanyName } from "@/lib/branding";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function WorkspaceSwitcher() {
    const { data: session, update } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (!session?.user?.memberships || session.user.memberships.length <= 1) {
        const activeMembership = session?.user?.memberships?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (m: any) => m.companyId === session.user.activeCompanyId
        );

        return (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass border-zinc-800/30 shadow-inner">
                <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 overflow-hidden"
                    style={{ backgroundColor: activeMembership?.companyTheme || '#00F5FF' }}
                >
                    {activeMembership?.companyLogo ? (
                        <img src={activeMembership.companyLogo} alt={activeMembership.companyName} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 className="h-5 w-5 text-neon-blue" />
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">WORKSPACE</span>
                    <span className="text-sm font-bold text-zinc-100 truncate">{getCompanyName(activeMembership?.companyName) || 'My Team'}</span>
                </div>
            </div>
        );
    }

    const activeMembership = session.user.memberships.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m: any) => m.companyId === session.user.activeCompanyId
    );

    const handleSwitch = async (companyId: string) => {
        setIsOpen(false);
        if (companyId === session.user.activeCompanyId) return;

        await update({
            activeCompanyId: companyId
        });

        // Refresh the page to update all server-side data
        window.location.reload();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 transition-all duration-300",
                    isOpen ? "glass border-neon-blue/20 shadow-lg shadow-neon-blue/5" : "glass border-zinc-800/30 hover:border-zinc-700/50"
                )}
            >
                <div className="flex items-center gap-3 truncate">
                    <div
                        className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 transition-transform group-hover:scale-105 overflow-hidden"
                        style={{ backgroundColor: activeMembership?.companyTheme || '#00F5FF' }}
                    >
                        {activeMembership?.companyLogo ? (
                            <img src={activeMembership.companyLogo} alt={activeMembership.companyName} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="h-5 w-5 text-neon-blue" />
                        )}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-500 transition-colors">WORKSPACE</span>
                        <span className="text-sm font-bold text-zinc-100 truncate">{getCompanyName(activeMembership?.companyName)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 pr-1">
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 text-neon-blue", isOpen ? "rotate-180" : "")} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            className="absolute left-0 mt-3 min-w-[240px] w-max max-w-[280px] z-50 overflow-hidden rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/50 shadow-2xl p-1.5"
                        >
                            <div className="px-3 py-2 border-b border-zinc-800/50 mb-1 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SWITCH WORKSPACE</span>
                                <ArrowLeftRight className="w-3 h-3 text-neon-blue" />
                            </div>

                            <div className="space-y-1">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {session.user.memberships.map((membership: any) => {
                                    const isSelected = membership.companyId === session.user.activeCompanyId;
                                    return (
                                        <button
                                            key={membership.companyId}
                                            onClick={() => handleSwitch(membership.companyId)}
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-medium transition-all group/item hover-lift",
                                                isSelected
                                                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/10"
                                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                                            )}
                                        >
                                            <div
                                                className="h-7 w-7 rounded-lg flex items-center justify-center text-white shadow-md transition-transform group-hover/item:scale-110 overflow-hidden"
                                                style={{ backgroundColor: membership.companyTheme }}
                                            >
                                                {membership.companyLogo ? (
                                                    <img src={membership.companyLogo} alt={membership.companyName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="h-4 w-4 text-neon-blue" />
                                                )}
                                            </div>
                                             <div className="flex flex-col items-start min-w-0 flex-1 pr-4">
                                                  <span className="text-[11px] font-bold uppercase tracking-tight text-white leading-tight truncate">{getCompanyName(membership.companyName)}</span>
                                             </div>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-neon-blue" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
