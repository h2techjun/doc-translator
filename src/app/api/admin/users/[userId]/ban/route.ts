
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Service Role Client for Admin Operations
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const userId = params.userId;
    const body = await req.json();
    const { status, reason, bannedUntil } = body;

    // 1. Authenticate Admin (Server Client)
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'ADMIN' && adminProfile?.role !== 'MASTER') {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 2. Perform Admin Action (Admin Client)
    const supabaseAdmin = getAdminClient();

    // Update Profile Status
    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
            status,
            ban_reason: reason,
            banned_until: bannedUntil || null
        })
        .eq('id', userId);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Log the Action
    await supabaseAdmin.from('admin_actions_log').insert({
        admin_id: user.id,
        action_type: status === 'BANNED' ? 'BAN_USER' : status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
        target_user_id: userId,
        details: { reason, bannedUntil }
    });

    return NextResponse.json({ success: true, message: `사용자 상태가 ${status}로 변경되었습니다.` });
}
