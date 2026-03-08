"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Loader2, UserPlus, UserCheck, Users, Shield,
    Building, Store, Layers, Phone, Lock, Eye, EyeOff,
    RefreshCw, Copy, CheckCircle2,
} from "lucide-react";

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (employee: any) => void;
}

/** Generate a random numeric PIN of given length */
function generatePin(length = 6): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [role, setRole] = useState("MEMBER");
    const [companyType, setCompanyType] = useState("Both");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // After creation — show PIN once
    const [createdEmployee, setCreatedEmployee] = useState<any>(null);
    const [plainPin, setPlainPin] = useState("");
    const [copied, setCopied] = useState(false);

    const formatPhoneDisplay = (val: string) => {
        const n = val.replace(/\D/g, "").slice(0, 10);
        return n.length <= 5 ? n : `${n.slice(0, 5)} ${n.slice(5)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));

    const handleGenerate = () => {
        const p = generatePin(6);
        setPin(p);
        setShowPin(true); // show it right away so admin can see
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError("Name is required");
        if (phone.length !== 10) return setError("10-digit phone number required");
        if (!pin || pin.length < 4) return setError("PIN must be at least 4 digits");

        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, role, companyType, pin }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error adding employee");
            }

            const newEmployee = await res.json();
            setPlainPin(pin);         // hold the plain PIN for display
            setCreatedEmployee(newEmployee);
            onSuccess(newEmployee);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(plainPin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDone = () => {
        // Reset everything
        setName(""); setPhone(""); setPin(""); setRole("MEMBER");
        setCompanyType("Both"); setError(""); setCreatedEmployee(null); setPlainPin(""); setCopied(false);
        onClose();
    };

    const cardStyle = {
        background: "rgba(12, 12, 16, 0.96)",
        border: "1px solid rgba(0, 245, 255, 0.15)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0,245,255,0.12), 0 8px 32px rgba(0,0,0,0.6)",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={createdEmployee ? undefined : onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl"
                        style={cardStyle}
                    >
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-60" />
                        <div className="absolute -mr-24 -mt-24 right-0 top-0 h-48 w-48 rounded-full bg-[#00F5FF]/[0.05] blur-3xl pointer-events-none" />

                        <div className="relative p-7">

                            {/* ── FORM VIEW ──────────────────────────────────────── */}
                            {!createdEmployee && (
                                <>
                                    {/* Header */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00F5FF]/10 border border-[#00F5FF]/20">
                                                <UserPlus className="h-5 w-5 text-[#00F5FF]" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold tracking-tight text-white">Add Member</h2>
                                                <p className="text-xs text-zinc-500">Phone + PIN login access</p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="btn-surface" style={{ height: 36, width: 36, padding: 0 }}>
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {error && (
                                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-400">
                                                <X className="h-4 w-4 flex-shrink-0" />{error}
                                            </div>
                                        )}

                                        {/* Name */}
                                        <div>
                                            <label className="field-label"><Users className="h-3 w-3" />Full Name</label>
                                            <input type="text" placeholder="John Doe" value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="field-input w-full" autoFocus />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="field-label"><Phone className="h-3 w-3" />Mobile Number</label>
                                            <div className="flex items-center overflow-hidden rounded-xl transition-all"
                                                style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}>
                                                <span className="select-none whitespace-nowrap pl-4 pr-2 text-sm font-semibold text-zinc-300">🇮🇳 +91</span>
                                                <div className="mx-1 h-5 w-px bg-zinc-700" />
                                                <input type="tel" inputMode="numeric" placeholder="XXXXX XXXXX"
                                                    value={formatPhoneDisplay(phone)} onChange={handlePhoneChange}
                                                    className="flex-1 bg-transparent py-3 pr-4 text-sm tracking-wider text-zinc-100 outline-none placeholder:text-zinc-600"
                                                    style={{ border: "none", boxShadow: "none" }} />
                                            </div>
                                        </div>

                                        {/* PIN */}
                                        <div>
                                            <label className="field-label"><Lock className="h-3 w-3" />Temporary PIN</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type={showPin ? "text" : "password"}
                                                        inputMode="numeric"
                                                        placeholder="Min. 4 digits"
                                                        value={pin}
                                                        onChange={e => { setPin(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
                                                        className="field-input w-full pr-12"
                                                    />
                                                    <button type="button" onClick={() => setShowPin(v => !v)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                                        style={{ color: "var(--text-muted)" }}>
                                                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {/* Generate button */}
                                                <button type="button" onClick={handleGenerate}
                                                    className="btn-surface flex items-center gap-1.5 whitespace-nowrap px-3 text-xs font-semibold"
                                                    style={{ height: 46, flexShrink: 0 }}>
                                                    <RefreshCw className="h-3.5 w-3.5" />Generate
                                                </button>
                                            </div>
                                            <p className="ml-1 mt-1.5 text-[11px] text-zinc-600">
                                                🔒 Share this PIN with the employee — save it, it won't be shown again
                                            </p>
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <label className="field-label"><Shield className="h-3 w-3" />System Role</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[{ val: "MEMBER", label: "Member", Icon: Users }, { val: "ADMIN", label: "Admin", Icon: Shield }].map(({ val, label, Icon }) => (
                                                    <button key={val} type="button" onClick={() => setRole(val)}
                                                        className={`select-btn ${role === val ? "active" : ""}`}>
                                                        <Icon className="h-4 w-4" />{label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div>
                                            <label className="field-label"><Building className="h-3 w-3" />Company Access</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { val: "Knight Wolf", label: "Knight Wolf", Icon: Building },
                                                    { val: "Commerce Agent", label: "Commerce", Icon: Store },
                                                    { val: "Both", label: "Both", Icon: Layers },
                                                ].map(({ val, label, Icon }) => (
                                                    <button key={val} type="button" onClick={() => setCompanyType(val)}
                                                        className={`select-btn text-xs ${companyType === val ? "active" : ""}`}>
                                                        <Icon className="h-3.5 w-3.5" />{label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <motion.button type="submit" disabled={isLoading}
                                            className="btn-primary mt-2 h-12 w-full font-bold"
                                            style={{ height: 48 }}
                                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                            whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                                            {isLoading ? "Adding…" : "Add Member"}
                                        </motion.button>
                                    </form>
                                </>
                            )}

                            {/* ── PIN REVEAL VIEW (shown once after creation) ───── */}
                            {createdEmployee && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-5 py-4 text-center"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                        style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.25)" }}>
                                        <CheckCircle2 className="h-7 w-7" style={{ color: "#00F5FF" }} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-white">Member Added!</h2>
                                        <p className="mt-0.5 text-sm text-zinc-500">
                                            <span className="font-semibold text-zinc-300">{createdEmployee.name}</span> can now log in with their phone + PIN
                                        </p>
                                    </div>

                                    {/* PIN display */}
                                    <div className="w-full rounded-xl p-4"
                                        style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.2)" }}>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                            Temporary PIN — copy now
                                        </p>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-mono text-3xl font-bold tracking-[0.3em]"
                                                style={{ color: "#00F5FF", letterSpacing: "0.35em" }}>
                                                {plainPin}
                                            </span>
                                            <button onClick={handleCopy}
                                                className="btn-primary flex items-center gap-1.5 px-4 text-sm"
                                                style={{ height: 38 }}>
                                                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-zinc-600">
                                        ⚠️ This PIN will not be shown again. Save it before closing.
                                    </p>

                                    <button onClick={handleDone} className="btn-ghost w-full text-sm" style={{ height: 40 }}>
                                        Done — Close
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
