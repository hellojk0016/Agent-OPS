"use client";

import { useState } from "react";
import { PlusCircle, Trash2, UserCircle, Loader2, Users, Building } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { useRouter } from "next/navigation";

interface Employee {
    id: string;
    name: string;
    phone: string;
    role: string;
    companies: string[];
}

export default function EmployeesClient({ initialEmployees }: { initialEmployees: Employee[] }) {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this employee? They will lose access.")) return;
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error deleting employee");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-muted)]">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Team Members</h1>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neon-blue/50" />
                        Manage personnel and system access
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-muted)", background: "var(--bg-elevated)" }}>
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
                                                onClick={() => handleDelete(emp.id)}
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
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <Users className="w-8 h-8 text-neon-blue/20 mx-auto mb-3" />
                                        <p className="text-sm text-zinc-600">No members yet. Click <span className="text-neon-blue/70">Add Member</span> to invite someone.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
        </div>
    );
}
