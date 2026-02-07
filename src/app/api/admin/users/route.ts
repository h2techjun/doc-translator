import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Service Role Client for Admin Operations
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    // 0. Manual Session Recovery (The Hammer Fix 🔨)
    const supabase = await createServerClient();
    let { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
            if (projectId) {
                const cookieName = `sb-${projectId}-auth-token`;
                const authCookie = req.cookies.get(cookieName);

                if (authCookie) {
                    let tokenValue: string | undefined;
                    let refreshToken: string | undefined;
                    try {
                        const json = JSON.parse(authCookie.value);
                        tokenValue = json.access_token;
                        refreshToken = json.refresh_token;
                    } catch {
                        try {
                            const json = JSON.parse(decodeURIComponent(authCookie.value));
                            tokenValue = json.access_token;
                            refreshToken = json.refresh_token;
                        } catch (e) {
                            console.error("[Users API] Manual Cookie Parse Failed:", e);
                        }
                    }

                    if (tokenValue && refreshToken) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });
                        if (recoverData.user) {
                            console.log(`[Users API] Manual Recovery Success: ${recoverData.user.email}`);
                            user = recoverData.user;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[Users API] Recovery logic failed:", e);
        }
    }

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

    // 2. Fetch Users from Profiles Table (The Source of Truth)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ 
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing.' 
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

    console.log(`[Admin Users API] Querying profiles for ${limit} users (Page ${page})`);

    let query = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' });

    // Apply Simple Search if provided
    if (search && search.trim() !== '') {
        query = query.ilike('email', `%${search}%`);
    }

    // Apply Basic Filters
    if (roleFilter && roleFilter !== 'ALL') {
        query = query.eq('role', roleFilter);
    }
    if (tierFilter && tierFilter !== 'ALL') {
        query = query.eq('tier', tierFilter);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('[Admin Users API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data: data || [],
        pagination: {
            page,
            limit,
            total: count || 0
        }
    });
}
