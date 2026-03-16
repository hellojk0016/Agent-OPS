"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Portal from "./Portal";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item?",
    isDeleting = false,
}: DeleteConfirmModalProps) {
    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center md:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={!isDeleting ? onClose : undefined}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal */}
                        <motion.div
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="relative w-full md:max-w-sm rounded-none md:rounded-2xl h-full md:h-auto flex flex-col items-center justify-center"
                            style={{
                                background: "rgba(10, 10, 14, 0.98)",
                                border: "1px solid rgba(255, 77, 106, 0.2)",
                                boxShadow: "0 20px 50px rgba(255, 77, 106, 0.15), 0 0 0 1px rgba(0,0,0,0.5)",
                            }}
                        >
                            {/* Critical Accent Line (Danger Red) */}
                            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF4D6A] to-transparent opacity-60" />

                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center w-full">
                                {/* Warning Icon (Red) */}
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{ background: "rgba(255, 77, 106, 0.1)", border: "1px solid rgba(255, 77, 106, 0.2)" }}>
                                    <AlertTriangle className="h-6 w-6 text-[#FF4D6A]" />
                                </div>

                                <h3 className="mb-2 text-lg font-bold text-white tracking-tight">
                                    {title}
                                </h3>
                                <p className="mb-10 text-base leading-relaxed text-zinc-400 max-w-[280px]">
                                    {message}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="btn-surface flex-1 text-base font-bold opacity-70 hover:opacity-100 transition-opacity rounded-2xl"
                                        style={{ height: 56, background: "rgba(255,255,255,0.03)" }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        onClick={onConfirm}
                                        disabled={isDeleting}
                                        className="flex-1 text-base font-black uppercase tracking-widest text-white rounded-2xl transition-all shadow-[0_4px_20px_rgba(255,77,106,0.3)]"
                                        style={{
                                            height: 56,
                                            background: "#FF4D6A",
                                        }}
                                        whileHover={{ scale: 1.02, background: "#FF3555" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                                <span>Deleting...</span>
                                            </div>
                                        ) : "Delete"}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Close Icon (Top Right) */}
                            {!isDeleting && (
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 p-1 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" style={{ color: "#00F5FF" }} />
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
