"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
}: LogoutConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/5 shadow-2xl"
                        style={{
                            background: "rgba(10, 10, 14, 0.98)",
                        }}
                    >
                        {/* Glow Accent Line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF4D6A] to-transparent opacity-40" />

                        <div className="p-8 text-center relative">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FF4D6A]/10 blur-3xl rounded-full pointer-events-none" />

                            {/* Icon Wrapper */}
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4D6A]/5 border border-[#FF4D6A]/20 shadow-[0_0_20px_rgba(255,77,106,0.1)]">
                                <LogOut className="h-6 w-6 text-[#FF4D6A]" />
                            </div>

                            <h3 className="mb-3 text-xl font-bold text-white tracking-tight">
                                Confirm Sign Out
                            </h3>
                            <p className="mb-8 text-sm leading-relaxed text-zinc-400 font-medium italic">
                                Are you sure you want to sign out?
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={onConfirm}
                                    className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-[0.15em] text-white bg-gradient-to-br from-[#FF4D6A] to-[#E63956] shadow-[0_0_25px_rgba(255,77,106,0.25)] border border-[#FF4D6A]/20"
                                    whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Sign Out
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
