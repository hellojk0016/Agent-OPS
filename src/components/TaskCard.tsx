'use client';

import { useState, useRef, useEffect } from 'react';
import {
    CheckCircle2, Circle, Clock, Loader2, User,
    ExternalLink, MoreVertical, Pencil, Trash2,
    Eye as EyeIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditTaskModal from "./EditTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "./ToastContext";

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
    onStatusUpdate?: (newStatus: string) => Promise<void>;
}

export default function TaskCard({
    task,
    userId,
    userRole,
    isKanban,
    employees = [],
    onDeleted,
    onUpdated,
    onStatusUpdate,
}: TaskCardProps) {
    const [status, setStatus] = useState(task.status);
    const [localTask, setLocalTask] = useState<Task>(task);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const { showToast } = useToast();

    const canUpdate = userRole === 'ADMIN' || (userRole === 'MEMBER' && task.assigneeId === userId);
    const isAdmin = userRole === 'ADMIN';

    const handleStatusUpdate = async (newStatus?: string) => {
        if (!canUpdate || isStatusLoading) return;

        let nextStatus = newStatus;
        if (!nextStatus) {
            if (status === 'TODO') nextStatus = 'IN_PROGRESS';
            else if (status === 'IN_PROGRESS') nextStatus = 'REVIEW';
            else if (status === 'REVIEW') {
                if (isAdmin) nextStatus = 'DONE';
                else nextStatus = 'TODO';
            }
            else nextStatus = 'TODO';
        }

        if (nextStatus === 'DONE' && !isAdmin) return;

        setIsStatusLoading(true);
        try {
            if (onStatusUpdate) {
                // Use unified parent logic
                await onStatusUpdate(nextStatus);
            } else {
                // Fallback for non-Kanban usage or if not provided
                const res = await fetch('/api/tasks', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: task.id, status: nextStatus }),
                });
                if (res.ok) {
                    onUpdated?.({ ...localTask, status: nextStatus });
                }
            }
            setStatus(nextStatus);
            setLocalTask(prev => ({ ...prev, status: nextStatus }));
            showToast(`TASK MOVED TO ${nextStatus.replace('_', ' ').toUpperCase()}`);
        } catch (err) {
            console.error('Status update failed:', err);
            showToast("FAILED TO UPDATE STATUS", "error");
        } finally {
            setIsStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsConfirmDeleteOpen(true);
    };

    const performDelete = async () => {
        setIsConfirmDeleteOpen(false);
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("TASK DELETED SUCCESSFULLY");
                onDeleted?.(task.id);
            }
        } catch (err) {
            console.error('Delete failed:', err);
            showToast("FAILED TO DELETE TASK", "error");
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
    const isReview = status === 'REVIEW';

    // Check if the current user can move THIS task to the NEXT logical status
    const canToggle = canUpdate && !(isReview && !isAdmin);

    return (
        <>
            <div
                className={`group relative flex flex-col transition-all duration-300 card ${isDone ? "opacity-65" : "opacity-100"}`}
                style={{
                    padding: isKanban ? "14px 16px" : "20px 22px",
                    gap: isKanban ? 12 : 16,
                    cursor: "pointer",
                    border: isDone ? "1px solid rgba(0, 245, 255, 0.07)" : undefined
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setDetailsOpen(true);
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
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(); }}
                                disabled={!canToggle || isStatusLoading}
                                className="flex-shrink-0 mt-0.5 transition-all rounded-full"
                                style={{ cursor: canToggle ? "pointer" : "default", opacity: !canToggle ? 0.3 : 1 }}
                            >
                                {isStatusLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00F5FF" }} />
                                ) : isDone ? (
                                    <CheckCircle2 className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                ) : isReview ? (
                                    <EyeIcon className="w-4 h-4" style={{ color: "#A78BFA" }} />
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

                    {/* Direct Actions (Admin only) */}
                    {isAdmin && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                                className="btn-surface rounded-lg flex items-center justify-center transition-all hover:text-[#00F5FF] hover:bg-[#00F5FF]/10"
                                style={{ height: 28, width: 28, padding: 0 }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                className="btn-surface rounded-lg flex items-center justify-center transition-all hover:text-[#FF4D6A] hover:bg-[#FF4D6A]/15 hover:border-[#FF4D6A]/60 hover:shadow-[0_0_15px_rgba(255,77,106,0.2)]"
                                style={{ height: 28, width: 28, padding: 0 }}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#00F5FF" }} />
                                    : <Trash2 className="w-3.5 h-3.5" style={{ color: "#FF4D6A" }} />
                                }
                            </button>
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
                            <span className="font-semibold truncate max-w-[90px] uppercase" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                                {localTask.assignee?.name || 'OPEN POOL'}
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
                            {status.replace('_', ' ').toUpperCase()}
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

            {/* Details Modal */}
            <TaskDetailsModal
                isOpen={detailsOpen}
                task={localTask}
                userRole={userRole}
                onClose={() => setDetailsOpen(false)}
                onEdit={() => setEditOpen(true)}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={performDelete}
                isDeleting={isDeleting}
                title="DELETE TASK"
                message="ARE YOU SURE YOU WANT TO DELETE THIS TASK?"
            />
        </>
    );
}
