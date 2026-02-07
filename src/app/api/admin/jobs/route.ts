
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Service Role Client (Lazy initialized to avoid build-time errors)
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

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
                            console.error("[Jobs API] Manual Cookie Parse Failed:", e);
                        }
                    }
                    if (tokenValue && refreshToken) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });
                        if (recoverData.user) {
                            console.log(`[Jobs API] Manual Recovery Success: ${recoverData.user.email}`);
                            user = recoverData.user;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[Jobs API] Recovery logic failed:", e);
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

    // 2. Fetch Jobs
    const supabaseAdmin = getAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 2. Fetch Jobs Safely (Independent Query to avoid Join Loss)
    const { data: rawJobs, error: jobsError, count } = await supabaseAdmin
        .from('translation_jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (jobsError) {
        console.error("[Jobs API] Fetch Error:", jobsError);
        return NextResponse.json({ error: jobsError.message }, { status: 500 });
    }

    if (!rawJobs || rawJobs.length === 0) {
        return NextResponse.json({ data: [], pagination: { page, limit, total: 0 } });
    }

    // 3. Batch Fetch User Emails to map them
    const userIds = Array.from(new Set(rawJobs.map(j => j.user_id).filter(Boolean)));
    const { data: userProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

    const emailMap = Object.fromEntries((userProfiles || []).map(p => [p.id, p.email]));

    // 4. Final Transform with Safety
    const transformedData = rawJobs.map(job => ({
        id: job.id,
        original_filename: job.file_name || 'No Name', // DB: file_name -> FE: original_filename
        user_email: emailMap[job.user_id] || 'Unknown User',
        file_type: 'File',
        target_lang: job.target_language || 'EN',
        status: job.status,
        progress: job.progress,
        created_at: job.created_at,
        translated_file_url: job.result_url || null,
        error_message: job.status === 'FAILED' ? 'Translation Error' : null
    }));

    return NextResponse.json({
        data: transformedData,
        pagination: {
            page,
            limit,
            total: count || 0
        }
    });
}
