import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Trigger Supabase OTP sending
        // Note: This requires SMS provider setup in Supabase Dashboard
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                shouldCreateUser: false, // Ensure we only send to existing employees
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
