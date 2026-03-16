"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./ToastContext";
import {
    X,
    Loader2,
    Type,
    UserPlus,
    Flag,
    Calendar,
    Briefcase,
    AlignLeft,
    ChevronDown,
    SaveAll,
} from "lucide-react";
import Portal from "./Portal";

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

interface EditTaskModalProps {
    isOpen: boolean;
    task: Task | null;
    employees: Employee[];
    onClose: () => void;
    onSaved: (updatedTask: Task) => void;
}

export default function EditTaskModal({ isOpen, task, employees, onClose, onSaved }: EditTaskModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [companyType, setCompanyType] = useState("BOTH");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Populate form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setAssigneeId(task.assigneeId || "");
            setPriority((task.priority as string) || "MEDIUM");
            setCompanyType((task.companyType as string) || "BOTH");
            if (task.dueDate) {
                const d = new Date(task.dueDate as string);
                setDueDate(d.toISOString().split("T")[0]);
            } else {
                setDueDate("");
            }
            setError("");
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        if (!title.trim()) { setError("Task name is required"); return; }

        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: task.id,
                    title: title.trim(),
                    description: description.trim() || null,
                    assigneeId: assigneeId || null,
                    priority,
                    dueDate: dueDate || null,
                    companyType,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update task");
            }

            const updatedTask = await res.json();
            showToast(`Task "${title}" updated successfully`);
            onSaved(updatedTask);
            onClose();
        } catch (err: any) {
            setError(err.message);
            showToast(err.message || "Failed to update task", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
            <AnimatePresence>
            {isOpen && task && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.93, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.93, opacity: 0, y: 16 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        className="relative w-full md:max-w-xl rounded-none md:rounded-2xl h-full md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden"
                        style={{
                            background: "rgba(12, 12, 16, 0.97)",
                            border: "1px solid rgba(0, 245, 255, 0.18)",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0, 245, 255, 0.14), 0 8px 32px rgba(0,0,0,0.6)",
                        }}
                    >
                        {/* Neon top accent */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-70" />
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#00F5FF]/[0.06] blur-3xl pointer-events-none -mr-28 -mt-28" />

                        <div className="relative p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Edit Task</h2>
                                    <p className="text-sm text-zinc-500 mt-0.5">Update task details below.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="btn-surface rounded-lg"
                                    style={{ height: 36, width: 36, padding: 0 }}
                                >
                                    <X className="w-4 h-4" style={{ color: "#00F5FF" }} />
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                    <X className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Task Name */}
                                <div>
                                    <label className="field-label">
                                        <Type className="w-3 h-3" />
                                        Task Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Task name..."
                                        className="field-input w-full selection:bg-neon-blue/30 h-14 px-4 text-base"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>

                                {/* Assign + Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
                                    <div>
                                        <label className="field-label">
                                            <UserPlus className="w-3 h-3" />
                                            Assign To
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="field-input w-full appearance-none cursor-pointer pr-12 selection:bg-neon-blue/30 h-14 text-base"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="" style={{ background: "#0e0e12" }}>Unassigned</option>
                                                {employees.map((emp) => (
                                                    <option key={emp.id} value={emp.id} style={{ background: "#0e0e12" }}>
                                                        {emp.name || "Unknown"}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="field-label">
                                            <Flag className="w-3 h-3" />
                                            Priority
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="field-input w-full appearance-none cursor-pointer pr-12 selection:bg-neon-blue/30 h-14 text-base"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="LOW" style={{ background: "#0e0e12" }}>Low</option>
                                                <option value="MEDIUM" style={{ background: "#0e0e12" }}>Medium</option>
                                                <option value="HIGH" style={{ background: "#0e0e12" }}>High</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Due Date + Company Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
                                    <div>
                                        <label className="field-label">
                                            <Calendar className="w-3 h-3" />
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="field-input w-full selection:bg-neon-blue/30 h-14 text-base"
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">
                                            <Briefcase className="w-3 h-3" />
                                            Company Focus
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={companyType}
                                                onChange={(e) => setCompanyType(e.target.value)}
                                                className="field-input w-full appearance-none cursor-pointer pr-12 selection:bg-neon-blue/30 h-14 text-base"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="COMMERCE_AGENT" style={{ background: "#0e0e12" }}>Commerce Agents</option>
                                                <option value="KNIGHT_WOLF" style={{ background: "#0e0e12" }}>Knight Wolf</option>
                                                <option value="BOTH" style={{ background: "#0e0e12" }}>Both</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="field-label">
                                        <AlignLeft className="w-3 h-3" />
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add context or requirements..."
                                        className="field-input w-full resize-none selection:bg-neon-blue/30 py-5 px-4 text-base"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col md:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-ghost w-full md:flex-1 h-14 text-base"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary w-full md:flex-1 h-14 text-base"
                                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <SaveAll className="w-4 h-4" />
                                        )}
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </Portal>
    );
}
