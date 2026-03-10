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
import { useToast } from "./ToastContext";
import { useRouter } from "next/navigation";

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
    const [dateOption, setDateOption] = useState<"today" | "tomorrow" | "custom" | "">("");
    const [displayId, setDisplayId] = useState("TASK-...");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

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
            if (res.ok) {
                showToast(`Task "${title}" published successfully`);
                onClose();
                router.refresh();
            } else {
                showToast("Failed to publish task", "error");
            }
        } catch (error) {
            console.error("Task submission error:", error);
            showToast("An error occurred while publishing", "error");
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
                        className="relative w-full max-w-2xl rounded-2xl md:rounded-3xl h-full md:h-auto max-h-screen overflow-hidden"
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

                        <div className="relative p-5 md:p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 md:mb-5">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Assign New Task</h2>
                                    <p className="text-xs md:text-sm text-zinc-500 mt-1">Deploy a task to a team member.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="btn-surface w-10 h-10 p-0 rounded-xl flex-shrink-0"
                                    style={{ height: 40, width: 40, padding: 0 }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 pb-4">
                                {/* Row 1: ID + Title */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-4">
                                    <div className="order-2 md:order-1">
                                        <label className="field-label">
                                            <Hash className="w-3.5 h-3.5" />
                                            Task ID
                                        </label>
                                        <div className="field-input h-12 md:h-auto flex items-center text-zinc-500 text-xs font-mono cursor-not-allowed select-none">
                                            {displayId}
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 order-1 md:order-2">
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
                                            className="field-input h-11 md:h-11 w-full text-base md:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Assign + Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
                                    <div>
                                        <label className="field-label">
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Assign To
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="field-input h-11 md:h-11 w-full appearance-none cursor-pointer pr-10 text-base md:text-sm selection:bg-neon-blue/30"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="" disabled className="text-zinc-500">Select Employee</option>
                                                {employees.map((emp) => (
                                                    <option
                                                        key={emp.id}
                                                        value={emp.id}
                                                        style={{ background: "#0e0e12" }}
                                                        className="hover:bg-neon-blue/20"
                                                    >
                                                        {emp.name || 'Unknown'}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="field-label">
                                            <Flag className="w-3.5 h-3.5" />
                                            Priority
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="field-input h-11 md:h-11 w-full appearance-none cursor-pointer pr-10 text-base md:text-sm selection:bg-neon-blue/30"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="LOW" style={{ background: "#0e0e12" }}>Low</option>
                                                <option value="MEDIUM" style={{ background: "#0e0e12" }}>Medium</option>
                                                <option value="HIGH" style={{ background: "#0e0e12" }}>High</option>
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Due Date + Company */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                                    <div className="col-span-1">
                                        <label className="field-label">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Due Date
                                        </label>
                                        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5 shadow-inner mb-3">
                                            {(['today', 'tomorrow', 'custom'] as const).map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => {
                                                        setDateOption(opt);
                                                        if (opt === 'today') {
                                                            setDueDate(new Date().toISOString().split('T')[0]);
                                                        } else if (opt === 'tomorrow') {
                                                            const tom = new Date();
                                                            tom.setDate(tom.getDate() + 1);
                                                            setDueDate(tom.toISOString().split('T')[0]);
                                                        }
                                                    }}
                                                    className={`flex-1 px-3 py-3 md:py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${dateOption === opt
                                                        ? "bg-[#00F5FF]/10 text-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.15)] ring-1 ring-[#00F5FF]/30"
                                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {(dateOption === 'custom' || (dueDate && dateOption !== 'today' && dateOption !== 'tomorrow')) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <input
                                                        type="date"
                                                        required
                                                        value={dueDate}
                                                        onChange={(e) => {
                                                            setDueDate(e.target.value);
                                                            setDateOption('custom');
                                                        }}
                                                        className="field-input h-11 md:h-11 w-full text-base md:text-sm"
                                                        style={{ colorScheme: "dark" }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {dueDate && dateOption && dateOption !== 'custom' && (
                                            <div className="px-3 py-1 text-[11px] text-zinc-500 font-medium">
                                                Selected: <span className="text-[#00F5FF]/70">{dueDate}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="field-label">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            Company Focus
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={companyType}
                                                onChange={(e) => setCompanyType(e.target.value)}
                                                className="field-input h-11 md:h-11 w-full appearance-none cursor-pointer pr-10 text-base md:text-sm selection:bg-neon-blue/30"
                                                style={{ background: "var(--bg-elevated)", colorScheme: "dark" }}
                                            >
                                                <option value="COMMERCE_AGENT" style={{ background: "#0e0e12" }}>Commerce Agents</option>
                                                <option value="KNIGHT_WOLF" style={{ background: "#0e0e12" }}>Knight Wolf</option>
                                                <option value="BOTH" style={{ background: "#0e0e12" }}>Both Companies</option>
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/50 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="field-label">
                                        <AlignLeft className="w-3.5 h-3.5" />
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide context and requirements..."
                                        className="field-input w-full resize-none text-base md:text-sm py-4"
                                    />
                                </div>

                                {/* Submit Only (No Cancel as per request) */}
                                <div className="pt-2 md:pt-1">
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 md:h-12 btn-primary text-sm md:text-base font-black tracking-wider uppercase"
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
