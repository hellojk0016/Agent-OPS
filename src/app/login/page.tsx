"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, KeyRound, Loader2, ShieldCheck, ArrowLeft,
    RotateCcw, CheckCircle2, Eye, EyeOff, Lock, RefreshCw,
} from "lucide-react";

// ----- Firebase helpers (OTP only for PIN reset) -----
let auth: any = null;
let RecaptchaVerifier: any = null;
let signInWithPhoneNumber: any = null;

async function initFirebase() {
    if (auth) return { auth, RecaptchaVerifier, signInWithPhoneNumber };
    const app = await import("@/lib/firebase");
    const firebase = await import("firebase/auth");
    auth = firebase.getAuth(app.default);
    RecaptchaVerifier = firebase.RecaptchaVerifier;
    signInWithPhoneNumber = firebase.signInWithPhoneNumber;
    return { auth, RecaptchaVerifier, signInWithPhoneNumber };
}

type Step = "phone" | "pin" | "forgot-otp" | "forgot-newpin" | "reset-pin";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, duration: 0.4 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
    const router = useRouter();

    // Phone entry
    const [digits, setDigits] = useState("");
    const [step, setStep] = useState<Step>("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // PIN login
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);

    // OTP (for forgot PIN)
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [countdown, setCountdown] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    const recaptchaRef = useRef<any>(null);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // New PIN (after OTP verified)
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [showNewPin, setShowNewPin] = useState(false);
    const [firebaseTokenForReset, setFirebaseTokenForReset] = useState("");

    // Success
    const [success, setSuccess] = useState(false);

    const isValidPhone = digits.replace(/\s/g, "").length === 10;
    const formatPhoneDigits = (d: string) => {
        const n = d.replace(/\s/g, "");
        return n.length > 5 ? `${n.slice(0, 5)} ${n.slice(5)}` : n;
    };

    const handleDigitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
        setDigits(raw);
        setError("");
    };

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // ── Step 1: Check phone exists ─────────────────────────────────────────
    const handleCheckPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidPhone) return;
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/check-phone?phone=${digits}`);
            const data = await res.json();
            if (!res.ok || !data.exists) {
                setError("Phone number not registered. Contact your admin.");
                return;
            }
            setStep("pin");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Phone + PIN Login ──────────────────────────────────────────
    const handlePinLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin || pin.length < 4) { setError("Enter your PIN"); return; }
        setIsLoading(true);
        setError("");
        try {
            const result = await signIn("credentials", {
                redirect: false,
                phone: `+91${digits}`,
                pin,
            });
            if (result?.error) {
                setError("Incorrect PIN. Try again or use Forgot PIN.");
            } else {
                setSuccess(true);
                setTimeout(() => router.push("/dashboard"), 800);
            }
        } catch {
            setError("Something went wrong. Please retry.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Forgot PIN: Send OTP ───────────────────────────────────────────────
    const initRecaptcha = async () => {
        const { auth, RecaptchaVerifier } = await initFirebase();
        if (!recaptchaRef.current) return null;
        const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, { size: "invisible" });
        await verifier.render();
        return verifier;
    };

    const handleSendForgotOtp = async () => {
        setIsLoading(true);
        setError("");
        try {
            const { auth, signInWithPhoneNumber } = await initFirebase();
            const verifier = await initRecaptcha();
            if (!verifier) throw new Error("Recaptcha not ready");
            const result = await signInWithPhoneNumber(auth, `+91${digits}`, verifier);
            setConfirmationResult(result);
            setCountdown(60);
            setStep("forgot-otp");
        } catch (err: any) {
            setError(err.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Forgot PIN: Verify OTP ─────────────────────────────────────────────
    const handleOtpChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };

    const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) { setError("Enter the full 6-digit OTP"); return; }
        setIsLoading(true);
        setError("");
        try {
            const userCred = await confirmationResult.confirm(code);
            const token = await userCred.user.getIdToken();
            setFirebaseTokenForReset(token);
            setStep("forgot-newpin");
        } catch {
            setError("Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Forgot PIN: Set new PIN ────────────────────────────────────────────
    const handleSetNewPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length < 4) { setError("PIN must be at least 4 digits"); return; }
        if (newPin !== confirmPin) { setError("PINs do not match"); return; }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/pin-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firebaseToken: firebaseTokenForReset,
                    phone: `+91${digits}`,
                    newPin,
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to reset PIN");
            }
            // Auto-sign in with new PIN
            const result = await signIn("credentials", {
                redirect: false,
                phone: `+91${digits}`,
                pin: newPin,
            });
            if (result?.error) throw new Error("Login failed after reset");
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 800);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetToPhone = () => {
        setStep("phone");
        setPin("");
        setOtp(["", "", "", "", "", ""]);
        setNewPin("");
        setConfirmPin("");
        setError("");
    };

    const cardStyle = {
        background: "rgba(12, 12, 16, 0.97)",
        border: "1px solid rgba(0, 245, 255, 0.14)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 24px 80px rgba(0,245,255,0.1), 0 8px 32px rgba(0,0,0,0.5)",
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-4 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px]" />
            </div>

            {/* Recaptcha container */}
            <div ref={recaptchaRef} id="recaptcha-container" />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col items-center gap-2"
            >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.2)" }}>
                    <ShieldCheck className="w-7 h-7" style={{ color: "#00F5FF" }} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Agents OPS</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Secure team task management</p>
                </div>
            </motion.div>

            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">

                    {/* ── STEP: PHONE ─────────────────────────────────── */}
                    {step === "phone" && (
                        <motion.div key="phone" variants={containerVariants} initial="hidden" animate="visible"
                            className="relative rounded-2xl p-8" style={cardStyle}>
                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />

                            <motion.div variants={itemVariants} className="mb-6">
                                <h2 className="text-lg font-bold text-white">Sign In</h2>
                                <p className="text-sm text-zinc-500 mt-0.5">Enter your registered phone number</p>
                            </motion.div>

                            <form onSubmit={handleCheckPhone} className="space-y-4">
                                <motion.div variants={itemVariants}>
                                    <label className="field-label"><Phone className="w-3 h-3" />Phone Number</label>
                                    <div className="flex items-center rounded-xl overflow-hidden transition-all"
                                        style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}>
                                        <span className="pl-4 pr-2 text-zinc-300 font-semibold text-sm whitespace-nowrap select-none">🇮🇳 +91</span>
                                        <div className="w-px h-5 bg-zinc-700 mx-1" />
                                        <input type="tel" inputMode="numeric" placeholder="XXXXX XXXXX"
                                            value={formatPhoneDigits(digits)}
                                            onChange={handleDigitInput}
                                            className="flex-1 bg-transparent py-3.5 pr-4 text-zinc-100 placeholder:text-zinc-600 outline-none text-sm tracking-wider border-none"
                                            style={{ background: "transparent", border: "none", boxShadow: "none" }}
                                            autoFocus />
                                    </div>
                                    <p className="text-[11px] mt-1.5 ml-1" style={{ color: "var(--text-muted)" }}>
                                        Indian number only · 10 digits
                                    </p>
                                </motion.div>

                                {error && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button variants={itemVariants} type="submit"
                                    disabled={isLoading || !isValidPhone}
                                    className="btn-primary w-full" style={{ height: 48 }}
                                    whileHover={{ scale: isLoading || !isValidPhone ? 1 : 1.01 }}
                                    whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 rotate-180" />}
                                    {isLoading ? "Checking..." : "Continue"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP: PIN ───────────────────────────────────── */}
                    {step === "pin" && (
                        <motion.div key="pin" variants={containerVariants} initial="hidden" animate="visible"
                            className="relative rounded-2xl p-8" style={cardStyle}>
                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />

                            <motion.div variants={itemVariants} className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.2)" }}>
                                        <Lock className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Enter PIN</h2>
                                </div>
                                <p className="text-sm text-zinc-500">
                                    <span className="font-semibold" style={{ color: "#00F5FF" }}>+91 {formatPhoneDigits(digits)}</span>
                                </p>
                            </motion.div>

                            <form onSubmit={handlePinLogin} className="space-y-4">
                                <motion.div variants={itemVariants}>
                                    <label className="field-label"><KeyRound className="w-3 h-3" />PIN</label>
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
                                        <button type="button" onClick={() => setShowPin(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                            style={{ color: "var(--text-muted)" }}>
                                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </motion.div>

                                {error && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button variants={itemVariants} type="submit"
                                    disabled={isLoading || pin.length < 4}
                                    className="btn-primary w-full" style={{ height: 48 }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    {isLoading ? "Signing In..." : "Sign In"}
                                </motion.button>

                                <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                                    <button type="button" onClick={resetToPhone}
                                        className="btn-ghost flex items-center gap-1.5 text-sm px-3" style={{ height: 32 }}>
                                        <ArrowLeft className="w-3.5 h-3.5" />Change number
                                    </button>
                                    <button type="button" onClick={() => { setStep("forgot-otp"); handleSendForgotOtp(); }}
                                        className="text-sm font-medium transition-colors"
                                        style={{ color: "#00F5FF" }}>
                                        Forgot PIN?
                                    </button>
                                </motion.div>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP: FORGOT — SEND OTP ─────────────────────── */}
                    {step === "forgot-otp" && (
                        <motion.div key="forgot-otp" variants={containerVariants} initial="hidden" animate="visible"
                            className="relative rounded-2xl p-8" style={cardStyle}>
                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />

                            <motion.div variants={itemVariants} className="mb-6">
                                <h2 className="text-lg font-bold text-white">Verify Identity</h2>
                                <p className="text-sm text-zinc-500 mt-0.5">Enter the OTP sent to <span style={{ color: "#00F5FF" }}>+91 {formatPhoneDigits(digits)}</span></p>
                            </motion.div>

                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <motion.div variants={itemVariants}>
                                    <label className="field-label"><KeyRound className="w-3 h-3" />6-digit OTP</label>
                                    <div className="flex gap-2 justify-between">
                                        {otp.map((digit, i) => (
                                            <motion.input key={i}
                                                ref={el => { otpRefs.current[i] = el; }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                                type="text" inputMode="numeric" maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className="w-11 h-13 text-center text-xl font-bold rounded-xl outline-none transition-all caret-transparent"
                                                style={{
                                                    background: "var(--bg-elevated)",
                                                    border: `1.5px solid ${digit ? "rgba(0,245,255,0.4)" : "var(--border-default)"}`,
                                                    color: "var(--text-primary)",
                                                    boxShadow: digit ? "0 0 0 3px rgba(0,245,255,0.1)" : "none",
                                                    height: 52,
                                                }}
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                                <motion.button variants={itemVariants} type="submit"
                                    disabled={isLoading || otp.join("").length < 6}
                                    className="btn-primary w-full" style={{ height: 48 }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isLoading ? "Verifying..." : "Verify OTP"}
                                </motion.button>

                                <div className="flex items-center justify-between pt-1">
                                    <button type="button" onClick={() => setStep("pin")}
                                        className="btn-ghost flex items-center gap-1.5 text-sm px-3" style={{ height: 32 }}>
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                                    </button>
                                    <button type="button" disabled={countdown > 0} onClick={handleSendForgotOtp}
                                        className="flex items-center gap-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
                                        style={{ color: countdown > 0 ? "var(--text-muted)" : "#00F5FF" }}>
                                        {countdown > 0 ? `Resend in ${countdown}s` : <><RotateCcw className="w-3.5 h-3.5" />Resend</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP: SET NEW PIN ───────────────────────────── */}
                    {step === "forgot-newpin" && (
                        <motion.div key="forgot-newpin" variants={containerVariants} initial="hidden" animate="visible"
                            className="relative rounded-2xl p-8" style={cardStyle}>
                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />

                            <motion.div variants={itemVariants} className="mb-6">
                                <h2 className="text-lg font-bold text-white">Set New PIN</h2>
                                <p className="text-sm text-zinc-500 mt-0.5">Choose a secure PIN (minimum 4 digits)</p>
                            </motion.div>

                            <form onSubmit={handleSetNewPin} className="space-y-4">
                                <motion.div variants={itemVariants}>
                                    <label className="field-label"><Lock className="w-3 h-3" />New PIN</label>
                                    <div className="relative">
                                        <input type={showNewPin ? "text" : "password"} inputMode="numeric"
                                            placeholder="Min. 4 digits" value={newPin}
                                            onChange={e => { setNewPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                                            className="field-input w-full pr-12" maxLength={8} autoFocus />
                                        <button type="button" onClick={() => setShowNewPin(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                            style={{ color: "var(--text-muted)" }}>
                                            {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="field-label"><ShieldCheck className="w-3 h-3" />Confirm PIN</label>
                                    <input type="password" inputMode="numeric"
                                        placeholder="Re-enter PIN" value={confirmPin}
                                        onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                                        className="field-input w-full" maxLength={8} />
                                </motion.div>

                                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                                <motion.button variants={itemVariants} type="submit"
                                    disabled={isLoading || newPin.length < 4 || newPin !== confirmPin}
                                    className="btn-primary w-full" style={{ height: 48 }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    {isLoading ? "Saving PIN..." : "Save & Sign In"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── SUCCESS ─────────────────────────────────────── */}
                    {success && (
                        <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-4 py-12">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(0,245,255,0.1)", border: "2px solid rgba(0,245,255,0.4)" }}>
                                <CheckCircle2 className="w-8 h-8" style={{ color: "#00F5FF" }} />
                            </div>
                            <p className="text-white font-bold text-lg">Signed in!</p>
                            <p className="text-zinc-500 text-sm">Redirecting to dashboard…</p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
