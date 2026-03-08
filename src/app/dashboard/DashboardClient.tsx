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
        <div className="animate-slide-up h-full">
            <KanbanBoard
                tasks={tasks}
                userId={session.user.id}
                userRole={session.user.role}
                employees={employees}
            />
        </div>
    );
}
