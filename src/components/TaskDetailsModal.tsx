"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Pencil, Calendar, User, Building2, Tag,
    AlignLeft, Hash, CheckCircle2, Clock, Zap, Circle, Eye as EyeIcon,
    Loader2, Rocket,
} from "lucide-react";

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
    HIGH: { label: "High", color: "#FF4D6A", bg: "rgba(255,77,106,0.1)" },
    MEDIUM: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    LOW: { label: "Low", color: "#00F5FF", bg: "rgba(0,245,255,0.08)" },
};

const STATUS_FLOW: Record<string, { label: string; next: string | null }> = {
    TODO: { label: "Move to In Progress", next: "IN_PROGRESS" },
    IN_PROGRESS: { label: "Move to Review", next: "REVIEW" },
    REVIEW: { label: "Move to Done", next: "DONE" },
    DONE: { label: "Task Completed", next: null },
};

const STATUS_CONFIG: Record<string, { label: string; Icon: any; color: string }> = {
    TODO: { label: "To Do", Icon: Circle, color: "rgba(113,113,122,0.8)" },
    IN_PROGRESS: { label: "In Progress", Icon: Clock, color: "#F59E0B" },
    REVIEW: { label: "Review", Icon: EyeIcon, color: "#A78BFA" },
    DONE: { label: "Done", Icon: CheckCircle2, color: "#00F5FF" },
};

const COMPANY_LABELS: Record<string, string> = {
    "KNIGHT_WOLF": "Knight Wolf",
    "COMMERCE_AGENT": "Commerce Agent",
    "BOTH": "Both Companies",
    // Migration fallbacks
    "Knight Wolf": "Knight Wolf",
    "Commerce Agent": "Commerce Agent",
    "Both": "Both Companies",
};

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color: "rgba(0,245,255,0.45)" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "rgba(0,245,255,0.4)" }}>
                    {label}
                </span>
            </div>
            <div>{children}</div>
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl"
                        style={{
                            background: "rgba(10, 10, 14, 0.98)",
                            border: "1px solid rgba(0, 245, 255, 0.14)",
                            boxShadow:
                                "0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,245,255,0.1), 0 8px 32px rgba(0,0,0,0.7)",
                            maxHeight: "90vh",
                        }}
                    >
                        {/* Top accent line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-60" />

                        {/* Ambient glow */}
                        <div className="pointer-events-none absolute right-0 top-0 -mr-24 -mt-24 h-48 w-48 rounded-full bg-[#00F5FF]/[0.05] blur-3xl" />

                        {/* Scrollable content */}
                        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(90vh - 2px)" }}>
                            <div className="p-6">

                                {/* ── Header ─────────────────────────────── */}
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Task ID */}
                                        {task.displayId && (
                                            <div className="mb-1.5 flex items-center gap-1.5">
                                                <Hash className="w-3 h-3" style={{ color: "rgba(0,245,255,0.35)" }} />
                                                <span className="font-mono text-[11px] font-bold uppercase tracking-widest"
                                                    style={{ color: "rgba(0,245,255,0.4)" }}>
                                                    {task.displayId}
                                                </span>
                                            </div>
                                        )}
                                        <h2 className="text-xl font-bold leading-tight text-white">{task.title}</h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="btn-surface flex-shrink-0"
                                        style={{ height: 36, width: 36, padding: 0 }}
                                    >
                                        <X className="h-4 w-4" />
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
                                            {priority.label} Priority
                                        </div>
                                    )}
                                </div>

                                {/* ── Detail fields grid ────────────────── */}
                                <div
                                    className="mb-4 grid grid-cols-2 gap-4 rounded-xl p-4"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                    }}
                                >
                                    {/* Assigned To */}
                                    <Field icon={User} label="Assigned To">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-bold"
                                                style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF" }}
                                            >
                                                {task.assignee?.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <span className="text-sm font-semibold text-zinc-200">
                                                {task.assignee?.name ?? "Open Pool"}
                                            </span>
                                        </div>
                                    </Field>

                                    {/* Due Date */}
                                    <Field icon={Calendar} label="Due Date">
                                        {dueDateStr ? (
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: isOverdue ? "#FF4D6A" : "var(--text-secondary)" }}
                                            >
                                                {dueDateStr}
                                                {isOverdue && (
                                                    <span className="ml-1.5 text-[10px] font-bold text-red-400">Overdue</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-zinc-600">No due date</span>
                                        )}
                                    </Field>

                                    {/* Company Focus */}
                                    <Field icon={Building2} label="Company Focus">
                                        <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                                            {task.companyType ? COMPANY_LABELS[task.companyType] ?? task.companyType : "—"}
                                        </span>
                                    </Field>

                                    {/* Priority (text fallback) */}
                                    <Field icon={Tag} label="Priority">
                                        <span
                                            className="text-sm font-semibold"
                                            style={{ color: priority ? priority.color : "var(--text-muted)" }}
                                        >
                                            {priority?.label ?? "Not set"}
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
                                                {task.description}
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
                                        <div className="mb-4 pt-1">
                                            <motion.button
                                                onClick={handleStatusAction}
                                                disabled={isUpdating || !onStatusUpdate}
                                                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all btn-primary shadow-[0_0_30px_rgba(0,245,255,0.2)] ${isUpdating ? "opacity-80" : ""
                                                    }`}
                                                whileHover={!isUpdating ? { scale: 1.02, translateY: -2 } : {}}
                                                whileTap={!isUpdating ? { scale: 0.98 } : {}}
                                            >
                                                {isUpdating ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Rocket className="w-5 h-5" />
                                                )}
                                                {isUpdating ? "Updating Status..." : flow.label}
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
                                            className="btn-primary w-full text-sm font-bold"
                                            style={{ height: 44 }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit Task
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
