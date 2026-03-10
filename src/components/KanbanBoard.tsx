'use client';

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { Circle, Zap, Eye, CheckCircle2, ChevronDown, User, Users, Filter, X, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

interface Employee {
    id: string;
    name: string | null;
}

interface KanbanBoardProps {
    tasks: Task[];
    userId: string;
    userRole: string;
    employees?: Employee[];
}

const COLUMNS = [
    { id: 'TODO', title: 'To Do', icon: Circle, hue: "zinc" },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: Zap, hue: "neon" },
    { id: 'REVIEW', title: 'Review', icon: Eye, hue: "neon" },
    { id: 'DONE', title: 'Done', icon: CheckCircle2, hue: "neon-dim" },
];

export default function KanbanBoard({ tasks: initialTasks, userId, userRole, employees = [] }: KanbanBoardProps) {
    const router = useRouter();
    const isAdmin = userRole === "ADMIN";

    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Employee filter — admin only
    const [filterEmployee, setFilterEmployee] = useState<string>("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setTasks(initialTasks);
        setIsMounted(true);
    }, [initialTasks]);

    if (!isMounted) return null;

    // ── Filtered task list ─────────────────────────────────────────────────
    const visibleTasks = isAdmin
        ? (filterEmployee === "all" ? tasks : tasks.filter(t => t.assigneeId === filterEmployee))
        : tasks.filter(t => t.assigneeId === userId);   // employees only see own tasks

    // ── Drag handlers ──────────────────────────────────────────────────────
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            const el = document.getElementById(`task-${taskId}`);
            if (el) el.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (_e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
        const el = document.getElementById(`task-${taskId}`);
        if (el) el.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        // Employees cannot drop into DONE column
        if (!isAdmin && columnId === "DONE") {
            e.dataTransfer.dropEffect = 'none';
            return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => setDragOverColumn(null);

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        // Guard: employees cannot drop into DONE
        if (!isAdmin && targetStatus === "DONE") return;

        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
        setDragOverColumn(null);
        setDraggedTaskId(null);
        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === targetStatus) return;

        const originalStatus = task.status;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

        try {
            const res = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: targetStatus }),
            });
            if (!res.ok) throw new Error("Status update failed");
            router.refresh();
        } catch (error) {
            console.error("Status update error:", error);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: originalStatus } : t));
        }
    };

    const handleDeletedTask = (id: string) =>
        setTasks(prev => prev.filter(t => t.id !== id));

    const handleUpdatedTask = (updated: Task) =>
        setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));

    const getTasksByStatus = (s: string) => visibleTasks.filter(t => t.status === s);

    const getColumnStyle = (hue: string, isDragOver: boolean, columnId: string) => {
        // DONE column locked for non-admins — subtle red tint on drag-over
        if (!isAdmin && draggedTaskId && columnId === "DONE") return {
            background: "rgba(239, 68, 68, 0.04)",
            border: "1.5px dashed rgba(239,68,68,0.25)",
            opacity: 0.6,
            cursor: "not-allowed",
        };
        if (isDragOver) return {
            background: "rgba(0, 245, 255, 0.06)",
            border: "1.5px dashed rgba(0, 245, 255, 0.4)",
        };
        if (hue === "zinc") return { background: "rgba(24, 24, 27, 0.4)", border: "1px solid rgba(39,39,42,0.6)" };
        if (hue === "neon-dim") return { background: "rgba(0,245,255,0.02)", border: "1px solid rgba(0,245,255,0.06)" };
        return { background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)" };
    };

    const getIconColor = (hue: string) => {
        if (hue === "zinc") return "rgba(0, 245, 255, 0.45)";
        if (hue === "neon-dim") return "rgba(0, 245, 255, 0.65)";
        return "rgba(0, 245, 255, 0.85)";
    };

    // ── Selected employee label for filter button ──────────────────────────
    const filterLabel = filterEmployee === "all"
        ? "All Members"
        : (employees.find(e => e.id === filterEmployee)?.name ?? "Unknown");

    return (
        <div className="flex flex-col h-full overflow-hidden gap-3">

            {/* ── Floating Member Filter (Admin Only) ───────────────────────── */}
            {isAdmin && employees.length > 0 && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
                    <AnimatePresence>
                        {filterOpen && (
                            <motion.div
                                key="member-filter-popup"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="mb-2 min-w-[200px] overflow-hidden rounded-2xl p-1 glass-strong neon-glow"
                                style={{
                                    background: "rgba(14, 14, 18, 0.98)",
                                    border: "1px solid rgba(0, 245, 255, 0.2)",
                                }}
                            >
                                <div className="px-3 py-2 border-b border-white/5 mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue/60">Team Filter</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {/* All Members */}
                                    <button
                                        onClick={() => { setFilterEmployee("all"); setFilterOpen(false); }}
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-semibold transition-all hover:bg-neon-blue/10 group"
                                        style={{ color: filterEmployee === "all" ? "#00F5FF" : "var(--text-secondary)" }}
                                    >
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${filterEmployee === "all" ? "bg-neon-blue/20 border-neon-blue/40" : "bg-white/5 border-white/5"}`}>
                                            <Users className="h-3.5 w-3.5" />
                                        </div>
                                        <span>All Members</span>
                                    </button>

                                    {employees.map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => { setFilterEmployee(emp.id); setFilterOpen(false); }}
                                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-semibold transition-all hover:bg-neon-blue/10 group"
                                            style={{ color: filterEmployee === emp.id ? "#00F5FF" : "var(--text-secondary)" }}
                                        >
                                            <div
                                                className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${filterEmployee === emp.id ? "bg-neon-blue/20 border-neon-blue/40" : "bg-white/5 border-white/10"}`}
                                            >
                                                <span className="text-[10px] font-bold">
                                                    {emp.name?.[0]?.toUpperCase() ?? "?"}
                                                </span>
                                            </div>
                                            <span className="truncate">{emp.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-3">
                        {filterEmployee !== "all" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass px-4 py-2 rounded-xl border-neon-blue/30 flex items-center gap-2"
                            >
                                <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest truncate max-w-[120px]">
                                    {filterLabel}
                                </span>
                                <button
                                    onClick={() => setFilterEmployee("all")}
                                    className="p-1 hover:bg-[#00F5FF]/10 rounded-md transition-colors"
                                >
                                    <X className="w-3 h-3" style={{ color: "#00F5FF" }} />
                                </button>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterOpen(v => !v)}
                            className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center border-2 ${filterOpen ? 'bg-[#00F5FF] text-zinc-950 border-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.4)]' : 'glass-strong text-[#00F5FF] border-[#00F5FF]/30 hover:border-[#00F5FF]/60'}`}
                        >
                            {filterOpen ? <X className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
                        </motion.button>
                    </div>
                </div>
            )}

            {/* ── Kanban columns ─────────────────────────────────────────── */}
            <div className="flex flex-row gap-6 md:gap-4 overflow-x-auto md:overflow-x-hidden md:overflow-y-hidden h-full custom-scrollbar pb-20 md:pb-0 snap-x snap-mandatory scroll-smooth px-4 md:px-0">
                {COLUMNS.map((col) => {
                    const columnTasks = getTasksByStatus(col.id);
                    const isDragOver = dragOverColumn === col.id;
                    const colStyle = getColumnStyle(col.hue, isDragOver, col.id);
                    const isLocked = !isAdmin && col.id === "DONE";

                    return (
                        <div key={col.id} className="min-w-[85vw] md:min-w-0 md:flex-1 flex flex-col h-full relative snap-center">
                            {/* Header */}
                            <div className="sticky top-0 z-[10] flex items-center gap-2 px-1 mb-3 py-2 bg-[var(--bg-base)]/80 backdrop-blur-md">
                                <col.icon style={{ width: 14, height: 14, color: getIconColor(col.hue), flexShrink: 0 }} />
                                <h3 className="flex-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                    {col.title}
                                </h3>
                                {isLocked && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-red-500/40">Admin only</span>
                                )}
                                <span
                                    className="flex items-center justify-center rounded-full text-[9px] font-bold"
                                    style={{ width: 20, height: 20, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)", color: "#00F5FF" }}
                                >
                                    {columnTasks.length}
                                </span>
                            </div>

                            {/* Drop zone */}
                            <div
                                onDragOver={e => handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, col.id)}
                                className="flex-1 flex flex-col gap-3 p-2.5 rounded-2xl transition-all duration-200 overflow-y-auto min-h-0 custom-scrollbar"
                                style={colStyle}
                            >
                                {columnTasks.map(task => (
                                    <div
                                        key={task.id}
                                        id={`task-${task.id}`}
                                        draggable
                                        onDragStart={e => handleDragStart(e, task.id)}
                                        onDragEnd={e => handleDragEnd(e, task.id)}
                                        style={{ borderRadius: 16, cursor: "grab" }}
                                        className="relative transition-opacity"
                                    >
                                        <TaskCard
                                            task={task}
                                            userId={userId}
                                            userRole={userRole}
                                            isKanban
                                            employees={employees}
                                            onDeleted={handleDeletedTask}
                                            onUpdated={handleUpdatedTask}
                                        />
                                    </div>
                                ))}

                                {/* Empty state */}
                                {columnTasks.length === 0 && !isDragOver && (
                                    <div className="flex flex-1 flex-col items-center justify-center py-10 opacity-30">
                                        <col.icon style={{ width: 20, height: 20, color: "#00F5FF", marginBottom: 8 }} />
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00F5FF" }}>Idle</p>
                                    </div>
                                )}

                                {/* Drop indicator */}
                                {isDragOver && !isLocked && (
                                    <div
                                        className="flex h-20 items-center justify-center rounded-2xl"
                                        style={{ border: "2px dashed rgba(0,245,255,0.4)", background: "rgba(0,245,255,0.04)" }}
                                    >
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(0,245,255,0.5)" }}>
                                            Drop Here
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
