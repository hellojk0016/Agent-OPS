import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Format phone number consistently
        const raw = String(phone).replace(/\D/g, "");
        const formattedPhone =
            raw.length === 12 && raw.startsWith("91")
                ? `+${raw}`
                : `+91${raw.slice(-10)}`;

        // 1. Lookup User to ensure they exist and get email
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone },
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.email) {
            return NextResponse.json({ error: 'User does not have an email address linked' }, { status: 400 });
        }

        // 2. Generate 6-digit OTP
        const otpStr = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save OTP to database (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otpToken.upsert({
            where: { phone: formattedPhone },
            update: {
                token: otpStr,
                expiresAt: expiresAt,
                createdAt: new Date(),
            },
            create: {
                phone: formattedPhone,
                token: otpStr,
                expiresAt: expiresAt,
            }
        });

        // 4. Send Email using nodemailer
        // Ensure you have EMAIL_USER and EMAIL_APP_PASSWORD in your .env
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Secure Workspace" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Security Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #00F5FF; font-size: 20px; text-align: center; background-color: #09090b; padding: 12px; border-radius: 12px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Identity Verification</h2>
                    <p style="font-size: 16px; color: #333;">Hi ${user.name || 'User'},</p>
                    <p style="font-size: 16px; color: #333;">You requested a code to reset your PIN. Please enter the following 6-digit code:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otpStr}</span>
                    </div>
                    <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this code, please ignore this email.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return NextResponse.json({ success: true, message: 'OTP sent to your registered email' });
        } catch (emailErr) {
            console.error('Nodemailer error:', emailErr);
            return NextResponse.json({ error: 'Failed to send email. Check provider settings.' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
