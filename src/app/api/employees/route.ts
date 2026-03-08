import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, phone, role, companyType, pin } = body;

        if (!name || !phone || phone.length !== 10) {
            return new NextResponse("Invalid name or 10-digit phone number", { status: 400 });
        }

        if (!pin || String(pin).length < 4) {
            return new NextResponse("PIN must be at least 4 digits", { status: 400 });
        }

        const formattedPhone = `+91${phone}`;

        const existingUser = await prisma.user.findUnique({
            where: { phone: formattedPhone },
        });

        if (existingUser) {
            return new NextResponse("Phone number already registered", { status: 400 });
        }

        const generatedEmail = `${phone}@agentsops.com`;
        // password field kept for legacy admin login — employees authenticate via PIN
        const generatedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
        // Hash the admin-set PIN
        const hashedPin = await bcrypt.hash(String(pin), 10);

        const newEmployee = await prisma.user.create({
            data: {
                name,
                phone: formattedPhone,
                email: generatedEmail,
                password: generatedPassword,
                pin: hashedPin,
                pinResetRequired: true, // Employee must reset PIN on first login
                role: role === "ADMIN" ? "ADMIN" : "MEMBER",
            },
        });

        let companies = await prisma.company.findMany();

        if (companyType === "KNIGHT_WOLF") {
            companies = companies.filter(c => c.name.replace(/\s/g, "").toLowerCase() === "knightwolf");
        } else if (companyType === "COMMERCE_AGENT") {
            companies = companies.filter(c => c.name.toLowerCase().includes("commerce"));
        }

        if (companies.length > 0) {
            await prisma.companyMembership.createMany({
                data: companies.map((c) => ({
                    userId: newEmployee.id,
                    companyId: c.id,
                })),
            });
        }

        return NextResponse.json(
            {
                id: newEmployee.id,
                name: newEmployee.name,
                phone: newEmployee.phone,
                role: newEmployee.role,
                companies: companies.map((c) => c.name),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating employee:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
                        phone: true,
                    }
                }
            }
        });

        const employees = memberships.map((m) => m.user);

        return NextResponse.json(employees);
    } catch (error) {
        console.error("Fetch employees error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
