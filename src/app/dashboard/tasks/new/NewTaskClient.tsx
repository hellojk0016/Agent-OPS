"use client";

import { useState, useEffect } from "react";
import {
    PlusCircle,
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
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import CustomDatePicker from "@/components/CustomDatePicker";

interface NewTaskClientProps {
    employees: { id: string; name: string | null }[];
}

export default function NewTaskClient({ employees }: NewTaskClientProps) {
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
    }, []);

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
                router.push("/dashboard");
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
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-muted)] px-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight uppercase">ADD NEW TASK</h1>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                        <PlusCircle className="w-4 h-4 text-neon-blue/60" />
                        Quick Assignment
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="glass-panel p-6 md:p-8 rounded-[32px] border border-white/5 shadow-2xl relative">
                {/* Subtle Ambient glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#00F5FF]/[0.05] blur-3xl pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-8 relative">

                    {/* Task ID & Task Name (Combined at top) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="field-label px-1">
                                <Hash className="w-3.5 h-3.5 text-neon-blue/50" />
                                Task ID
                            </label>
                            <input
                                type="text"
                                required
                                value={displayId}
                                onChange={(e) => setDisplayId(e.target.value)}
                                placeholder="TASK-000"
                                className="field-input w-full h-14 font-mono text-sm uppercase"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="field-label px-1">
                                <Type className="w-3.5 h-3.5 text-neon-blue/50" />
                                Task Name
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title..."
                                className="field-input w-full h-14 text-base"
                            />
                        </div>
                    </div>

                    {/* 2. Description */}
                    <div className="space-y-2">
                        <label className="field-label px-1">
                            <AlignLeft className="w-3.5 h-3.5 text-neon-blue/50" />
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the work..."
                            className="field-input w-full resize-none py-4 text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="field-label px-1">
                            <UserPlus className="w-3.5 h-3.5 text-neon-blue/50" />
                            Assign Employee {employees.length === 0 && <span className="text-red-400/60 ml-1">(No employees found)</span>}
                        </label>
                        <div className="relative">
                            <select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                className="field-input w-full h-14 appearance-none pr-12 text-base"
                                style={{ background: "var(--bg-elevated)" }}
                            >
                                <option value="">{employees.length === 0 ? "No available team members" : "Select Team Member (Optional)"}</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id} className="bg-[#0e0e12]">
                                        {emp.name || "Unknown"}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* 4. Priority */}
                    <div className="space-y-2">
                        <label className="field-label px-1">
                            <Flag className="w-3.5 h-3.5 text-neon-blue/50" />
                            Priority
                        </label>
                        <div className="relative">
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="field-input w-full h-14 appearance-none pr-12 text-base"
                                style={{ background: "var(--bg-elevated)" }}
                            >
                                <option value="LOW" className="bg-[#0e0e12]">LOW</option>
                                <option value="MEDIUM" className="bg-[#0e0e12]">MEDIUM</option>
                                <option value="HIGH" className="bg-[#0e0e12]">HIGH</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* 5. Due Date */}
                    <div className="space-y-3">
                        <label className="field-label px-1">
                            <Calendar className="w-3.5 h-3.5 text-neon-blue/50" />
                            Due Date
                        </label>
                        <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
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
                                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.1em] rounded-xl transition-all ${dateOption === opt
                                        ? "bg-[#00F5FF]/10 text-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.2)] ring-1 ring-[#00F5FF]/30"
                                        : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <AnimatePresence>
                            {(dateOption === 'custom' || (dueDate && dateOption !== 'today' && dateOption !== 'tomorrow')) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="overflow-hidden"
                                >
                                    <CustomDatePicker
                                        value={dueDate}
                                        onChange={(date: string) => {
                                            setDueDate(date);
                                            setDateOption('custom');
                                        }}
                                        className="w-full"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 6. Company Focus */}
                    <div className="space-y-2">
                        <label className="field-label px-1">
                            <Briefcase className="w-3.5 h-3.5 text-neon-blue/50" />
                            Company Focus
                        </label>
                        <div className="relative">
                            <select
                                value={companyType}
                                onChange={(e) => setCompanyType(e.target.value)}
                                className="field-input w-full h-14 appearance-none pr-12 text-base"
                                style={{ background: "var(--bg-elevated)" }}
                            >
                                <option value="COMMERCE_AGENT" className="bg-[#0e0e12]">COMMERCE AGENTS</option>
                                <option value="KNIGHT_WOLF" className="bg-[#0e0e12]">KNIGHT WOLF</option>
                                <option value="BOTH" className="bg-[#0e0e12]">BOTH COMPANIES</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-center">
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 btn-primary text-sm font-black tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(0,245,255,0.15)] flex items-center justify-center gap-2 border border-[#00F5FF]/20"
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
        </div>
    );
}
