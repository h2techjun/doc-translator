
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
    // 1. Authenticate Admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER') {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 2. Fetch Logs (Query Profiles to get admin names)
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('admin_actions_log')
        .select(`
            *,
            admin:profiles!admin_id(full_name, email),
            target:profiles!target_user_id(full_name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        pagination: {
            page,
            limit,
            total: count
        }
    });
}
