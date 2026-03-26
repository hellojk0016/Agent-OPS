'use client';

import { useState, useEffect, useRef } from "react";
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
    { id: 'TODO', title: 'TO DO', icon: Circle, hue: "zinc" },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', icon: Zap, hue: "neon" },
    { id: 'REVIEW', title: 'REVIEW', icon: Eye, hue: "neon" },
    { id: 'DONE', title: 'DONE', icon: CheckCircle2, hue: "neon-dim" },
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
    const isUpdatingRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollVelocityRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isUpdatingRef.current) {
            console.log("[Kanban] Syncing tasks from props:", initialTasks.length);
            setTasks(initialTasks);
        } else {
            console.log("[Kanban] Update in progress, skipping prop sync");
        }
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
        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
        setDragOverColumn(null);
        setDraggedTaskId(null);
        if (!taskId) return;
        handleDropLogic(taskId, targetStatus);
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
        ? "ALL MEMBERS"
        : (employees.find(e => e.id === filterEmployee)?.name ?? "UNKNOWN").toUpperCase();

    // ── Touch handlers for mobile ──────────────────────────────────────────
    const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        // We don't preventDefault here to allow tap vs drag distinction by the browser
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!draggedTaskId) return;

        const touch = e.touches[0];
        const { clientX, clientY } = touch;

        // ── Pointer-Event Bypassing ──
        // We need to temporarily disable pointer events on the dragged element
        // so elementFromPoint hits the column underneath.
        const draggedEl = document.getElementById(`task-${draggedTaskId}`);
        let targetElement: Element | null = null;
        
        if (draggedEl) {
            const originalPointerEvents = draggedEl.style.pointerEvents;
            draggedEl.style.pointerEvents = 'none';
            targetElement = document.elementFromPoint(clientX, clientY);
            draggedEl.style.pointerEvents = originalPointerEvents;
        } else {
            targetElement = document.elementFromPoint(clientX, clientY);
        }

        const columnElement = targetElement?.closest('[data-column-id]');
        
        if (columnElement) {
            const columnId = columnElement.getAttribute('data-column-id');
            if (columnId) {
                if (!isAdmin && columnId === "DONE") {
                    setDragOverColumn(null);
                } else {
                    setDragOverColumn(columnId);
                }
            }
        } else {
            setDragOverColumn(null);
        }

        // ── Edge Scrolling ──
        const scrollThreshold = 60;
        const maxScrollSpeed = 15;
        const { innerWidth } = window;

        if (clientX < scrollThreshold) {
            scrollVelocityRef.current = -maxScrollSpeed * (1 - clientX / scrollThreshold);
        } else if (clientX > innerWidth - scrollThreshold) {
            scrollVelocityRef.current = maxScrollSpeed * (1 - (innerWidth - clientX) / scrollThreshold);
        } else {
            scrollVelocityRef.current = 0;
        }

        if (scrollVelocityRef.current !== 0 && !requestRef.current) {
            const animateScroll = () => {
                if (scrollContainerRef.current && scrollVelocityRef.current !== 0) {
                    scrollContainerRef.current.scrollLeft += scrollVelocityRef.current;
                    requestRef.current = requestAnimationFrame(animateScroll);
                } else {
                    requestRef.current = null;
                }
            };
            requestRef.current = requestAnimationFrame(animateScroll);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!draggedTaskId) return;

        // Stop edge scrolling
        scrollVelocityRef.current = 0;
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        const touch = e.changedTouches[0];
        const { clientX, clientY } = touch;

        // Detect column at drop point
        const draggedEl = document.getElementById(`task-${draggedTaskId}`);
        let targetElement: Element | null = null;
        
        if (draggedEl) {
            draggedEl.style.pointerEvents = 'none';
            targetElement = document.elementFromPoint(clientX, clientY);
            draggedEl.style.pointerEvents = '';
        } else {
            targetElement = document.elementFromPoint(clientX, clientY);
        }

        const columnElement = targetElement?.closest('[data-column-id]');
        const targetStatus = columnElement?.getAttribute('data-column-id');

        if (targetStatus && targetStatus !== dragOverColumn) {
            // Drop logic will check isAdmin and status
        }

        if (targetStatus) {
            handleDropLogic(draggedTaskId, targetStatus);
        }

        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    // Refactored status update logic to be shared between drag, touch, and button clicks
    const handleStatusUpdate = async (taskId: string, targetStatus: string) => {
        if (!isAdmin && targetStatus === "DONE") return;

        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === targetStatus) return;

        const originalStatus = task.status;
        
        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

        isUpdatingRef.current = true;
        try {
            console.log(`[Kanban] Updating task ${taskId} to ${targetStatus}...`);
            const res = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: targetStatus }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Status update failed");
            }
            
            console.log(`[Kanban] Update successful for task ${taskId}`);
            
            // Trigger server refresh for other data
            router.refresh();
            
            // Keep isUpdatingRef true for a short window to let router.refresh settle
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 2500);

        } catch (error) {
            console.error("Status update error:", error);
            isUpdatingRef.current = false;
            // Revert state on error
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: originalStatus } : t));
            throw error; // Let the caller (e.g. TaskCard) handle UI error state
        }
    };

    // For drag-drop compatibility
    const handleDropLogic = (taskId: string, targetStatus: string) => {
        handleStatusUpdate(taskId, targetStatus).catch(() => {});
    };

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
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue/60">TEAM FILTER</p>
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
                                        <span>ALL MEMBERS</span>
                                    </button>

                                    {employees.map(emp => {
                                        const isSelected = filterEmployee === emp.id;
                                        return (
                                            <button
                                                key={emp.id}
                                                onClick={() => { setFilterEmployee(emp.id); setFilterOpen(false); }}
                                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-semibold transition-all hover:bg-neon-blue/10 group"
                                                style={{ color: isSelected ? "#00F5FF" : "var(--text-secondary)" }}
                                            >
                                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${isSelected ? "bg-neon-blue/20 border-neon-blue/40" : "bg-white/5 border-white/5"}`}>
                                                    <UserCircle className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="truncate uppercase">{emp.name}</span>
                                            </button>
                                        );
                                    })}
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
            <div 
                ref={scrollContainerRef}
                className="flex flex-row gap-6 md:gap-4 overflow-x-auto md:overflow-x-hidden md:overflow-y-hidden h-full custom-scrollbar pb-20 md:pb-0 snap-x snap-mandatory scroll-smooth px-4 md:px-0"
            >
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
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-red-500/40">ADMIN ONLY</span>
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
                                data-column-id={col.id}
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
                                        onTouchStart={e => handleTouchStart(e, task.id)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        style={{ 
                                            borderRadius: 16, 
                                            cursor: "grab", 
                                            touchAction: "none",
                                            userSelect: "none",
                                            zIndex: draggedTaskId === task.id ? 1000 : 1,
                                            transform: draggedTaskId === task.id ? "scale(1.02)" : "scale(1)",
                                            boxShadow: draggedTaskId === task.id ? "0 20px 40px rgba(0,245,255,0.2)" : "none"
                                        }}
                                        className={`relative transition-all duration-200 ${draggedTaskId === task.id ? "opacity-40" : "opacity-100"}`}
                                    >
                                        <TaskCard
                                            task={task}
                                            userId={userId}
                                            userRole={userRole}
                                            isKanban
                                            employees={employees}
                                            onDeleted={handleDeletedTask}
                                            onUpdated={handleUpdatedTask}
                                            onStatusUpdate={(newStatus) => handleStatusUpdate(task.id, newStatus)}
                                        />
                                    </div>
                                ))}

                                {/* Empty state */}
                                {columnTasks.length === 0 && !isDragOver && (
                                    <div className="flex flex-1 flex-col items-center justify-center py-10 opacity-30">
                                        <col.icon style={{ width: 20, height: 20, color: "#00F5FF", marginBottom: 8 }} />
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00F5FF" }}>IDLE</p>
                                    </div>
                                )}

                                {/* Drop indicator */}
                                {isDragOver && !isLocked && (
                                    <div
                                        className="flex h-20 items-center justify-center rounded-2xl"
                                        style={{ border: "2px dashed rgba(0,245,255,0.4)", background: "rgba(0,245,255,0.04)" }}
                                    >
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(0,245,255,0.5)" }}>
                                            DROP HERE
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
