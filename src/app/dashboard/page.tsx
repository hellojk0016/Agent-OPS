import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

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
        <DashboardClient
            tasks={tasks.map((t: any) => ({
                ...t,
                createdAt: new Date(t.createdAt)
            }))}
            session={session}
        />
    );
}
