"use client";

import { useState } from "react";
import { PlusCircle, Trash2, UserCircle, Loader2 } from "lucide-react";
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
        if (!confirm("Are you sure you want to remove this employee? They will lose access to the system.")) return;
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
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800/50">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Team Members</h1>
                    <p className="text-sm text-zinc-400 mt-1">Manage personnel and their system access.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-neon-blue hover:bg-neon-blue/90 text-zinc-950 px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-neon-blue/20 transition-all"
                >
                    <PlusCircle className="w-5 h-5 text-zinc-950" />
                    Add Member
                </button>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden glass">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 border-b border-zinc-800/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone / Sign In</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workspaces</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group hover-lift">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                                <UserCircle className="w-6 h-6 text-neon-blue" />
                                            </div>
                                            <span className="font-semibold text-zinc-100">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300 font-mono tracking-wide">
                                        {emp.phone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${emp.role === "ADMIN" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {emp.companies.map(c => (
                                                <span key={c} className="text-xs bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-300 border border-zinc-700">
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
                                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting === emp.id ? <Loader2 className="w-5 h-5 animate-spin text-neon-blue" /> : <Trash2 className="w-5 h-5 text-neon-blue" />}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No employees found. click "Add Member" to invite someone.
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
