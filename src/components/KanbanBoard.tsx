'use client';

import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { Plus, Lock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
    { id: 'TODO', title: 'To Do', color: 'bg-zinc-500/20 text-zinc-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-amber-500/20 text-amber-500' },
    { id: 'REVIEW', title: 'Review', color: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'DONE', title: 'Done', color: 'bg-emerald-500/20 text-emerald-500' },
];

export default function KanbanBoard({ tasks: initialTasks, userId, userRole }: KanbanBoardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        // Set data transfer for firefox support
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';

        // Small delay to prevent the dragged image from being transparent
        setTimeout(() => {
            const element = document.getElementById(`task-${taskId}`);
            if (element) element.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
        const element = document.getElementById(`task-${taskId}`);
        if (element) element.style.opacity = '1';
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

        // Optimistic update
        const originalStatus = task.status;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

        try {
            const res = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: targetStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }
            router.refresh();
        } catch (error) {
            console.error("Status update error:", error);
            // Revert on error
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: originalStatus } : t));
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {userRole === 'ADMIN' && (
                <div className="px-2 mb-6">
                    <button
                        onClick={() => router.push(pathname + '?addTask=true')}
                        className="group flex items-center justify-center gap-3 w-full py-4 rounded-[2rem] border border-dashed border-zinc-800/60 hover:border-neon-blue/40 hover:bg-neon-blue/5 transition-all cursor-pointer hover-lift relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/0 via-neon-blue/5 to-neon-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Plus className="w-4 h-4 text-neon-blue" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover:text-neon-blue transition-colors">
                            Add Task
                        </span>
                    </button>
                </div>
            )}

            <div className="flex gap-4 overflow-hidden h-full -mx-2 px-2 pb-6">
                {COLUMNS.map((column) => {
                    const columnTasks = getTasksByStatus(column.id);
                    const isDragOver = dragOverColumn === column.id;

                    return (
                        <div
                            key={column.id}
                            className="flex-1 min-w-0 flex flex-col h-full"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-2 mb-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                        {column.title}
                                    </h3>
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-500">
                                        {columnTasks.length}
                                    </span>
                                </div>
                            </div>

                            {/* Column Content Area (Drop Target) — only this scrolls */}
                            <div
                                onDragOver={(e) => handleDragOver(e, column.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, column.id)}
                                className={cn(
                                    "flex-1 flex flex-col gap-4 p-2 rounded-2xl border transition-colors duration-200 overflow-y-auto min-h-0",
                                    isDragOver ? "bg-zinc-800/40 border-neon-blue/40" : "bg-zinc-900/30 border-zinc-800/30"
                                )}
                            >

                                <div className="flex flex-col gap-4">
                                    {columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            id={`task-${task.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragEnd={(e) => handleDragEnd(e, task.id)}
                                            className={cn(
                                                "relative shadow-sm rounded-3xl cursor-grab active:cursor-grabbing",
                                                draggedTaskId === task.id ? 'opacity-50 z-50' : ''
                                            )}
                                        >
                                            <TaskCard
                                                task={task}
                                                userId={userId}
                                                userRole={userRole}
                                                isKanban={true}
                                            />
                                        </div>
                                    ))}

                                    {columnTasks.length === 0 && !isDragOver && (
                                        <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                                                Idle
                                            </p>
                                        </div>
                                    )}

                                    {isDragOver && (
                                        <div className="h-24 rounded-3xl border-2 border-dashed border-neon-blue/30 bg-neon-blue/5 flex items-center justify-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-blue/50">Drop Here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
