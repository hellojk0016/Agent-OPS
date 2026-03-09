"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, KeyRound, Loader2, ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

type Step = "request" | "verify" | "reset" | "success";

const spring = { type: "spring", stiffness: 340, damping: 28 };

function ForgotPinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get("phone") || "";

    const [step, setStep] = useState<Step>("request");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [otp, setOtp] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [firebaseToken, setFirebaseToken] = useState<string>("");

    useEffect(() => {
        // Initialize reCAPTCHA
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => {
                    // reCAPTCHA solved
                },
            });
        }
    }, []);

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const phoneNumber = phoneParam.startsWith("+") ? phoneParam : `+91${phoneParam.slice(-10)}`;
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep("verify");
        } catch (err: any) {
            console.error("OTP send error:", err);
            setError(err.message || "Failed to send OTP. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (!confirmationResult) throw new Error("No OTP request found.");
            const result = await confirmationResult.confirm(otp);
            const token = await result.user.getIdToken();
            setFirebaseToken(token);
            setStep("reset");
        } catch (err: any) {
            console.error("OTP verify error:", err);
            setError("Invalid OTP. Please check the code and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPin !== confirmPin) {
            return setError("PINs do not match");
        }
        if (newPin.length < 4) {
            return setError("PIN must be at least 4 digits");
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/pin-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firebaseToken,
                    phone: phoneParam,
                    newPin
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset PIN");

            setStep("success");
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            console.error("PIN reset error:", err);
            setError(err.message || "Failed to save new PIN");
        } finally {
            setIsLoading(false);
        }
    };

    const card = {
        background: "rgba(10, 10, 14, 0.97)",
        border: "1px solid rgba(0, 245, 255, 0.13)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 24px 80px rgba(0,245,255,0.09), 0 8px 32px rgba(0,0,0,0.5)",
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

            <div id="recaptcha-container"></div>

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
                    <ShieldAlert className="h-7 w-7" style={{ color: "#00F5FF" }} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Reset Admin PIN</h1>
                    <p className="mt-0.5 text-xs text-zinc-500">Secure recovery via OTP</p>
                </div>
            </motion.div>

            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                    {/* ── STEP : REQUEST OTP ──────────────────────────────── */}
                    {step === "request" && (
                        <motion.div
                            key="request"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6 text-center">
                                <p className="text-sm text-zinc-400">
                                    We will send an SMS with a verification code to
                                </p>
                                <p className="mt-1 text-lg font-bold text-white tracking-widest">
                                    {phoneParam}
                                </p>
                            </div>

                            {error && (
                                <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSendOtp}
                                disabled={isLoading}
                                className="btn-primary w-full shadow-[0_0_20px_rgba(0,245,255,0.2)]"
                                style={{ height: 48 }}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                                {isLoading ? "Sending…" : "Send OTP"}
                            </button>

                            <button
                                onClick={() => router.push("/login")}
                                className="btn-ghost mt-4 w-full"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP : VERIFY OTP ───────────────────────────────── */}
                    {step === "verify" && (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-white">Verify OTP</h2>
                                <p className="text-sm text-zinc-500">Sent to {phoneParam}</p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <label className="field-label">OTP Code</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter the 6-digit code"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                        maxLength={6}
                                        className="field-input w-full text-center text-lg tracking-widest"
                                        autoFocus
                                    />
                                </div>

                                {error && <p className="text-sm text-red-400">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="btn-primary w-full"
                                    style={{ height: 48 }}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP : RESET PIN ────────────────────────────────── */}
                    {step === "reset" && (
                        <motion.div
                            key="reset"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={spring}
                            className="relative rounded-2xl p-8"
                            style={card}
                        >
                            {accentLine}
                            <div className="mb-6">
                                <div className="mb-1 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(0,245,255,0.09)", border: "1px solid rgba(0,245,255,0.18)" }}>
                                        <KeyRound className="h-4 w-4" style={{ color: "#00F5FF" }} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Create New PIN</h2>
                                </div>
                            </div>

                            <form onSubmit={handleResetPin} className="space-y-4">
                                <div>
                                    <label className="field-label">New PIN (Min 4 digits)</label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="••••"
                                        value={newPin}
                                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
                                        className="field-input w-full text-center tracking-widest text-lg"
                                        maxLength={8}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Confirm New PIN</label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="••••"
                                        value={confirmPin}
                                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                                        className="field-input w-full text-center tracking-widest text-lg"
                                        maxLength={8}
                                    />
                                </div>

                                {error && <p className="text-sm text-red-400">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading || newPin.length < 4 || confirmPin.length < 4}
                                    className="btn-primary w-full"
                                    style={{ height: 48 }}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New PIN"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP : SUCCESS ──────────────────────────────────── */}
                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-4 py-12"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(0,245,255,0.1)", border: "2px solid rgba(0,245,255,0.4)" }}>
                                <CheckCircle2 className="h-8 w-8" style={{ color: "#00F5FF" }} />
                            </div>
                            <p className="text-lg font-bold text-white">PIN Reset Successfully!</p>
                            <p className="text-sm text-zinc-500">Redirecting to login…</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ForgotPinPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
            <ForgotPinContent />
        </Suspense>
    );
}
