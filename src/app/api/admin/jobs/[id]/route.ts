
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 0. Manual Session Recovery (The Hammer Fix 🔨)
        const supabase = await createServerClient();
        const { getSafeUser } = await import('@/lib/supabase/auth-recovery');
        const user = await getSafeUser(req, supabase);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { isAuthorizedAdmin } = await import('@/lib/security-admin');
        if (!isAuthorizedAdmin({ 
            id: user.id, 
            email: user.email || null, 
            role: profile?.role 
        })) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const supabaseAdmin = getAdminClient();

        // Delete job entry
        const { error } = await supabaseAdmin
            .from('translation_jobs')
            .delete()
            .eq('id', params.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
