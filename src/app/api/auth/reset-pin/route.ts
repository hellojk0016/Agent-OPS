import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { phone, newPin } = await request.json();

        if (!phone || !newPin) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Format phone number consistently
        const raw = String(phone).replace(/\D/g, "");
        const formattedPhone =
            raw.length === 12 && raw.startsWith("91")
                ? `+${raw}`
                : `+91${raw.slice(-10)}`;

        // 1. Hash the new PIN
        const hashedPin = await bcrypt.hash(newPin, 10);

        // 2. Update the user in the database
        await prisma.user.update({
            where: { phone: formattedPhone },
            data: {
                pin: hashedPin,
                pinResetRequired: false
            },
        });

        return NextResponse.json({ success: true, message: 'PIN reset successfully' });
    } catch (error) {
        console.error('Error resetting PIN:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
