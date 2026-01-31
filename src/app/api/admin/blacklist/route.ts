
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List Blacklisted IPs
export async function GET(req: NextRequest) {
    const supabaseAdmin = getAdminClient();
    const { data: { user } } = await createServerClient().then(c => c.auth.getUser());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from('ip_blacklist')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST: Ban IP
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { ip_address, reason } = body;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from('ip_blacklist')
        .insert({
            ip_address,
            reason,
            created_by: user.id
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log it
    await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action: 'BAN_IP',
        target_resource: ip_address,
        details: { reason },
        ip_address: req.headers.get('x-forwarded-for')
    });

    return NextResponse.json(data);
}

// DELETE: Unban IP
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get('ip');

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('ip_blacklist')
        .delete()
        .eq('ip_address', ip);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log it
    await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action: 'UNBAN_IP',
        target_resource: ip,
        ip_address: req.headers.get('x-forwarded-for')
    });

    return NextResponse.json({ success: true });
}
