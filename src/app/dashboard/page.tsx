import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import {
    CheckCircle2,
    Clock,
    ListTodo,
    TrendingUp,
    Layout,
    PlusSquare
} from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const tasks = await prisma.task.findMany({
        where: {
            companyId: session.user.activeCompanyId,
        },
        include: {
            assignee: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-10 animate-slide-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
                            <Layout className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Workspace Board</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white italic">Project Sprint</h1>
                    <p className="text-zinc-400 max-w-2xl">
                        {session.user.role === "ADMIN"
                            ? "Manage your multi-tenant tasks using the agile Kanban board."
                            : "Track your assigned sprint tasks and update progress in real-time."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {session.user.role === "ADMIN" && (
                        <a
                            href="/dashboard/tasks/new"
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                        >
                            <PlusSquare className="w-4 h-4" />
                            Assign Task
                        </a>
                    )}
                </div>
            </div>

            {/* Kanban Section */}
            <div className="space-y-6 overflow-hidden">
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
