"use client";

import KanbanBoard from "@/components/KanbanBoard";
import { 
    Kanban
} from "lucide-react";
import { cn } from "@/lib/utils";


interface Employee {
    id: string;
    name: string | null;
}

interface DashboardClientProps {
    tasks: any[];
    session: any;
    employees?: Employee[];
}

export default function DashboardClient({ tasks, session, employees = [] }: DashboardClientProps) {
    return (
        <div className="flex flex-col h-full bg-[#0d0d0f]">
            {/* Header Area */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Kanban className="w-5 h-5 text-neon-blue" />
                    <h1 className="text-lg font-bold tracking-tight text-white uppercase tracking-[0.1em]">
                        Task Board
                    </h1>
                </div>

            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    tasks={tasks}
                    userId={session.user.id}
                    userRole={session.user.role}
                    employees={employees}
                />
            </div>
        </div>
    );
}
