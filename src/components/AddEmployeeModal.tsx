"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserPlus } from "lucide-react";

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (employee: any) => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("MEMBER");
    const [companyType, setCompanyType] = useState("Both");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const formatPhoneDisplay = (val: string) => {
        const cleaned = val.replace(/\D/g, "").slice(0, 10);
        if (cleaned.length <= 5) return cleaned;
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError("Name is required");
        if (phone.length !== 10) return setError("10-digit phone number required");

        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, role, companyType }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error adding employee");
            }

            const newEmployee = await res.json();

            // reset form
            setName("");
            setPhone("");
            setRole("MEMBER");
            setCompanyType("Both");
            onSuccess(newEmployee);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden glass hover-lift"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <UserPlus className="w-6 h-6 text-neon-blue" />
                                        Add Employee
                                    </h2>
                                    <p className="text-zinc-400 text-sm">Grant system access via phone OTP.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-neon-blue" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-2 block">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-2 block">
                                        Mobile Number
                                    </label>
                                    <div className="relative flex items-center rounded-xl border border-zinc-800 bg-zinc-900/50 focus-within:border-neon-blue focus-within:ring-1 focus-within:ring-neon-blue transition shadow-inner overflow-hidden">
                                        <span className="pl-4 pr-2 text-zinc-300 font-semibold text-base select-none whitespace-nowrap flex items-center gap-1">
                                            🇮🇳 +91
                                        </span>
                                        <div className="w-px h-5 bg-zinc-700 mx-1" />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="XXXXX XXXXX"
                                            value={formatPhoneDisplay(phone)}
                                            onChange={handlePhoneChange}
                                            className="flex-1 bg-transparent py-3 pr-4 text-zinc-100 placeholder:text-zinc-600 outline-none text-base tracking-wider"
                                        />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 ml-1 mt-1.5">
                                        They will log in using this number via SMS OTP.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-2 block">
                                        System Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole("MEMBER")}
                                            className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${role === "MEMBER"
                                                ? "bg-neon-blue/10 border-neon-blue/50 text-neon-blue shadow-inner"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            Member
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("ADMIN")}
                                            className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${role === "ADMIN"
                                                ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-inner"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-2 block">
                                        Company Access
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCompanyType("Knight Wolf")}
                                            className={`py-2 rounded-xl border text-xs font-medium transition-all ${companyType === "Knight Wolf"
                                                ? "bg-neon-blue/10 border-neon-blue/50 text-neon-blue shadow-inner"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            Knight Wolf
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCompanyType("Commerce Agent")}
                                            className={`py-2 rounded-xl border text-xs font-medium transition-all ${companyType === "Commerce Agent"
                                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-inner"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            Commerce
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCompanyType("Both")}
                                            className={`py-2 rounded-xl border text-xs font-medium transition-all ${companyType === "Both"
                                                ? "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-inner"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            Both
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-neon-blue hover:bg-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 rounded-xl py-3.5 font-bold shadow-lg shadow-neon-blue/20 transition-all flex items-center justify-center mt-4"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Confirm Add Employee"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
