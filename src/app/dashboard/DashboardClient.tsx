import KanbanBoard from "@/components/KanbanBoard";

interface DashboardClientProps {
    tasks: any[];
    session: any;
}

export default function DashboardClient({ tasks, session }: DashboardClientProps) {
    return (
        <div className="animate-slide-up h-full">
            <KanbanBoard
                tasks={tasks}
                userId={session.user.id}
                userRole={session.user.role}
            />
        </div>
    );
}
