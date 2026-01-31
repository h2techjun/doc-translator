
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. GET Settings
export async function GET(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Auth Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('*')
        .order('key');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Transform array to object for easier frontend consumption
    const settingsMap = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return NextResponse.json(settingsMap);
}

// 2. PATCH Settings
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { key, value } = body;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();

    // Update Setting
    const { data, error } = await supabaseAdmin
        .from('system_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // [AUDIT LOG]
    await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action: 'UPDATE_SETTINGS',
        target_resource: `system_settings/${key}`,
        details: { value },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, data });
}
