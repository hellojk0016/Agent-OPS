'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, User, MoreVertical, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

            if (res.ok) {
                setStatus(nextStatus);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (userRole !== 'ADMIN' || isLoading) return;
        if (!confirm("Are you sure you want to delete this task?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/tasks?id=${task.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'DONE': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case 'IN_PROGRESS': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
        }
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col glass glass-hover hover-lift transition-colors duration-200",
                isKanban ? "p-5 gap-4 rounded-2xl" : "p-7 gap-5 rounded-3xl"
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <AnimatePresence mode="wait">
                            <motion.button
                                key={status}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={handleStatusUpdate}
                                disabled={!canUpdate || isLoading}
                                className={cn(
                                    "flex-shrink-0 mt-1 p-1 rounded-full transition-all",
                                    canUpdate ? "hover:bg-zinc-800 cursor-pointer" : "cursor-default opacity-30"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                                ) : status === 'DONE' ? (
                                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                                ) : status === 'IN_PROGRESS' ? (
                                    <Clock className="w-4 h-4 text-neon-blue" />
                                ) : (
                                    <Circle className="w-4 h-4 text-neon-blue" />
                                )}
                            </motion.button>
                        </AnimatePresence>
                        <h3 className={cn(
                            "font-bold tracking-tight transition-all",
                            isKanban ? "text-base leading-snug" : "text-lg",
                            status === 'DONE' ? "text-zinc-500 line-through decoration-zinc-800" : "text-zinc-100"
                        )}>
                            {task.title}
                        </h3>
                    </div>
                </div>

                {userRole === 'ADMIN' && (
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Task"
                    >
                        <X className="w-4 h-4 text-neon-blue" />
                    </button>
                )}
            </div>

            <div className={cn(
                "flex items-center justify-between border-t border-zinc-800/50",
                isKanban ? "pt-3" : "pt-4"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shadow-inner overflow-hidden",
                        isKanban ? "h-7 w-7" : "h-9 w-9"
                    )}>
                        <User className={cn(isKanban ? "w-4 h-4" : "w-5 h-5", "text-neon-blue")} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Assignee</span>
                        <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[100px]">
                            {task.assignee?.name || 'Open Pool'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isKanban && (
                        <div className={cn(
                            "px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                            getStatusColor(status)
                        )}>
                            {status.replace('_', ' ')}
                        </div>
                    )}
                    {isKanban && !canUpdate && (
                        <div title="View Only">
                            <ExternalLink className="w-3 h-3 text-neon-blue" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
