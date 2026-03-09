import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { phone, token } = await request.json();

        if (!phone || !token) {
            return NextResponse.json({ error: 'Phone and OTP token are required' }, { status: 400 });
        }

        // Verify the OTP via Supabase
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // If verification is successful, Supabase returns a session or user data.
        // We can return a success indicator. The client will then show the reset PIN form.
        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            // We might want to pass a temporary access token or session if needed, 
            // but for this simple PIN reset, successful verification is enough to proceed to step 3.
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
