"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const toastStyles = {
    success: {
        bg: "rgba(0, 245, 255, 0.08)",
        border: "rgba(0, 245, 255, 0.2)",
        text: "#00F5FF",
        icon: CheckCircle2,
    },
    error: {
        bg: "rgba(255, 77, 106, 0.08)",
        border: "rgba(255, 77, 106, 0.2)",
        text: "#FF4D6A",
        icon: AlertCircle,
    },
    info: {
        bg: "rgba(167, 139, 250, 0.08)",
        border: "rgba(167, 139, 250, 0.2)",
        text: "#A78BFA",
        icon: Info,
    },
};

export default function Toast({ message, type, onClose }: ToastProps) {
    const style = toastStyles[type];
    const Icon = style.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md"
            style={{
                background: "rgba(10, 10, 14, 0.95)",
                border: `1px solid ${style.border}`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2), 0 0 20px ${style.bg}`,
            }}
        >
            <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: style.bg }}
            >
                <Icon className="h-4 w-4" style={{ color: style.text }} />
            </div>

            <p className="text-sm font-medium tracking-wide text-zinc-100 min-w-[140px]">
                {message.toUpperCase()}
            </p>

            <button
                onClick={onClose}
                className="ml-2 p-1 rounded-md opacity-40 hover:opacity-100 hover:bg-white/5 transition-all"
            >
                <X className="h-3.5 w-3.5 text-white" />
            </button>

            {/* Progress Bar Animation */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[2px] opacity-40"
                style={{ background: style.text }}
            />
        </motion.div>
    );
}
