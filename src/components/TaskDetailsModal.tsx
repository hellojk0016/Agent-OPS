"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Pencil, Calendar, User, Building2, Tag,
    AlignLeft, Hash, CheckCircle2, Clock, Zap, Circle, Eye as EyeIcon,
    Loader2, Rocket,
} from "lucide-react";
import Portal from "./Portal";

interface Task {
    id: string;
    displayId?: string | null;
    title: string;
    description: string | null;
    status: string;
    assigneeId: string | null;
    priority?: string | null;
    dueDate?: Date | string | null;
    companyType?: string | null;
    createdAt: Date;
    assignee: { name: string | null } | null;
}

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    userRole: string;
    onClose: () => void;
    onEdit: () => void;
    onStatusUpdate?: (newStatus: string) => Promise<void>;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    HIGH: { label: "HIGH", color: "#FF4D6A", bg: "rgba(255,77,106,0.1)" },
    MEDIUM: { label: "MEDIUM", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    LOW: { label: "LOW", color: "#00F5FF", bg: "rgba(0,245,255,0.08)" },
};

const STATUS_FLOW: Record<string, { label: string; next: string | null }> = {
    TODO: { label: "MOVE TO IN PROGRESS", next: "IN_PROGRESS" },
    IN_PROGRESS: { label: "MOVE TO REVIEW", next: "REVIEW" },
    REVIEW: { label: "MOVE TO DONE", next: "DONE" },
    DONE: { label: "TASK COMPLETED", next: null },
};

const STATUS_CONFIG: Record<string, { label: string; Icon: any; color: string }> = {
    TODO: { label: "TO DO", Icon: Circle, color: "rgba(113,113,122,0.8)" },
    IN_PROGRESS: { label: "IN PROGRESS", Icon: Clock, color: "#F59E0B" },
    REVIEW: { label: "REVIEW", Icon: EyeIcon, color: "#A78BFA" },
    DONE: { label: "DONE", Icon: CheckCircle2, color: "#00F5FF" },
};

const COMPANY_LABELS: Record<string, string> = {
    "KNIGHT_WOLF": "KNIGHT WOLF",
    "COMMERCE_AGENT": "COMMERCE AGENT",
    "BOTH": "BOTH COMPANIES",
    // Migration fallbacks
    "Knight Wolf": "KNIGHT WOLF",
    "Commerce Agent": "COMMERCE AGENT",
    "Both": "BOTH COMPANIES",
};

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-[#00F5FF]/10 border border-[#00F5FF]/20">
                    <Icon className="w-3 h-3 text-[#00F5FF]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F5FF]">
                    {label}
                </span>
            </div>
            <div className="pl-7">{children}</div>
        </div>
    );
}

export default function TaskDetailsModal({
    isOpen, task, userRole, onClose, onEdit, onStatusUpdate,
}: TaskDetailsModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!task) return null;
    const isAdmin = userRole === "ADMIN";
    const isDone = task.status === "DONE";

    const priority = task.priority ? PRIORITY_CONFIG[task.priority] ?? null : null;
    const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
    const StatusIcon = statusCfg.Icon;

    const handleStatusAction = async () => {
        const flow = STATUS_FLOW[task.status] || STATUS_FLOW.TODO;
        if (!flow.next || !onStatusUpdate || isUpdating) return;

        setIsUpdating(true);
        try {
            await onStatusUpdate(flow.next);
        } finally {
            setIsUpdating(false);
        }
    };

    const dueDateStr = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        })
        : null;

    const isOverdue = task.dueDate
        ? new Date(task.dueDate) < new Date() && task.status !== "DONE"
        : false;

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950 md:bg-black/40 md:p-4 touch-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 20 }}
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                        className="relative w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-xl overflow-hidden rounded-none md:rounded-3xl flex flex-col"
                        style={{
                            background: "rgba(10, 10, 14, 0.98)",
                            border: "none",
                            boxShadow: "none",
                        }}
                    >
                        {/* Desktop Only Borders and Shadows */}
                        <div className="hidden md:block absolute inset-0 pointer-events-none rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,245,255,0.1)]" />
                        {/* Top accent line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-60" />

                        {/* Ambient glow */}
                        <div className="pointer-events-none absolute right-0 top-0 -mr-24 -mt-24 h-48 w-48 rounded-full bg-[#00F5FF]/[0.05] blur-3xl" />

                        {/* Scrollable content */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <div className="p-6 md:p-8">

                                {/* ── Header ─────────────────────────────── */}
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Task ID */}
                                        {task.displayId && (
                                            <div className="mb-2 flex items-center gap-1.5">
                                                <Hash className="w-3.5 h-3.5 text-[#00F5FF]/60" />
                                                <span className="font-mono text-[12px] font-black uppercase tracking-[0.25em] text-[#00F5FF]">
                                                    {task.displayId}
                                                </span>
                                            </div>
                                        )}
                                        <h2 className="text-2xl font-black leading-tight text-white tracking-tight uppercase">{task.title}</h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="btn-surface flex-shrink-0"
                                        style={{ height: 36, width: 36, padding: 0 }}
                                    >
                                        <X className="h-4 w-4" style={{ color: "#00F5FF" }} />
                                    </button>
                                </div>

                                {/* ── Status + Priority pills (top row) ─── */}
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    {/* Status */}
                                    <div
                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: `1px solid ${statusCfg.color}30`,
                                            color: statusCfg.color,
                                        }}
                                    >
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusCfg.label}
                                    </div>

                                    {/* Priority */}
                                    {priority && (
                                        <div
                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
                                            style={{
                                                background: priority.bg,
                                                border: `1px solid ${priority.color}30`,
                                                color: priority.color,
                                            }}
                                        >
                                            <Zap className="w-3 h-3" />
                                            {priority.label} PRIORITY
                                        </div>
                                    )}
                                </div>

                                {/* ── Detail fields grid ────────────────── */}
                                <div
                                    className="mb-6 grid grid-cols-2 gap-y-8 gap-x-4 rounded-3xl p-6 border border-white/5 bg-zinc-900/40"
                                >
                                    {/* Assigned To */}
                                    <Field icon={User} label="Assigned To">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-black bg-[#00F5FF]/20 border border-[#00F5FF]/30 text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.1)]"
                                            >
                                                {task.assignee?.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <span className="text-[15px] font-bold text-white tracking-tight">
                                                {task.assignee?.name ?? "OPEN POOL"}
                                            </span>
                                        </div>
                                    </Field>

                                    {/* Due Date */}
                                    <Field icon={Calendar} label="Due Date">
                                        {dueDateStr ? (
                                            <span
                                                className="text-[15px] font-bold tracking-tight text-white"
                                                style={{ color: isOverdue ? "#FF4D6A" : undefined }}
                                            >
                                                {dueDateStr}
                                            </span>
                                        ) : (
                                            <span className="text-[15px] font-bold text-zinc-500 uppercase">No due date</span>
                                        )}
                                    </Field>

                                    {/* Company Focus */}
                                    <Field icon={Building2} label="Company Focus">
                                        <span className="text-[15px] font-bold tracking-tight text-white">
                                            {task.companyType ? COMPANY_LABELS[task.companyType] ?? task.companyType : "—"}
                                        </span>
                                    </Field>

                                    {/* Priority */}
                                    <Field icon={Tag} label="Priority">
                                        <span
                                            className="text-[15px] font-bold tracking-tight uppercase"
                                            style={{ color: priority ? priority.color : "var(--text-muted)" }}
                                        >
                                            {priority?.label ?? "NOT SET"}
                                        </span>
                                    </Field>
                                </div>

                                {/* ── Description ──────────────────────── */}
                                {task.description && (
                                    <div className="mb-4">
                                        <Field icon={AlignLeft} label="Description">
                                            <p
                                                className="mt-1.5 rounded-xl p-4 text-sm leading-relaxed"
                                                style={{
                                                    color: "var(--text-secondary)",
                                                    background: "rgba(255,255,255,0.02)",
                                                    border: "1px solid rgba(255,255,255,0.05)",
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {task.description.toUpperCase()}
                                            </p>
                                        </Field>
                                    </div>
                                )}

                                {/* ── Status Action Button ───────────────── */}
                                {(() => {
                                    const flow = STATUS_FLOW[task.status] || STATUS_FLOW.TODO;
                                    const isReview = task.status === "REVIEW";
                                    const canComplete = isAdmin || !isReview;
                                    const shouldShow = !isDone && canComplete;

                                    if (!shouldShow) return null;

                                    return (
                                        <div className="mb-6 pt-2">
                                            <motion.button
                                                onClick={handleStatusAction}
                                                disabled={isUpdating || !onStatusUpdate}
                                                className={`w-full h-16 rounded-2xl font-black text-lg uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all bg-[#00F5FF] text-zinc-950 shadow-[0_10px_40px_rgba(0,245,255,0.3)] ${isUpdating ? "opacity-80" : ""
                                                    }`}
                                                whileHover={!isUpdating ? { scale: 1.02, translateY: -2 } : {}}
                                                whileTap={!isUpdating ? { scale: 0.98 } : {}}
                                            >
                                                {isUpdating ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <Rocket className="w-6 h-6" />
                                                )}
                                                {isUpdating ? "Updating..." : flow.label}
                                            </motion.button>
                                        </div>
                                    );
                                })()}

                                {/* ── Footer buttons ────────────────────── */}
                                {isAdmin && (
                                    <div className="pt-4"
                                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                        <motion.button
                                            onClick={() => { onClose(); onEdit(); }}
                                            className="btn-primary w-full text-base font-bold shadow-[0_0_20px_rgba(0,245,255,0.15)]"
                                            style={{ height: 52 }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            EDIT TASK
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </Portal>
);
}
