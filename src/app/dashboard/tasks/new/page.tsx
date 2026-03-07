import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TaskForm from "./TaskForm";
import { ArrowLeft } from "lucide-react";

export default async function NewTaskPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    if (session.user.role !== 'ADMIN') {
        redirect("/dashboard");
    }

    const memberships = await prisma.companyMembership.findMany({
        where: {
            companyId: session.user.activeCompanyId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    const employees = memberships.map((m: { user: { id: string; name: string | null } }) => m.user);

    return (
        <div className="space-y-10 animate-slide-up max-w-2xl mx-auto">
            <div className="space-y-6">
                <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon-blue hover:text-zinc-100 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 text-neon-blue transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </a>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Create New Task</h1>
                    <p className="text-zinc-400">
                        Assign a new task to a team member in this workspace.
                    </p>
                </div>
            </div>

            <div className="rounded-3xl glass p-10 shadow-2xl relative overflow-hidden hover-lift">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
                <TaskForm employees={employees} />
            </div>
        </div>
    );
}
