"use client";

import { useState, useEffect } from "react";
import {
    X,
    Send,
    UserPlus,
    Type,
    AlignLeft,
    Loader2,
    Hash,
    Briefcase,
    Flag,
    Calendar,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: { id: string; name: string | null }[];
}

export default function CreateTaskModal({ isOpen, onClose, employees }: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [companyType, setCompanyType] = useState("BOTH");
    const [dueDate, setDueDate] = useState("");
    const [displayId, setDisplayId] = useState("TASK-...");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchNextId = async () => {
                try {
                    const res = await fetch("/api/tasks/next-id");
                    if (res.ok) {
                        const data = await res.json();
                        setDisplayId(data.nextId);
                    }
                } catch (error) {
                    console.error("Error fetching next ID:", error);
                }
            };
            fetchNextId();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayId,
                    title,
                    description,
                    assigneeId: assigneeId || null,
                    priority,
                    dueDate: dueDate || null,
                    companyType
                }),
            });

            if (res.ok) {
                window.location.reload(); // Refresh to show new task
            }
        } catch (error) {
            console.error("Task submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden glass shadow-neon-blue/10"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

                        {/* Header - Fixed */}
                        <div className="p-8 md:p-10 pb-4 flex items-center justify-between z-10">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                    <PlusSquareIcon className="w-6 h-6 text-neon-blue" />
                                    Create New Task
                                </h2>
                                <p className="text-sm text-zinc-500 font-medium tracking-wide">Configure team assignments and metadata</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl hover:bg-zinc-800/50 text-zinc-500 hover:text-white transition-all transform hover:rotate-90 active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-8 md:px-10 py-4 custom-scrollbar">
                            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Task ID & Title */}
                                    <div className="space-y-6 md:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                                    <Hash className="w-3 h-3 text-neon-blue" />
                                                    ID
                                                </label>
                                                <div className="px-5 py-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-zinc-500 text-sm font-bold shadow-inner uppercase tracking-wider">
                                                    {displayId}
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-3">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                                                    <Type className="w-3 h-3 text-neon-blue" />
                                                    Task Title
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Enter a descriptive title..."
                                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white placeholder:text-zinc-700 focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                            <UserPlus className="w-3 h-3 text-neon-blue" />
                                            Assignee
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white outline-none focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="" className="bg-zinc-900">Unassigned</option>
                                                {employees.map((emp) => (
                                                    <option key={emp.id} value={emp.id} className="bg-zinc-900">
                                                        {emp.name || 'Unknown'}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-neon-blue transition-colors pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                            <Flag className="w-3 h-3 text-neon-blue" />
                                            Priority
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white outline-none focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="LOW" className="bg-zinc-900">Low</option>
                                                <option value="MEDIUM" className="bg-zinc-900">Medium</option>
                                                <option value="HIGH" className="bg-zinc-900">High</option>
                                                <option value="URGENT" className="bg-zinc-900">Urgent</option>
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-neon-blue transition-colors pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Company Type */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                            <Briefcase className="w-3 h-3 text-neon-blue" />
                                            Company Focus
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={companyType}
                                                onChange={(e) => setCompanyType(e.target.value)}
                                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white outline-none focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="BOTH" className="bg-zinc-900">Both Companies</option>
                                                <option value="KNIGHT_WOLF" className="bg-zinc-900">Knight Wolf</option>
                                                <option value="COMMERCE_AGENT" className="bg-zinc-900">Commerce Agent</option>
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-neon-blue transition-colors pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                            <Calendar className="w-3 h-3 text-neon-blue" />
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white outline-none focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 transition-all shadow-inner [color-scheme:dark]"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
                                            <AlignLeft className="w-3 h-3 text-neon-blue" />
                                            Detailed Brief
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Outline the scope and expected outcomes..."
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-white placeholder:text-zinc-700 focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 outline-none transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Actions - Fixed Footer */}
                        <div className="p-8 md:p-10 pt-6 flex items-center justify-end gap-6 border-t border-zinc-800 bg-zinc-900/50 z-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3.5 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-task-form"
                                disabled={isLoading}
                                className="group relative flex items-center gap-3 px-10 py-4 rounded-[1.25rem] bg-neon-blue text-zinc-950 text-xs font-black uppercase tracking-[0.2em] overflow-hidden shadow-xl shadow-neon-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span className="relative">{isLoading ? "Deploying..." : "Assign Task"}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function PlusSquareIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}
