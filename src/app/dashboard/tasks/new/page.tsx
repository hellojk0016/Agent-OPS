import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import NewTaskClient from "./NewTaskClient";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const activeCompanyId = session.user.activeCompanyId;

    const memberships = await prisma.companyMembership.findMany({
        where: {
            companyId: activeCompanyId,
            user: { role: "MEMBER" }
        },
        include: {
            user: {
                select: { id: true, name: true }
            }
        },
        orderBy: {
            user: { name: "asc" }
        }
    });

    const employees = memberships.map(m => m.user);

    return <NewTaskClient employees={employees} />;
}
