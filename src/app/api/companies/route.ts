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

        // For this app's requirement, we allow fetching main companies for the switcher
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                logo: true,
                themeColor: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
