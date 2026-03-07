"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Phone, Loader2, ArrowLeft, KeyRound, CheckCircle2, SendHorizonal, ShieldCheck, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import Image from "next/image";

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

// Format 10 digits as XXXXX XXXXX
function formatPhoneDigits(digits: string) {
    const d = digits.slice(0, 10);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + " " + d.slice(5);
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};


export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"phone" | "otp">("phone");

    // Phone input state — store raw digits only (no +91)
    const [digits, setDigits] = useState("");
    const isValidPhone = digits.length === 10;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [success, setSuccess] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const fullPhone = `+91${digits}`;

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
        }
    };

    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isValidPhone) return;
        setError("");
        setIsLoading(true);
        try {
            setupRecaptcha();
            const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier!);
            window.confirmationResult = result;
            setStep("otp");
            setCountdown(60);
        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please try again.");
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fireConfetti = () => {
        const end = Date.now() + 2000;
        const colors = ["#00F5FF", "#70FFFF", "#E0FFFF", "#ffffff", "#09090b"];
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            setError("Please enter the complete 6-digit code.");
            setIsLoading(false);
            return;
        }
        try {
            const cResult = window.confirmationResult;
            if (!cResult) throw new Error("Session expired. Please resend OTP.");
            const credential = await cResult.confirm(otpCode);
            const idToken = await credential.user.getIdToken();
            const res = await signIn("credentials", {
                redirect: false,
                firebaseToken: idToken,
                phone: credential.user.phoneNumber,
            });
            if (res?.error) {
                setError("Phone number not registered in the system. Contact your admin.");
            } else {
                // 🎉 Success — fire confetti then redirect
                setSuccess(true);
                fireConfetti();
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 2200);
            }
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const n = [...otp];
        n[index] = value;
        setOtp(n);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    const handleDigitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip display formatting, keep only raw digits
        const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
        setDigits(raw);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 selection:bg-neon-blue/30">
            <div id="recaptcha-container" />

            <AnimatePresence mode="wait">
                {success ? (
                    /* ── Success State ── */
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                            className="w-20 h-20 rounded-full bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center"
                        >
                            <CheckCircle2 className="w-10 h-10 text-neon-blue" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <p className="text-2xl font-bold text-zinc-100">Welcome!</p>
                            <p className="text-sm text-zinc-400 mt-1">Redirecting to dashboard…</p>
                        </motion.div>
                    </motion.div>
                ) : (
                    /* ── Main Card ── */
                    <motion.div
                        key="card"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-md rounded-2xl p-8 space-y-7 hover-lift"
                        style={{
                            background: "rgba(12, 12, 16, 0.92)",
                            border: "1px solid rgba(0, 245, 255, 0.12)",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 24px 80px rgba(0, 245, 255, 0.1), 0 8px 32px rgba(0,0,0,0.5)",
                        }}
                    >
                        {/* Neon top line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-50" />
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00F5FF]/[0.05] blur-3xl pointer-events-none -mr-32 -mt-32" />
                        {/* Icon + Title */}
                        <motion.div variants={itemVariants} className="text-center space-y-2">
                            <div className="mx-auto mb-6">
                                <Image
                                    src="/images/ops-logo.png"
                                    alt="OPS Logo"
                                    width={80}
                                    height={80}
                                    className="mx-auto object-contain"
                                    priority
                                />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                                {step === "phone" ? "Welcome Back" : "Enter OTP"}
                            </h2>
                            <p className="text-sm text-zinc-400">
                                {step === "phone"
                                    ? "Enter your phone number to receive a one-time code"
                                    : `6-digit code sent to +91 ${formatPhoneDigits(digits)}`}
                            </p>
                        </motion.div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"
                                >
                                    <p className="text-sm text-red-400 text-center font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Step 1: Phone ── */}
                        <AnimatePresence mode="wait">
                            {step === "phone" && (
                                <motion.form
                                    key="phone-form"
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-6"
                                    onSubmit={handleSendOTP}
                                >
                                    <div className="space-y-2">
                                        <label className="field-label">
                                            <Phone className="w-3 h-3" />
                                            Phone Number
                                        </label>
                                        {/* Input with +91 prefix */}
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
                                                value={formatPhoneDigits(digits)}
                                                onChange={handleDigitInput}
                                                className="flex-1 bg-transparent py-3.5 pr-12 text-zinc-100 placeholder:text-zinc-600 outline-none text-sm tracking-wider border-none"
                                                style={{ background: "transparent", border: "none", boxShadow: "none" }}
                                                autoFocus
                                            />
                                            {/* Valid phone tick */}
                                            <AnimatePresence>
                                                {isValidPhone && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.4 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.4 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                        className="absolute right-3"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" style={{ color: "#00F5FF" }} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <p className="text-[11px] ml-1" style={{ color: "var(--text-muted)" }}>
                                            Indian number only • 10 digits
                                        </p>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !isValidPhone}
                                        className="btn-primary w-full"
                                        style={{ height: 52 }}
                                        whileHover={{ scale: (isLoading || !isValidPhone) ? 1 : 1.01 }}
                                        whileTap={{ scale: (isLoading || !isValidPhone) ? 1 : 0.98 }}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
                                        {isLoading ? "Sending OTP..." : "Send OTP via SMS"}
                                    </motion.button>
                                </motion.form>
                            )}

                            {/* ── Step 2: OTP ── */}
                            {step === "otp" && (
                                <motion.form
                                    key="otp-form"
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-6"
                                    onSubmit={handleVerifyOTP}
                                >
                                    <div className="space-y-4">
                                        <label className="field-label">
                                            <KeyRound className="w-3 h-3" />
                                            Verification Code
                                        </label>
                                        <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <motion.input
                                                    key={i}
                                                    ref={(el) => { otpRefs.current[i] = el; }}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06, duration: 0.3 }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all caret-transparent"
                                                    style={{
                                                        background: "var(--bg-elevated)",
                                                        border: `1.5px solid ${digit ? "rgba(0,245,255,0.4)" : "var(--border-default)"}`,
                                                        color: "var(--text-primary)",
                                                        boxShadow: digit ? "0 0 0 3px rgba(0,245,255,0.1)" : "none",
                                                    }}
                                                    autoFocus={i === 0}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || otp.join("").length < 6}
                                        className="btn-primary w-full"
                                        style={{ height: 52 }}
                                        whileHover={{ scale: (isLoading || otp.join("").length < 6) ? 1 : 1.01 }}
                                        whileTap={{ scale: (isLoading || otp.join("").length < 6) ? 1 : 0.98 }}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                                    </motion.button>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                                            className="btn-ghost flex items-center gap-1.5 text-sm px-3"
                                            style={{ height: 36 }}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Change number
                                        </button>
                                        <button
                                            type="button"
                                            disabled={countdown > 0}
                                            onClick={() => handleSendOTP()}
                                            className="flex items-center gap-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
                                            style={{ color: countdown > 0 ? "var(--text-muted)" : "#00F5FF" }}
                                        >
                                            {countdown > 0 ? `Resend in ${countdown}s` : (<><RotateCcw className="w-3.5 h-3.5" /> Resend OTP</>)}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
