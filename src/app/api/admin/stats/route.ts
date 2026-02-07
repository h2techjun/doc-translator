
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();

    // 0. Manual Session Recovery (The Hammer Fix 🔨)
    // If standard getUser() fails, we manually parse the cookie and force the session.
    let { data: { user }, error } = await supabase.auth.getUser();

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
                        // Try parsing plain JSON first
                        const json = JSON.parse(authCookie.value);
                        tokenValue = json.access_token;
                        refreshToken = json.refresh_token;
                    } catch {
                        try {
                            // Try parsing decoded JSON
                            const json = JSON.parse(decodeURIComponent(authCookie.value));
                            tokenValue = json.access_token;
                            refreshToken = json.refresh_token;
                        } catch (e) {
                            console.error("Manual API Cookie Parse Failed:", e);
                        }
                    }

                    if (tokenValue && refreshToken) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });
                        if (recoverData.user) {
                            console.log(`[API] Manual Recovery Success: ${recoverData.user.email}`);
                            user = recoverData.user;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[API] Recovery Error:", e);
        }
    }

    // 1. Security Check
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const { isAuthorizedAdmin } = await import('@/lib/security-admin');
    
    // [Fix] Allow MASTER role as well with email fallback
    if (!isAuthorizedAdmin({ 
        id: user.id, 
        email: user.email || null, 
        role: profile?.role 
    })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Stats with Admin Client (Bypass RLS for accurately counting)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ 
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing.' 
        }, { status: 500 });
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    // Parallel fetching for performance
    const [
        { count: userCount },
        { count: jobCount },
        { count: completedJobCount },
        { count: failedJobCount }
    ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('translation_jobs').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('translation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
        supabaseAdmin.from('translation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'FAILED'),
    ]);

    // Calculate revenue estimate (Mock calculation: users * 10 or jobs * 0.5)
    const estimatedRevenue = (jobCount || 0) * 0.5;

    // Calculate Success Rate
    const successRate = jobCount ? Math.round(((completedJobCount || 0) / jobCount) * 100) : 0;

    // 3. Fetch Recent Activity (Real Data)
    const { data: recentJobs } = await supabaseAdmin
        .from('translation_jobs')
        .select('id, original_filename, status, created_at, country_code, country_name, ip_address, user_email')
        .order('created_at', { ascending: false })
        .limit(10);

    return NextResponse.json({
        totalUsers: userCount || 0,
        totalJobs: jobCount || 0,
        completedJobs: completedJobCount || 0,
        failedJobs: failedJobCount || 0,
        successRate,
        estimatedRevenue,
        recentJobs: recentJobs || []
    });
}
