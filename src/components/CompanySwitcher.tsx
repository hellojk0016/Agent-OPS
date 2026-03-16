/* eslint-disable @next/next/no-img-element */
'use client';

import { useSession } from "next-auth/react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCompanyLogo, getCompanyName } from "@/lib/branding";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const TARGET_COMPANIES = ['KNIGHT WOLF', 'COMMERCE AGENT'];

interface CompanySwitcherProps {
    compact?: boolean;
}

export default function CompanySwitcher({ compact = false }: CompanySwitcherProps) {
    const { data: session, update } = useSession();
    const [isSwitching, setIsSwitching] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [allTargetCompanies, setAllTargetCompanies] = useState<any[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        
        // Fetch companies to ensure we have IDs for target names
        fetch('/api/companies')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    const filtered = data.filter((c: any) => 
                        TARGET_COMPANIES.includes(c.name.trim().toUpperCase())
                    ).map(c => ({
                        companyId: c.id,
                        companyName: c.name,
                        companyLogo: c.logo
                    }));
                    setAllTargetCompanies(filtered);
                }
            })
            .catch(err => console.error("Error fetching companies:", err));

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const memberships = useMemo(() => session?.user?.memberships || [], [session?.user?.memberships]);
    
    // Merge memberships with all target companies to ensure both are always visible
    const filteredMemberships = useMemo(() => {
        const map = new Map();
        
        // Start with known memberships
        memberships.forEach((m: any) => {
            if (TARGET_COMPANIES.includes(m.companyName.trim().toUpperCase())) {
                map.set(m.companyName.trim().toUpperCase(), m);
            }
        });

        // Add missing target companies
        allTargetCompanies.forEach((c: any) => {
            if (!map.has(c.companyName.trim().toUpperCase())) {
                map.set(c.companyName.trim().toUpperCase(), c);
            }
        });

        return Array.from(map.values());
    }, [memberships, allTargetCompanies]);

    const activeMembership = useMemo(() => {
        const active = filteredMemberships.find((m: any) => m.companyId === session?.user?.activeCompanyId);
        if (active) return active;
        
        // Fallback to the first available target company
        return filteredMemberships[0];
    }, [filteredMemberships, session?.user?.activeCompanyId]);

    const handleSwitch = async (companyId: string) => {
        if (companyId === session?.user?.activeCompanyId) {
            setIsOpen(false);
            return;
        }
        if (isSwitching) return;
        
        setIsSwitching(true);
        setIsOpen(false);
        try {
            await update({
                activeCompanyId: companyId
            });
            window.location.reload();
        } catch (error) {
            console.error("[CompanySwitcher] Error switching company:", error);
            setIsSwitching(false);
        }
    };

    if (!isMounted) return null;

    if (filteredMemberships.length === 0) {
        return (
            <div className={cn(
                "flex items-center gap-3 rounded-2xl bg-zinc-900/50 border border-white/5 opacity-50",
                compact ? "px-3 py-2" : "px-4 py-2.5"
            )}>
                <Building2 className={cn("text-zinc-500", compact ? "h-4 w-4" : "h-5 w-5")} />
                <span className={cn("font-bold text-zinc-500 uppercase tracking-widest", compact ? "text-[8px]" : "text-xs")}>
                    No Active Workspace
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isSwitching}
                className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-2xl transition-all duration-300",
                    "bg-[#16161a] border border-white/5 hover:border-neon-blue/30 group",
                    isOpen && "border-neon-blue/50 ring-2 ring-neon-blue/10",
                    isSwitching && "cursor-wait opacity-80",
                    compact ? "px-3 py-2" : "px-4 py-3"
                )}
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={cn(
                        "rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden border shrink-0",
                        "border-neon-blue/20 bg-neon-blue/5 group-hover:border-neon-blue/40",
                        compact ? "h-6 w-6 rounded-lg" : "h-8 w-8"
                    )}>
                        {(() => {
                            const logoSrc = getCompanyLogo({ name: activeMembership?.companyName, logo: activeMembership?.companyLogo });
                            if (logoSrc) {
                                return <img src={logoSrc} alt={activeMembership.companyName} className="w-full h-full object-cover" />;
                            }
                            return <img src="/images/ops-logo.png" alt="OPS logo" className="w-full h-full object-cover" />;
                        })()}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className={cn(
                            "font-bold text-white truncate w-full leading-tight",
                            compact ? "text-xs" : "text-sm"
                        )}>
                            {activeMembership ? getCompanyName(activeMembership.companyName) : 'SELECT COMPANY'}
                        </span>
                    </div>
                </div>
                
                <ChevronDown className={cn(
                    "h-4 w-4 text-zinc-500 transition-transform duration-300 ease-out",
                    isOpen ? "rotate-180 text-neon-blue" : "group-hover:text-zinc-300",
                    compact && "h-3 w-3"
                )} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 z-[100] mt-2 p-1.5 rounded-2xl bg-[#16161a] border border-white/10 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="space-y-1">
                            {filteredMemberships.map((membership: any) => {
                                const isActive = membership.companyId === session?.user?.activeCompanyId;
                                return (
                                    <button
                                        key={membership.companyId}
                                        onClick={() => handleSwitch(membership.companyId)}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left",
                                            isActive 
                                                ? "bg-neon-blue/10 text-neon-blue" 
                                                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                                        )}
                                    >
                                         <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                                             <div className={cn(
                                                 "h-8 w-8 rounded-lg flex items-center justify-center transition-all overflow-hidden border shrink-0",
                                                 isActive ? "border-neon-blue/40" : "border-white/5 bg-zinc-900"
                                             )}>
                                                 {(() => {
                                                     const logoSrc = getCompanyLogo({ name: membership.companyName, logo: membership.companyLogo });
                                                     if (logoSrc) {
                                                         return <img src={logoSrc} alt={membership.companyName} className="w-full h-full object-cover" />;
                                                     }
                                                     return <img src="/images/ops-logo.png" alt="OPS logo" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />;
                                                 })()}
                                             </div>
                                             <span className="text-[11px] font-semibold truncate uppercase tracking-wider text-white">
                                                 {getCompanyName(membership.companyName)}
                                             </span>
                                         </div>
                                        {isActive && <Check className="h-4 w-4 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isSwitching && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-[110]">
                    <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
