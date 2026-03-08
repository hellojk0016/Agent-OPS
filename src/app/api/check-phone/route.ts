import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/check-phone?phone=XXXXXXXXXX
 * Returns { exists: true/false } — used by login page to validate
 * the phone number before showing the PIN input.
 * Does NOT return any user data.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.replace(/\D/g, "").length < 10) {
        return NextResponse.json({ exists: false });
    }

    const raw = phone.replace(/\D/g, "");
    const formattedPhone = raw.startsWith("91") && raw.length === 12
        ? `+${raw}`
        : `+91${raw.slice(-10)}`;

    const user = await prisma.user.findFirst({
        where: { phone: formattedPhone },
        select: { id: true }, // only check existence — no sensitive data
    });

    return NextResponse.json({ exists: !!user });
}
