"use client";

import KanbanBoard from "@/components/KanbanBoard";

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
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 min-h-0">
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
