import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { phone, token } = await request.json();

        if (!phone || !token) {
            return NextResponse.json({ error: 'Phone and OTP token are required' }, { status: 400 });
        }

        // Format phone number consistently
        const raw = String(phone).replace(/\D/g, "");
        const formattedPhone =
            raw.length === 12 && raw.startsWith("91")
                ? `+${raw}`
                : `+91${raw.slice(-10)}`;

        // Find the OTP token in the DB
        const otpRecord = await prisma.otpToken.findUnique({
            where: { phone: formattedPhone }
        });

        if (!otpRecord) {
            return NextResponse.json({ error: 'No OTP found for this number. Please request a new one.' }, { status: 400 });
        }

        // Check if token matches
        if (otpRecord.token !== token) {
            return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
        }

        // Check expiration
        if (new Date() > otpRecord.expiresAt) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Success: Delete the OTP to prevent reuse
        await prisma.otpToken.delete({
            where: { phone: formattedPhone }
        });

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
