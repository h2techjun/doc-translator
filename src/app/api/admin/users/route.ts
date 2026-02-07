
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Service Role Client for Admin Operations (Lazy initialized to avoid build-time errors)
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    // 1. Authenticate Admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // 2. Fetch Users from View with Filters
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ 
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Check environment variables.' 
        }, { status: 500 });
    }

    const supabaseAdmin = getAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role');
    const tierFilter = searchParams.get('tier');
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
        .from('admin_users_view')
        .select('*', { count: 'exact' });

    // Apply Search (Case insensitive handled by ilike in Postgres)
    if (search) {
        // [Fix] id.eq.${search} can fail if search is not a valid UUID.
        // We use text casting for safer comparison.
        query = query.or(`email.ilike.%${search}%,id::text.ilike.%${search}%`);
    }

    // Apply Filters
    if (roleFilter && roleFilter !== 'ALL') {
        query = query.eq('role', roleFilter);
    }
    if (tierFilter && tierFilter !== 'ALL') {
        query = query.eq('tier', tierFilter);
    }

    const { data, error, count } = await query
        .order('signed_up_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('[Admin Users API Error]:', error);
        return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
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
