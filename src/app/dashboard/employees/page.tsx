import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import EmployeesClient from "./EmployeesClient";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const employees = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            companyMembership: {
                include: { company: true },
            },
        },
    });

    const serializedEmployees = employees.map((emp: any) => ({
        id: emp.id,
        name: emp.name || "Unknown",
        phone: emp.phone || "No Phone",
        role: emp.role,
        companies: emp.companyMembership.map((m: any) => m.company.name),
    }));

    return <EmployeesClient initialEmployees={serializedEmployees} />;
}
