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

    const employees = await prisma.user.findMany({
        where: { role: "MEMBER" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return <NewTaskClient employees={employees} />;
}
