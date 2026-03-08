import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * POST /api/pin-reset
 * Called after OTP is verified on the client — sets a new hashed PIN.
 * Body: { firebaseToken, phone, newPin }
 */
export async function POST(req: Request) {
    try {
        const { firebaseToken, phone, newPin } = await req.json();

        if (!firebaseToken || !phone || !newPin) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (String(newPin).length < 4) {
            return NextResponse.json({ error: "PIN must be at least 4 digits" }, { status: 400 });
        }

        // Verify Firebase token server-side
        const { adminAuth } = await import("@/lib/firebase-admin");
        await adminAuth.verifyIdToken(firebaseToken);

        // Normalise phone
        const raw = String(phone).replace(/\D/g, "");
        const formattedPhone = raw.startsWith("91") && raw.length === 12
            ? `+${raw}`
            : `+91${raw.slice(-10)}`;

        const user = await prisma.user.findFirst({ where: { phone: formattedPhone } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const hashedPin = await bcrypt.hash(String(newPin), 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                pin: hashedPin,
                pinResetRequired: false, // Mark reset as done
            },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("PIN reset error:", err);
        return NextResponse.json({ error: "Failed to reset PIN" }, { status: 500 });
    }
}

/**
 * PATCH /api/pin-reset
 * Authenticated route — let a logged-in user change their own PIN.
 * Body: { currentPin, newPin }
 */
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPin, newPin } = await req.json();

        if (!currentPin || !newPin || String(newPin).length < 4) {
            return NextResponse.json({ error: "Current PIN and new PIN (4+ digits) required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.pin) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const currentValid = await bcrypt.compare(String(currentPin), user.pin);
        if (!currentValid) {
            return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 403 });
        }

        const hashedPin = await bcrypt.hash(String(newPin), 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { pin: hashedPin, pinResetRequired: false },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("PIN change error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
