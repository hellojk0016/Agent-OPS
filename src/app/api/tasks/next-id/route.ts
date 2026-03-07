import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the task with the highest numeric ID part within the current company
        const lastTask = await prisma.task.findFirst({
            where: {
                companyId: session.user.activeCompanyId,
                displayId: {
                    startsWith: "TASK-",
                },
            },
            orderBy: {
                displayId: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastTask && lastTask.displayId) {
            const matches = lastTask.displayId.match(/TASK-(\d+)/);
            if (matches && matches[1]) {
                nextNumber = parseInt(matches[1]) + 1;
            }
        }

        const nextId = `TASK-${String(nextNumber).padStart(3, '0')}`;

        return NextResponse.json({ nextId });
    } catch (error) {
        console.error("Fetch next-id error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
