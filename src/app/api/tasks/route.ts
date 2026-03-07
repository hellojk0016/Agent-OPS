import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this company
    const hasAccess = session.user.role === 'ADMIN' ||
        session.user.memberships.some(m => m.companyId === session.user.activeCompanyId);

    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
        where: {
            companyId: session.user.activeCompanyId,
        },
        include: {
            assignee: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only ADMIN can create tasks
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
        }

        const { title, description, assigneeId, displayId, priority, dueDate, companyType } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                displayId,
                title,
                description,
                assigneeId: assigneeId || null,
                companyId: session.user.activeCompanyId,
                priority: priority || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
                companyType: companyType || "BOTH",
            },
            include: {
                assignee: true,
            },
        });

        // WhatsApp Alert Simulation
        if (task.assigneeId && task.assignee?.phone) {
            console.log(`[WHATSAPP ALERT] Sending message to ${task.assignee.phone}: 
            "Hello ${task.assignee.name}, a new task has been assigned to you: ${task.title} (ID: ${task.displayId}). Check your dashboard for details!"`);
        } else if (task.assigneeId) {
            console.log(`[WHATSAPP ALERT] Could not send alert to User ${task.assigneeId} - No phone number found.`);
        }

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Task creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
        }

        // Fetch task to check ownership
        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // PERMISSION LOGIC:
        // Admin can update any task in the company
        // Member can only update tasks assigned to them
        const canUpdate = session.user.role === 'ADMIN' ||
            (session.user.role === 'MEMBER' && task.assigneeId === session.user.id);

        if (!canUpdate) {
            return NextResponse.json({ error: "Forbidden - You can only update your own tasks" }, { status: 403 });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error("Task update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only ADMIN can delete tasks
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Task deletion error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
