
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

    // 2. Fetch Jobs
    const supabaseAdmin = getAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 2. Fetch Jobs Safely (No Join to prevent data loss)
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

    // 3. Fetch User Emails independently
    const userIds = Array.from(new Set(rawJobs.map(j => j.user_id).filter(Boolean)));
    const { data: userProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

    const emailMap = Object.fromEntries((userProfiles || []).map(p => [p.id, p.email]));

    // 4. Final Transform with Field Mapping (Using actual DB columns)
    const transformedData = rawJobs.map(job => ({
        id: job.id,
        original_filename: job.original_filename || 'No Name', // DB: original_filename
        user_email: emailMap[job.user_id] || 'Unknown User',
        file_type: job.file_type || 'File',
        target_lang: job.target_lang || 'EN', // DB: target_lang
        status: job.status,
        progress: job.progress || 0,
        created_at: job.created_at,
        translated_file_url: job.translated_file_url || null, // DB: translated_file_url
        error_message: job.error_message || (job.status === 'FAILED' ? 'Translation Error' : null)
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
