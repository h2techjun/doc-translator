
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List Reports
export async function GET(req: NextRequest) {
    const supabase = await createServerClient();
    // 0. Manual Session Recovery (The Hammer Fix 🔨)
    const { getSafeUser } = await import('@/lib/supabase/auth-recovery');
    const user = await getSafeUser(req, supabase);

    if (!user) return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { isAuthorizedAdmin } = await import('@/lib/security-admin');
    if (!isAuthorizedAdmin({ 
        id: user.id, 
        email: user.email || null, 
        role: profile?.role 
    })) {
        return NextResponse.json({ error: '접근 권한이 없습니다 (관리자 이상의 권한 필요).' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from('user_reports')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// PATCH: Resolve Report
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { report_id, status, resolution_notes } = body;

    const supabase = await createServerClient();
    // 0. Manual Session Recovery (The Hammer Fix 🔨)
    const { getSafeUser } = await import('@/lib/supabase/auth-recovery');
    const user = await getSafeUser(req, supabase);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { isAuthorizedAdmin } = await import('@/lib/security-admin');
    if (!isAuthorizedAdmin({ 
        id: user.id, 
        email: user.email || null, 
        role: profile?.role 
    })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from('user_reports')
        .update({
            status,
            resolution_notes,
            resolved_by: user.id,
            resolved_at: new Date().toISOString()
        })
        .eq('id', report_id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit Log
    await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action: 'RESOLVE_REPORT',
        target_resource: `report/${report_id}`,
        details: { status, resolution_notes },
        ip_address: req.headers.get('x-forwarded-for')
    });

    return NextResponse.json(data);
}
