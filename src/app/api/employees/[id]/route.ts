import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const employeeId = params.id;

        if (!employeeId) {
            return new NextResponse("Employee ID is required", { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (session.user.id === employeeId) {
            return new NextResponse("Cannot delete yourself", { status: 400 });
        }

        await prisma.user.delete({
            where: { id: employeeId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting employee:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
