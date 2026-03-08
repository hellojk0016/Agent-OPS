"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, KeyRound, Loader2, ShieldCheck,
    ArrowLeft, Eye, EyeOff, CheckCircle2,
} from "lucide-react";

type Step = "phone" | "pin" | "success";

const spring = { type: "spring", stiffness: 340, damping: 28 };

export default function LoginPage() {
    const router = useRouter();

    const [digits, setDigits] = useState("");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [step, setStep] = useState<Step>("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const isValidPhone = digits.replace(/\s/g, "").length === 10;

    const formatDisplay = (d: string) => {
        const n = d.replace(/\s/g, "");
        return n.length > 5 ? `${n.slice(0, 5)} ${n.slice(5)}` : n;
    };

    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDigits(e.target.value.replace(/\D/g, "").slice(0, 10));
        setError("");
    };

    // ── Step 1: check phone exists ──────────────────────────────────────────
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidPhone) return;
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/check-phone?phone=${digits}`);
            const data = await res.json();
            if (!data.exists) {
                setError("Number not registered. Contact your admin.");
                return;
            }
            setStep("pin");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: phone + PIN login ───────────────────────────────────────────
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) { setError("Enter your PIN (min 4 digits)"); return; }
        setIsLoading(true);
        setError("");
        try {
            const result = await signIn("credentials", {
                redirect: false,
                phone: `+91${digits}`,
                pin,
            });
            if (result?.error) {
                setError("Incorrect PIN. Please try again.");
                setPin("");
            } else {
                setStep("success");
                setTimeout(() => router.push("/dashboard"), 900);
            }
        } catch {
            setError("Something went wrong. Please retry.");
        } finally {
            setIsLoading(false);
        }
    };

    const card = {
        background: "rgba(10, 10, 14, 0.97)",
        border: "1px solid rgba(0, 245, 255, 0.13)",
        boxShadow:
            "0 0 0 1px rgba(0,0,0,0.4), 0 24px 80px rgba(0,245,255,0.09), 0 8px 32px rgba(0,0,0,0.5)",
    };

    const accentLine = (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />
    );

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-4 overflow-hidden">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-[28rem] h-[28rem] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/[0.04] blur-[100px]" />
            </div>

            {/* Brand */}
            <motion.div
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex flex-col items-center gap-3"
            >
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)" }}
                >
                    <ShieldCheck className="h-7 w-7" style={{ color: "#00F5FF" }} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Agents OPS</h1>
                    <p className="mt-0.5 text-xs text-zinc-500">Secure team task management</p>
                </div>
            </motion.div>

            {/* Card */}
            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">

                    {/* ── STEP : PHONE ────────────────────────────────────── */}
                    {step === "phone" && (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-white">Sign In</h2>
                                <p className="mt-0.5 text-sm text-zinc-500">Enter your registered phone number</p>
                            </div>

                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                {/* Phone input */}
                                <div>
                                    <label className="field-label">
                                        <Phone className="h-3 w-3" />
                                        Phone Number
                                    </label>
                                    <div
                                        className="flex items-center overflow-hidden rounded-xl transition-all"
                                        style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}
                                    >
                                        <span className="select-none whitespace-nowrap pl-4 pr-2 text-sm font-semibold text-zinc-300">
                                            🇮🇳 +91
                                        </span>
                                        <div className="mx-1 h-5 w-px bg-zinc-700" />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="XXXXX XXXXX"
                                            value={formatDisplay(digits)}
                                            onChange={handlePhoneInput}
                                            className="flex-1 bg-transparent py-3.5 pr-4 text-sm tracking-wider text-zinc-100 outline-none placeholder:text-zinc-600"
                                            style={{ border: "none", boxShadow: "none" }}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="ml-1 mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                        10-digit Indian number only
                                    </p>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading || !isValidPhone}
                                    className="btn-primary w-full"
                                    style={{ height: 48 }}
                                    whileHover={{ scale: isLoading || !isValidPhone ? 1 : 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <ArrowLeft className="h-4 w-4 rotate-180" />}
                                    {isLoading ? "Checking…" : "Continue"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP : PIN ──────────────────────────────────────── */}
                    {step === "pin" && (
                        <motion.div
                            key="pin"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <div className="mb-1 flex items-center gap-2">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                                        style={{ background: "rgba(0,245,255,0.09)", border: "1px solid rgba(0,245,255,0.18)" }}
                                    >
                                        <KeyRound className="h-4 w-4" style={{ color: "#00F5FF" }} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Enter PIN</h2>
                                </div>
                                <p className="text-sm text-zinc-500">
                                    Signing in as{" "}
                                    <span className="font-semibold" style={{ color: "#00F5FF" }}>
                                        +91 {formatDisplay(digits)}
                                    </span>
                                </p>
                            </div>

                            <form onSubmit={handlePinSubmit} className="space-y-4">
                                <div>
                                    <label className="field-label">
                                        <KeyRound className="h-3 w-3" />
                                        PIN
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPin ? "text" : "password"}
                                            inputMode="numeric"
                                            placeholder="Enter your PIN"
                                            value={pin}
                                            onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                                            className="field-input w-full pr-12"
                                            maxLength={8}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading || pin.length < 4}
                                    className="btn-primary w-full"
                                    style={{ height: 48 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <ShieldCheck className="h-4 w-4" />}
                                    {isLoading ? "Signing In…" : "Sign In"}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => { setStep("phone"); setPin(""); setError(""); }}
                                    className="btn-ghost flex w-full items-center justify-center gap-1.5 text-sm"
                                    style={{ height: 36 }}
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Change number
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── SUCCESS ─────────────────────────────────────────── */}
                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-4 py-12"
                        >
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-full"
                                style={{ background: "rgba(0,245,255,0.1)", border: "2px solid rgba(0,245,255,0.4)" }}
                            >
                                <CheckCircle2 className="h-8 w-8" style={{ color: "#00F5FF" }} />
                            </div>
                            <p className="text-lg font-bold text-white">Signed in!</p>
                            <p className="text-sm text-zinc-500">Redirecting to dashboard…</p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
