"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserPlus, UserCheck, Users, Shield, Building, Store, Layers, Phone } from "lucide-react";

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
            setName(""); setPhone(""); setRole("MEMBER"); setCompanyType("Both");
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
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl"
                        style={{
                            background: "rgba(12, 12, 16, 0.96)",
                            border: "1px solid rgba(0, 245, 255, 0.15)",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0, 245, 255, 0.12), 0 8px 32px rgba(0,0,0,0.6)",
                        }}
                    >
                        {/* Top accent */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-60" />
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#00F5FF]/[0.06] blur-3xl pointer-events-none -mr-24 -mt-24" />

                        <div className="relative p-7">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-7">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#00F5FF]/10 border border-[#00F5FF]/20 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-[#00F5FF]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white tracking-tight">Add Member</h2>
                                        <p className="text-xs text-zinc-500">Grant system access via phone OTP.</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="btn-surface w-9 h-9 p-0" style={{ height: 36, width: 36, padding: 0 }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                                        <X className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {/* Name */}
                                <div>
                                    <label className="field-label">
                                        <Users className="w-3 h-3" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="field-input w-full"
                                        autoFocus
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="field-label">
                                        <Phone className="w-3 h-3" />
                                        Mobile Number
                                    </label>
                                    <div
                                        className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
                                        style={{
                                            background: "var(--bg-elevated)",
                                            border: "1.5px solid var(--border-default)",
                                        }}
                                    >
                                        <span className="pl-4 pr-2 text-zinc-300 font-semibold text-sm select-none whitespace-nowrap">
                                            🇮🇳 +91
                                        </span>
                                        <div className="w-px h-5 bg-zinc-700 mx-1" />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="XXXXX XXXXX"
                                            value={formatPhoneDisplay(phone)}
                                            onChange={handlePhoneChange}
                                            className="flex-1 bg-transparent py-3 pr-4 text-zinc-100 placeholder:text-zinc-600 outline-none text-sm tracking-wider border-none"
                                            style={{ background: "transparent", border: "none", boxShadow: "none" }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-zinc-600 mt-1.5 ml-1">10-digit Indian mobile number</p>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="field-label">
                                        <Shield className="w-3 h-3" />
                                        System Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[{ val: "MEMBER", label: "Member", icon: Users }, { val: "ADMIN", label: "Admin", icon: Shield }].map(({ val, label, icon: Icon }) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setRole(val)}
                                                className={`select-btn ${role === val ? "active" : ""}`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="field-label">
                                        <Building className="w-3 h-3" />
                                        Company Access
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { val: "Knight Wolf", label: "Knight Wolf", icon: Building },
                                            { val: "Commerce Agent", label: "Commerce", icon: Store },
                                            { val: "Both", label: "Both", icon: Layers },
                                        ].map(({ val, label, icon: Icon }) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setCompanyType(val)}
                                                className={`select-btn text-xs ${companyType === val ? "active" : ""}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full h-12 font-bold mt-2"
                                    style={{ height: 48 }}
                                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <UserCheck className="w-5 h-5" />
                                    )}
                                    {isLoading ? "Adding..." : "Confirm Add Member"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
