import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const tasks = await prisma.task.findMany({
        where: {
            companyId: session.user.activeCompanyId,
            ...(session.user.role === "MEMBER" ? { assigneeId: session.user.id } : {}),
        },
        include: {
            assignee: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Kanban Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <KanbanBoard
                    tasks={tasks.map((t: any) => ({
                        ...t,
                        createdAt: new Date(t.createdAt)
                    }))}
                    userId={session.user.id}
                    userRole={session.user.role}
                />
            </div>
        </div>
    );
}
