"use client";

import { useState } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import CreateTaskModal from "@/components/CreateTaskModal";
import {
    Layout,
    PlusSquare
} from "lucide-react";

interface DashboardClientProps {
    tasks: any[];
    session: any;
    employees: any[];
}

export default function DashboardClient({ tasks, session, employees }: DashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-10 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-6">
                <div className="flex items-center gap-3">
                    {session.user.role === "ADMIN" && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                        >
                            <PlusSquare className="w-4 h-4" />
                            Assign Task
                        </button>
                    )}
                </div>
            </div>

            {/* Kanban Section */}
            <div className="space-y-6 overflow-hidden">
                <KanbanBoard
                    tasks={tasks}
                    userId={session.user.id}
                    userRole={session.user.role}
                />
            </div>

            {/* Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
            />
        </div>
    );
}
