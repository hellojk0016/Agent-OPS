"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, KeyRound, Loader2, ShieldCheck,
    ArrowLeft, Eye, EyeOff, CheckCircle2,
} from "lucide-react";

type Step = "phone" | "pin" | "forgot-pin" | "reset-pin" | "success";

const spring = { type: "spring" as const, stiffness: 340, damping: 28 };

export default function LoginPage() {
    const router = useRouter();

    const [digits, setDigits] = useState("");
    const [pin, setPin] = useState("");
    const [otp, setOtp] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [step, setStep] = useState<Step>("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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
            setIsAdmin(data.role === "ADMIN");
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
                // Check if they need a mandatory PIN reset
                const session = await getSession();
                if (session?.user?.pinResetRequired) {
                    setStep("reset-pin");
                } else {
                    setStep("success");
                    setTimeout(() => router.push("/dashboard"), 900);
                }
            }
        } catch {
            setError("Something went wrong. Please retry.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Forgot PIN logic ───────────────────────────────────────────────────
    const handleForgotPin = async () => {
        setIsLoading(true);
        setError("");
        setMessage("");
        try {
            const phone = `+91${digits}`;
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            setMessage(data.message || "OTP sent to your email");
            setStep("forgot-pin");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        setIsLoading(true);
        setError("");
        try {
            const phone = `+91${digits}`;
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, token: otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            setStep("reset-pin");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length < 4) { setError("PIN must be at least 4 digits"); return; }
        if (newPin !== confirmPin) { setError("PINs do not match"); return; }

        setIsLoading(true);
        setError("");
        try {
            const phone = `+91${digits}`;
            const res = await fetch("/api/auth/reset-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, newPin }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset PIN");

            setStep("success");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err: any) {
            setError(err.message);
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
                    className="h-24 w-24 rounded-3xl overflow-hidden border border-[#00F5FF]/30 shadow-[0_0_20px_rgba(0,245,255,0.15)]"
                >
                    <Image
                        src="/ops-logo.png"
                        alt="OPS Logo"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                    />
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
                                        className="group relative flex items-center overflow-hidden rounded-2xl transition-all duration-300"
                                        style={{
                                            background: "rgba(14, 14, 18, 0.4)",
                                            border: "1px solid rgba(0, 245, 255, 0.15)",
                                            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF]/[0.02] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="flex items-center gap-2 px-5 py-4 bg-[#00F5FF]/[0.03] border-r border-[#00F5FF]/10">
                                            <span className="text-[10px] font-bold text-[#00F5FF]/40 uppercase tracking-tighter">IN</span>
                                            <span className="text-sm font-bold text-white tracking-tight">+91</span>
                                        </div>

                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="XXXXX XXXXX"
                                            value={formatDisplay(digits)}
                                            onChange={handlePhoneInput}
                                            className="flex-1 border-0 bg-transparent py-4 pl-5 pr-4 text-base font-medium tracking-[0.1em] text-white caret-[#00F5FF] outline-none placeholder:text-zinc-700"
                                            style={{ boxShadow: "none" }}
                                            autoFocus
                                        />

                                        {/* Focus glow border */}
                                        <div className="absolute inset-0 border-px border-[#00F5FF]/0 group-focus-within:border-[#00F5FF]/40 transition-all rounded-2xl pointer-events-none" />
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
                                    className="btn-primary w-full shadow-[0_0_20px_rgba(0,245,255,0.2)]"
                                    style={{ height: 56, borderRadius: '16px' }}
                                    whileHover={{ scale: isLoading || !isValidPhone ? 1 : 1.01, boxShadow: "0 0 30px rgba(0,245,255,0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold uppercase tracking-[0.2em]">Continue</span>
                                            <ArrowLeft className="h-5 w-5 rotate-180" />
                                        </div>}
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
                                    <div
                                        className="group relative flex items-center overflow-hidden rounded-2xl transition-all duration-300"
                                        style={{
                                            background: "rgba(14, 14, 18, 0.4)",
                                            border: "1px solid rgba(0, 245, 255, 0.15)",
                                            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)"
                                        }}
                                    >
                                        <input
                                            type={showPin ? "text" : "password"}
                                            inputMode="numeric"
                                            placeholder="Enter your PIN"
                                            value={pin}
                                            onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                                            className="flex-1 border-0 bg-transparent py-4 pl-5 pr-12 text-base font-medium tracking-[0.4em] text-white caret-[#00F5FF] outline-none placeholder:text-zinc-700 placeholder:tracking-normal"
                                            maxLength={8}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>

                                        {/* Focus glow border */}
                                        <div className="absolute inset-0 border-px border-[#00F5FF]/0 group-focus-within:border-[#00F5FF]/40 transition-all rounded-2xl pointer-events-none" />
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
                                    className="btn-primary w-full shadow-[0_0_20px_rgba(0,245,255,0.2)]"
                                    style={{ height: 56, borderRadius: '16px' }}
                                    whileHover={{ scale: isLoading || pin.length < 4 ? 1 : 1.01, boxShadow: "0 0 30px rgba(0,245,255,0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold uppercase tracking-[0.2em]">Sign In</span>
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>}
                                </motion.button>

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setStep("phone"); setPin(""); setError(""); }}
                                        className="btn-ghost flex w-full items-center justify-center gap-1.5 text-sm"
                                        style={{ height: 36, border: 'none' }}
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Change number
                                    </button>

                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={handleForgotPin}
                                            disabled={isLoading}
                                            className="text-xs font-semibold text-zinc-500 hover:text-neon-blue transition-colors text-center py-2"
                                        >
                                            Forgot PIN?
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP : FORGOT PIN (OTP) ─────────────────────────────── */}
                    {step === "forgot-pin" && (
                        <motion.div
                            key="forgot-pin"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-white">Verify Code</h2>
                                <p className="text-sm text-zinc-500">
                                    Enter the 6-digit OTP sent to the email address registered for <span className="text-neon-blue">+91 {formatDisplay(digits)}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <label className="field-label">OTP Code</label>
                                    <div className="group relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="XXXXXX"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            className="w-full bg-transparent py-4 text-center text-xl font-bold tracking-[0.5em] text-white outline-none"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {message && <p className="text-xs text-center text-neon-blue/80 bg-neon-blue/5 p-2 rounded-lg">{message}</p>}
                                {error && <p className="text-xs text-center text-red-400 bg-red-400/5 p-2 rounded-lg">{error}</p>}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="btn-primary w-full"
                                    style={{ height: 56, borderRadius: '16px' }}
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify OTP"}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => setStep("pin")}
                                    className="w-full text-xs text-zinc-500 hover:text-white py-2"
                                >
                                    Back to Login
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP : RESET PIN ───────────────────────────────────── */}
                    {step === "reset-pin" && (
                        <motion.div
                            key="reset-pin"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-white">Reset PIN</h2>
                                <p className="text-sm text-zinc-500">Set a new secure PIN for your account</p>
                            </div>

                            <form onSubmit={handleResetPin} className="space-y-4">
                                <div>
                                    <label className="field-label">New PIN (4-8 digits)</label>
                                    <div className="group relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            placeholder="••••"
                                            value={newPin}
                                            onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                            className="w-full bg-transparent py-4 text-center text-xl tracking-[0.4em] text-white outline-none"
                                            maxLength={8}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Confirm PIN</label>
                                    <div className="group relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            placeholder="••••"
                                            value={confirmPin}
                                            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                            className="w-full bg-transparent py-4 text-center text-xl tracking-[0.4em] text-white outline-none"
                                            maxLength={8}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-center text-red-400 bg-red-400/5 p-2 rounded-lg">{error}</p>}

                                <motion.button
                                    type="submit"
                                    disabled={isLoading || newPin.length < 4}
                                    className="btn-primary w-full shadow-[0_0_20px_rgba(0,245,255,0.3)]"
                                    style={{ height: 56, borderRadius: '16px' }}
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save & Login"}
                                </motion.button>
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
        </div >
    );
}
