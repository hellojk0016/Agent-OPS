"use client";

import { useState } from "react";
import { PlusCircle, Trash2, UserCircle, Loader2, Users, Building, UserPlus } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useRouter } from "next/navigation";

interface Employee {
    id: string;
    name: string;
    phone: string;
    role: string;
    companies: string[];
}

import { useToast } from "@/components/ToastContext";

export default function EmployeesClient({ initialEmployees }: { initialEmployees: Employee[] }) {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const router = useRouter();
    const { showToast } = useToast();

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const performDelete = async () => {
        if (!confirmDeleteId) return;
        const id = confirmDeleteId;
        const empToDelete = employees.find(e => e.id === id);

        setConfirmDeleteId(null);
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
            showToast(`Member "${empToDelete?.name || 'Unknown'}" removed successfully`);
            router.refresh();
        } catch (error) {
            console.error(error);
            showToast("Failed to remove member", "error");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full pb-20 md:pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[var(--border-muted)] gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Team Members</h1>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neon-blue/50" />
                        Manage personnel and system access
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="hidden md:flex btn-primary"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Employee
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-muted)", background: "var(--bg-elevated)" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead style={{ background: "rgba(9, 9, 11, 0.6)", borderBottom: "1px solid var(--border-muted)" }}>
                            <tr>
                                {["Member", "Phone / Sign In", "Role", "Workspaces", ""].map((h, i) => (
                                    <th key={i} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-neon-blue/50 ${i === 4 ? "text-right" : ""}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, idx) => (
                                <tr
                                    key={emp.id}
                                    className="group transition-colors"
                                    style={{
                                        borderTop: idx > 0 ? "1px solid var(--border-muted)" : "none",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0, 245, 255, 0.02)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: "rgba(0, 245, 255, 0.08)", border: "1px solid rgba(0, 245, 255, 0.15)" }}>
                                                <UserCircle className="w-5 h-5 text-neon-blue" />
                                            </div>
                                            <span className="font-semibold text-zinc-100 text-sm">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400 font-mono tracking-wider">
                                        {emp.phone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge-neon">{emp.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {emp.companies.map((c) => (
                                                <span key={c} className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg"
                                                    style={{ background: "rgba(0, 245, 255, 0.06)", border: "1px solid rgba(0, 245, 255, 0.12)", color: "rgba(0, 245, 255, 0.7)" }}>
                                                    <Building className="w-3 h-3" />
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {emp.role !== "ADMIN" && (
                                            <button
                                                onClick={() => handleDeleteClick(emp.id)}
                                                disabled={isDeleting === emp.id}
                                                className="btn-danger"
                                            >
                                                {isDeleting === emp.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                                                    : <Trash2 className="w-4 h-4 text-neon-blue" />
                                                }
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {employees.map((emp) => (
                    <div
                        key={emp.id}
                        className="glass-panel p-5 rounded-3xl border border-[var(--border-muted)] hover:border-[#00F5FF]/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#00F5FF]/10 border border-[#00F5FF]/20">
                                    <UserCircle className="w-7 h-7 text-neon-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neon-blue/60">{emp.role}</p>
                                </div>
                            </div>
                            {emp.role !== "ADMIN" && (
                                <button
                                    onClick={() => handleDeleteClick(emp.id)}
                                    disabled={isDeleting === emp.id}
                                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 active:bg-red-500/20"
                                >
                                    {isDeleting === emp.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Employee ID</span>
                                <span className="text-xs font-mono text-zinc-400">{emp.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phone Number</span>
                                <span className="text-xs font-mono text-zinc-300 tracking-wider">+91 {emp.phone}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Workspaces</span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {emp.companies.map((c) => (
                                        <span key={c} className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                                            <Building className="w-3 h-3" />
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {employees.length === 0 && (
                <div className="px-6 py-16 text-center glass-panel rounded-3xl border border-dashed border-[var(--border-muted)] mt-4">
                    <Users className="w-10 h-10 text-neon-blue/20 mx-auto mb-4" />
                    <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest">No members found</p>
                    <p className="text-xs text-zinc-600 mt-1">Invite team members to get started.</p>
                </div>
            )}

            {/* Mobile Add Employee Button (Natural Scrolling) */}
            <div className="md:hidden mt-10 flex justify-center px-4">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full max-w-sm h-14 btn-primary text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,245,255,0.15)] active:scale-[0.98] transition-all border border-[#00F5FF]/20"
                >
                    <UserPlus className="w-5 h-5 mr-3 text-neon-blue" />
                    Add Employee
                </button>
            </div>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(newEmp) => {
                    setEmployees((prev) => [newEmp, ...prev]);
                    setIsAddModalOpen(false);
                    router.refresh();
                }}
            />

            <DeleteConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={performDelete}
                isDeleting={!!isDeleting}
                title="Remove Member"
                message="Are you sure you want to remove this employee? They will lose all access to the system."
            />
        </div>
    );
}
