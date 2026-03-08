'use client';

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { Circle, Zap, Eye, CheckCircle2, ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";

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

    useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

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
        if (hue === "zinc") return "rgba(113,113,122,0.6)";
        if (hue === "neon-dim") return "rgba(0,245,255,0.3)";
        return "rgba(0,245,255,0.6)";
    };

    // ── Selected employee label for filter button ──────────────────────────
    const filterLabel = filterEmployee === "all"
        ? "All Members"
        : (employees.find(e => e.id === filterEmployee)?.name ?? "Unknown");

    return (
        <div className="flex flex-col h-full overflow-hidden gap-3">

            {/* ── Employee filter (admin only) ───────────────────────────── */}
            {isAdmin && employees.length > 0 && (
                <div className="flex items-center gap-3 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">Filter by</span>
                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen(v => !v)}
                            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                            style={{
                                background: filterEmployee !== "all"
                                    ? "rgba(0,245,255,0.08)"
                                    : "rgba(39,39,42,0.5)",
                                border: filterEmployee !== "all"
                                    ? "1px solid rgba(0,245,255,0.25)"
                                    : "1px solid rgba(63,63,70,0.6)",
                                color: filterEmployee !== "all" ? "#00F5FF" : "var(--text-secondary)",
                            }}
                        >
                            <User className="h-3 w-3" />
                            {filterLabel}
                            <ChevronDown className={`h-3 w-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                        </button>

                        {filterOpen && (
                            <div
                                className="absolute left-0 top-full mt-1.5 z-50 min-w-[160px] overflow-hidden rounded-xl py-1"
                                style={{
                                    background: "rgba(14,14,18,0.97)",
                                    border: "1px solid rgba(0,245,255,0.12)",
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.3)",
                                }}
                            >
                                {/* All */}
                                <button
                                    onClick={() => { setFilterEmployee("all"); setFilterOpen(false); }}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/5"
                                    style={{ color: filterEmployee === "all" ? "#00F5FF" : "var(--text-secondary)" }}
                                >
                                    <User className="h-3 w-3" /> All Members
                                </button>
                                <div className="mx-3 my-1 h-px bg-zinc-800" />
                                {employees.map(emp => (
                                    <button
                                        key={emp.id}
                                        onClick={() => { setFilterEmployee(emp.id); setFilterOpen(false); }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/5"
                                        style={{ color: filterEmployee === emp.id ? "#00F5FF" : "var(--text-secondary)" }}
                                    >
                                        <div
                                            className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                                            style={{ background: "rgba(0,245,255,0.12)", color: "#00F5FF" }}
                                        >
                                            {emp.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                        {emp.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {filterEmployee !== "all" && (
                        <button
                            onClick={() => setFilterEmployee("all")}
                            className="text-[10px] font-semibold uppercase tracking-widest transition-colors"
                            style={{ color: "rgba(0,245,255,0.5)" }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* ── Kanban columns ─────────────────────────────────────────── */}
            <div className="flex gap-3 overflow-hidden h-full -mx-2 px-2 pb-6">
                {COLUMNS.map((col) => {
                    const columnTasks = getTasksByStatus(col.id);
                    const isDragOver = dragOverColumn === col.id;
                    const colStyle = getColumnStyle(col.hue, isDragOver, col.id);
                    const isLocked = !isAdmin && col.id === "DONE";

                    return (
                        <div key={col.id} className="flex-1 min-w-0 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center gap-2 px-1 mb-3">
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
