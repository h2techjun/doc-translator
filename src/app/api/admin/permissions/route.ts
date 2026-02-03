
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Only MASTER can manage permissions
    if (profile?.role !== 'MASTER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('admin_permissions')
        .select(`
            *,
            user:profiles!user_id(full_name, email)
        `);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'MASTER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, permission, action } = await req.json();

    if (action === 'ADD') {
        const { error } = await supabase
            .from('admin_permissions')
            .insert({
                user_id: userId,
                permission,
                granted_by: user.id
            });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
        const { error } = await supabase
            .from('admin_permissions')
            .delete()
            .match({ user_id: userId, permission });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
