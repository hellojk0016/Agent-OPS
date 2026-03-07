'use client';

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { Circle, Zap, Eye, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
    id: string;
    displayId: string | null;
    title: string;
    description: string | null;
    status: string;
    assigneeId: string | null;
    createdAt: Date;
    assignee: { name: string | null } | null;
}

interface KanbanBoardProps {
    tasks: Task[];
    userId: string;
    userRole: string;
}

const COLUMNS = [
    { id: 'TODO', title: 'To Do', icon: Circle, hue: "zinc" },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: Zap, hue: "neon" },
    { id: 'REVIEW', title: 'Review', icon: Eye, hue: "neon" },
    { id: 'DONE', title: 'Done', icon: CheckCircle2, hue: "neon-dim" },
];

export default function KanbanBoard({ tasks: initialTasks, userId, userRole }: KanbanBoardProps) {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            const el = document.getElementById(`task-${taskId}`);
            if (el) el.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
        const el = document.getElementById(`task-${taskId}`);
        if (el) el.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverColumn(null);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
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
            if (!res.ok) throw new Error("Failed to update status");
            router.refresh();
        } catch (error) {
            console.error("Status update error:", error);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: originalStatus } : t));
        }
    };

    const getTasksByStatus = (s: string) => tasks.filter(t => t.status === s);

    const getColumnStyle = (hue: string, isDragOver: boolean) => {
        if (isDragOver) return {
            background: "rgba(0, 245, 255, 0.06)",
            border: "1.5px dashed rgba(0, 245, 255, 0.4)",
        };
        if (hue === "zinc") return {
            background: "rgba(24, 24, 27, 0.4)",
            border: "1px solid rgba(39, 39, 42, 0.6)",
        };
        if (hue === "neon-dim") return {
            background: "rgba(0, 245, 255, 0.02)",
            border: "1px solid rgba(0, 245, 255, 0.06)",
        };
        return {
            background: "rgba(0, 245, 255, 0.03)",
            border: "1px solid rgba(0, 245, 255, 0.1)",
        };
    };

    const getIconColor = (hue: string) => {
        if (hue === "zinc") return "rgba(113, 113, 122, 0.6)";
        if (hue === "neon-dim") return "rgba(0, 245, 255, 0.3)";
        return "rgba(0, 245, 255, 0.6)";
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex gap-3 overflow-hidden h-full -mx-2 px-2 pb-6">
                {COLUMNS.map((col) => {
                    const columnTasks = getTasksByStatus(col.id);
                    const isDragOver = dragOverColumn === col.id;
                    const colStyle = getColumnStyle(col.hue, isDragOver);

                    return (
                        <div key={col.id} className="flex-1 min-w-0 flex flex-col h-full">
                            {/* Column Header */}
                            <div className="flex items-center gap-2 px-1 mb-3">
                                <col.icon
                                    style={{ width: 14, height: 14, color: getIconColor(col.hue), flexShrink: 0 }}
                                />
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 flex-1">
                                    {col.title}
                                </h3>
                                <span
                                    className="text-[9px] font-bold flex items-center justify-center rounded-full"
                                    style={{
                                        width: 20, height: 20,
                                        background: "rgba(0, 245, 255, 0.08)",
                                        border: "1px solid rgba(0, 245, 255, 0.15)",
                                        color: "#00F5FF",
                                    }}
                                >
                                    {columnTasks.length}
                                </span>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col.id)}
                                className="flex-1 flex flex-col gap-3 p-2.5 rounded-2xl transition-all duration-200 overflow-y-auto min-h-0 custom-scrollbar"
                                style={colStyle}
                            >
                                {columnTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        id={`task-${task.id}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={(e) => handleDragEnd(e, task.id)}
                                        style={{ borderRadius: 16, cursor: "grab" }}
                                        className="relative transition-opacity"
                                    >
                                        <TaskCard task={task} userId={userId} userRole={userRole} isKanban />
                                    </div>
                                ))}

                                {/* Empty state */}
                                {columnTasks.length === 0 && !isDragOver && (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
                                        <col.icon style={{ width: 20, height: 20, color: "#00F5FF", marginBottom: 8 }} />
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#00F5FF" }}>
                                            Idle
                                        </p>
                                    </div>
                                )}

                                {/* Drop target indicator */}
                                {isDragOver && (
                                    <div
                                        className="h-20 rounded-2xl flex items-center justify-center"
                                        style={{
                                            border: "2px dashed rgba(0, 245, 255, 0.4)",
                                            background: "rgba(0, 245, 255, 0.04)",
                                        }}
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
