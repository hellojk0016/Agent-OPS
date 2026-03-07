'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, User, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskCardProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        assigneeId: string | null;
        createdAt: Date;
        assignee: { name: string | null } | null;
    };
    isKanban?: boolean;
    userId: string;
    userRole: string;
}

export default function TaskCard({ task, userId, userRole, isKanban }: TaskCardProps) {
    const [status, setStatus] = useState(task.status);
    const [isLoading, setIsLoading] = useState(false);

    const canUpdate = userRole === 'ADMIN' || (userRole === 'MEMBER' && task.assigneeId === userId);

    const handleStatusUpdate = async () => {
        if (!canUpdate || isLoading) return;
        const nextStatus = status === 'TODO' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        setIsLoading(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: nextStatus }),
            });
            if (res.ok) setStatus(nextStatus);
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (userRole !== 'ADMIN' || isLoading) return;
        if (!confirm("Delete this task?")) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
            if (res.ok) window.location.reload();
        } catch (error) {
            console.error('Failed to delete task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isDone = status === 'DONE';
    const isInProgress = status === 'IN_PROGRESS';

    return (
        <div
            className="group relative flex flex-col rounded-2xl transition-all duration-200"
            style={{
                background: "var(--bg-elevated)",
                border: `1px solid ${isDone ? "rgba(0, 245, 255, 0.08)" : "var(--border-muted)"}`,
                padding: isKanban ? "14px 16px" : "20px 22px",
                gap: isKanban ? 12 : 16,
                opacity: isDone ? 0.65 : 1,
            }}
            onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.borderColor = "rgba(0, 245, 255, 0.2)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 245, 255, 0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDone ? "rgba(0, 245, 255, 0.08)" : "var(--border-muted)"; e.currentTarget.style.boxShadow = ""; }}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.button
                            key={status}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            onClick={handleStatusUpdate}
                            disabled={!canUpdate || isLoading}
                            className="flex-shrink-0 mt-0.5 transition-all rounded-full"
                            style={{ cursor: canUpdate ? "pointer" : "default", opacity: !canUpdate ? 0.3 : 1 }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-neon-blue" style={{ color: "#00F5FF" }} />
                            ) : isDone ? (
                                <CheckCircle2 className="w-4 h-4" style={{ color: "#00F5FF" }} />
                            ) : isInProgress ? (
                                <Clock className="w-4 h-4" style={{ color: "#00F5FF" }} />
                            ) : (
                                <Circle className="w-4 h-4 text-zinc-600" />
                            )}
                        </motion.button>
                    </AnimatePresence>

                    <h3
                        className="font-semibold leading-snug transition-all"
                        style={{
                            fontSize: isKanban ? "13px" : "15px",
                            color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: isDone ? "line-through" : "none",
                        }}
                    >
                        {task.title}
                    </h3>
                </div>

                {/* Delete */}
                {userRole === 'ADMIN' && (
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="btn-danger opacity-0 group-hover:opacity-100"
                        style={{ padding: "4px" }}
                    >
                        <X className="w-3.5 h-3.5 text-neon-blue" style={{ color: "#00F5FF" }} />
                    </button>
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
                        <User className="text-neon-blue" style={{ width: isKanban ? 12 : 15, height: isKanban ? 12 : 15, color: "#00F5FF" }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(0,245,255,0.4)" }}>Assignee</span>
                        <span className="font-semibold truncate max-w-[90px]" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                            {task.assignee?.name || 'Open Pool'}
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
    );
}
