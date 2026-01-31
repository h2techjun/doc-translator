import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        return NextResponse.json({ notifications: data || [], unread_count: count || 0 });
    } catch (err: any) {
        console.error('[API Notifications] GET error:', err);
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, all } = await req.json();

        if (all) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
        } else if (id) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[API Notifications] PATCH error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
