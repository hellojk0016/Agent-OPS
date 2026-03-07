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
    ChevronDown,
    Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                body: JSON.stringify({ displayId, title, description, assigneeId: assigneeId || null, priority, dueDate: dueDate || null, companyType }),
            });
            if (res.ok) window.location.reload();
        } catch (error) {
            console.error("Task submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
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
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
                        style={{
                            background: "rgba(12, 12, 16, 0.95)",
                            border: "1px solid rgba(0, 245, 255, 0.15)",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0, 245, 255, 0.12), 0 8px 32px rgba(0,0,0,0.6)",
                        }}
                    >
                        {/* Top neon accent line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent opacity-60" />

                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00F5FF]/[0.06] blur-3xl pointer-events-none -mr-32 -mt-32" />

                        <div className="relative p-7">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-7">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Assign New Task</h2>
                                    <p className="text-sm text-zinc-500 mt-1">Deploy a task to a team member.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="btn-surface w-9 h-9 p-0 rounded-lg flex-shrink-0"
                                    style={{ height: 36, width: 36, padding: 0 }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Row 1: ID + Title */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="field-label">
                                            <Hash className="w-3 h-3" />
                                            Task ID
                                        </label>
                                        <div className="field-input text-zinc-500 text-xs font-mono cursor-not-allowed select-none">
                                            {displayId}
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <label className="field-label">
                                            <Type className="w-3 h-3" />
                                            Task Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Update system architecture"
                                            className="field-input w-full"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Assign + Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="field-label">
                                            <UserPlus className="w-3 h-3" />
                                            Assign To
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="field-input w-full appearance-none cursor-pointer pr-9"
                                                style={{ background: "var(--bg-elevated)" }}
                                            >
                                                <option value="" disabled>Select Employee</option>
                                                {employees.map((emp) => (
                                                    <option key={emp.id} value={emp.id} style={{ background: "#0e0e12" }}>
                                                        {emp.name || 'Unknown'}
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
                                                className="field-input w-full appearance-none cursor-pointer pr-9"
                                                style={{ background: "var(--bg-elevated)" }}
                                            >
                                                <option value="LOW" style={{ background: "#0e0e12" }}>Low</option>
                                                <option value="MEDIUM" style={{ background: "#0e0e12" }}>Medium</option>
                                                <option value="HIGH" style={{ background: "#0e0e12" }}>High</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Due Date + Company */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="field-label">
                                            <Calendar className="w-3 h-3" />
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="field-input w-full"
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
                                                className="field-input w-full appearance-none cursor-pointer pr-9"
                                                style={{ background: "var(--bg-elevated)" }}
                                            >
                                                <option value="COMMERCE_AGENT" style={{ background: "#0e0e12" }}>Commerce Agents</option>
                                                <option value="KNIGHT_WOLF" style={{ background: "#0e0e12" }}>Knight Wolf</option>
                                                <option value="BOTH" style={{ background: "#0e0e12" }}>Both Companies</option>
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
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide context and requirements..."
                                        className="field-input w-full resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <div className="pt-2">
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary w-full h-14 text-base font-bold tracking-wide"
                                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Rocket className="w-5 h-5" />
                                        )}
                                        {isLoading ? "Publishing..." : "Publish Task"}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
