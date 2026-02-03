
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Service Role Client for Admin Operations
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const id = params.userId;
        const body = await req.json();
        const { points, tier, role } = body;

        // 1. Authenticate Admin
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

        // 2. Update User Profile
        const supabaseAdmin = getAdminClient();
        const updateData: any = {};

        if (points !== undefined) updateData.points = points;
        if (tier !== undefined) updateData.tier = tier;
        if (role !== undefined) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No data to update' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[Admin API] Update Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('[Admin API] Unexpected Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
