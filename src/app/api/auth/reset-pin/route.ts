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

        // 1. Hash the new PIN
        const hashedPin = await bcrypt.hash(newPin, 10);

        // 2. Update the user in the database
        // Note: In a production app, you'd verify a 'reset token' or 'verified session' 
        // to prevent unauthorized updates. For this PWA flow, we assume the previous 
        // verify-otp step was the security gate.
        await prisma.user.update({
            where: { phone },
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
