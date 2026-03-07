"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    UserPlus,
    Type,
    AlignLeft,
    Loader2,
    X,
    Hash
} from "lucide-react";
import { motion } from "framer-motion";

interface TaskFormProps {
    employees: { id: string; name: string | null }[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TaskForm({ employees, onSuccess, onCancel }: TaskFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [displayId, setDisplayId] = useState("TASK-...");
    const [isLoading, setIsLoading] = useState(false);

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
                body: JSON.stringify({
                    displayId,
                    title,
                    description,
                    assigneeId: assigneeId || null
                }),
            });

            if (res.ok) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/dashboard");
                    router.refresh();
                }
            }
        } catch (error) {
            console.error("Task submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                {/* Task ID Field */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                        <Hash className="w-3.5 h-3.5 text-neon-blue" />
                        Task ID
                    </label>
                    <input
                        type="text"
                        readOnly
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/30 px-5 py-4 text-zinc-400 cursor-not-allowed outline-none transition-all shadow-inner"
                        value={displayId}
                    />
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                        <Type className="w-3.5 h-3.5 text-neon-blue" />
                        Task Title
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-zinc-100 placeholder:text-zinc-600 focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 outline-none transition-all shadow-inner"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Update system architecture"
                    />
                </div>

                {/* Assignee Select */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                        <UserPlus className="w-3.5 h-3.5 text-neon-blue" />
                        Assign To
                    </label>
                    <div className="relative group">
                        <select
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-zinc-100 outline-none focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 transition-all appearance-none cursor-pointer shadow-inner"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="" className="bg-zinc-900">Unassigned (Open Pool)</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id} className="bg-zinc-900 text-zinc-200">
                                    {emp.name || 'Unknown User'} ({emp.id.slice(0, 8)}...)
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neon-blue transition-colors">
                            <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <UserPlus className="w-4 h-4 text-neon-blue" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                        <AlignLeft className="w-3.5 h-3.5 text-neon-blue" />
                        Task Details
                    </label>
                    <textarea
                        rows={5}
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-zinc-100 placeholder:text-zinc-600 focus:border-neon-blue/50 focus:ring-4 focus:ring-neon-blue/5 outline-none transition-all shadow-inner resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide context and requirements for this task..."
                    />
                </div>
            </div>

            {/* Form Actions */}
            <div className="pt-8 flex items-center justify-end gap-4 border-t border-zinc-800/50">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-neon-blue hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition-all flex items-center gap-2"
                >
                    <X className="w-4 h-4 text-neon-blue" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-3.5 text-sm font-bold uppercase tracking-widest bg-neon-blue hover:bg-neon-blue/90 text-zinc-950 rounded-xl shadow-xl shadow-neon-blue/20 transition-all disabled:opacity-50 flex items-center gap-3 animate-fade-in"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    ) : (
                        <Send className="w-4 h-4 text-zinc-950" />
                    )}
                    {isLoading ? "deploying..." : "Publish Task"}
                </button>
            </div>
        </form>
    );
}
