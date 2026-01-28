import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Call the secure RPC function
        const { data, error } = await supabase.rpc('check_user_status', {
            email_input: email
        });

        if (error) {
            console.error('RPC Error:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        // data is already { exists: boolean, confirmed: boolean }
        return NextResponse.json(data);

    } catch (error) {
        console.error('Check API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
