'use client';

import { useState, useRef, useEffect } from 'react';
import {
    CheckCircle2, Circle, Clock, Loader2, User,
    ExternalLink, MoreVertical, Pencil, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditTaskModal from "./EditTaskModal";

interface Employee {
    id: string;
    name: string | null;
}

interface Task {
    id: string;
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

interface TaskCardProps {
    task: Task;
    isKanban?: boolean;
    userId: string;
    userRole: string;
    employees?: Employee[];
    onDeleted?: (id: string) => void;
    onUpdated?: (task: Task) => void;
}

export default function TaskCard({
    task,
    userId,
    userRole,
    isKanban,
    employees = [],
    onDeleted,
    onUpdated,
}: TaskCardProps) {
    const [status, setStatus] = useState(task.status);
    const [localTask, setLocalTask] = useState<Task>(task);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const canUpdate = userRole === 'ADMIN' || (userRole === 'MEMBER' && task.assigneeId === userId);
    const isAdmin = userRole === 'ADMIN';

    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const handleStatusUpdate = async () => {
        if (!canUpdate || isStatusLoading) return;
        const nextStatus = status === 'TODO' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        setIsStatusLoading(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: nextStatus }),
            });
            if (res.ok) setStatus(nextStatus);
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setIsStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setMenuOpen(false);
        if (!confirm(`Delete "${localTask.title}"? This cannot be undone.`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
            if (res.ok) {
                onDeleted?.(task.id);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaved = (updated: Task) => {
        setLocalTask(updated);
        onUpdated?.(updated);
    };

    const isDone = status === 'DONE';
    const isInProgress = status === 'IN_PROGRESS';

    return (
        <>
            <div
                className="group relative flex flex-col rounded-2xl transition-all duration-200"
                style={{
                    background: "var(--bg-elevated)",
                    border: `1px solid ${isDone ? "rgba(0, 245, 255, 0.07)" : "var(--border-muted)"}`,
                    padding: isKanban ? "14px 16px" : "20px 22px",
                    gap: isKanban ? 12 : 16,
                    opacity: isDone ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 245, 255, 0.2)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 245, 255, 0.06)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDone ? "rgba(0, 245, 255, 0.07)" : "var(--border-muted)";
                    e.currentTarget.style.boxShadow = "";
                }}
            >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Status toggle button */}
                        <AnimatePresence mode="wait">
                            <motion.button
                                key={status}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                onClick={handleStatusUpdate}
                                disabled={!canUpdate || isStatusLoading}
                                className="flex-shrink-0 mt-0.5 transition-all rounded-full"
                                style={{ cursor: canUpdate ? "pointer" : "default", opacity: !canUpdate ? 0.3 : 1 }}
                            >
                                {isStatusLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00F5FF" }} />
                                ) : isDone ? (
                                    <CheckCircle2 className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                ) : isInProgress ? (
                                    <Clock className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                ) : (
                                    <Circle className="w-4 h-4 text-zinc-600" />
                                )}
                            </motion.button>
                        </AnimatePresence>

                        {/* Title */}
                        <h3
                            className="font-semibold leading-snug flex-1 transition-all"
                            style={{
                                fontSize: isKanban ? "13px" : "15px",
                                color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                                textDecoration: isDone ? "line-through" : "none",
                            }}
                        >
                            {localTask.title}
                        </h3>
                    </div>

                    {/* Three-dot menu (Admin only) */}
                    {isAdmin && (
                        <div className="relative flex-shrink-0" ref={menuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                                className="btn-surface opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                style={{ height: 28, width: 28, padding: 0 }}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#00F5FF" }} />
                                    : <MoreVertical className="w-3.5 h-3.5" />
                                }
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="absolute right-0 top-full mt-1 z-50 min-w-[148px] rounded-xl overflow-hidden"
                                        style={{
                                            background: "rgba(16, 16, 20, 0.98)",
                                            border: "1px solid rgba(0, 245, 255, 0.15)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
                                        }}
                                    >
                                        {/* Edit */}
                                        <button
                                            onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-all"
                                            style={{ color: "var(--text-secondary)" }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(0,245,255,0.07)";
                                                e.currentTarget.style.color = "#00F5FF";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit Task
                                        </button>

                                        {/* Divider */}
                                        <div style={{ height: 1, background: "rgba(0,245,255,0.08)" }} />

                                        {/* Delete */}
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-all"
                                            style={{ color: "var(--text-secondary)" }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(0,245,255,0.07)";
                                                e.currentTarget.style.color = "#00F5FF";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Task
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer row */}
                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-muted)" }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="rounded-lg flex items-center justify-center"
                            style={{
                                width: isKanban ? 26 : 32,
                                height: isKanban ? 26 : 32,
                                background: "rgba(0, 245, 255, 0.08)",
                                border: "1px solid rgba(0, 245, 255, 0.15)",
                            }}
                        >
                            <User style={{ width: isKanban ? 12 : 15, height: isKanban ? 12 : 15, color: "#00F5FF" }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(0,245,255,0.4)" }}>
                                Assignee
                            </span>
                            <span className="font-semibold truncate max-w-[90px]" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                                {localTask.assignee?.name || 'Open Pool'}
                            </span>
                        </div>
                    </div>

                    {/* Status pill */}
                    {(isInProgress || isDone) && (
                        <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                            style={{
                                background: "rgba(0, 245, 255, 0.08)",
                                border: "1px solid rgba(0, 245, 255, 0.15)",
                                color: "#00F5FF",
                            }}
                        >
                            {isDone ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {status.replace('_', ' ')}
                        </div>
                    )}

                    {isKanban && !canUpdate && (
                        <ExternalLink className="w-3 h-3" style={{ color: "rgba(0,245,255,0.3)" }} />
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <EditTaskModal
                isOpen={editOpen}
                task={localTask}
                employees={employees}
                onClose={() => setEditOpen(false)}
                onSaved={handleSaved}
            />
        </>
    );
}
