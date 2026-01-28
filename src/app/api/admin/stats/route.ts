
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();

    // 1. Security Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Stats
    // Parallel fetching for performance
    const [
        { count: userCount },
        { count: jobCount },
        { count: completedJobCount },
        { count: failedJobCount }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('translation_jobs').select('*', { count: 'exact', head: true }),
        supabase.from('translation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
        supabase.from('translation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'FAILED'),
    ]);

    // Calculate revenue estimate (Mock calculation: users * 10 or jobs * 0.5)
    // This will be replaced by actual payment table query later
    const estimatedRevenue = (jobCount || 0) * 0.5;

    // Calculate Success Rate
    const successRate = jobCount ? Math.round(((completedJobCount || 0) / jobCount) * 100) : 0;

    return NextResponse.json({
        totalUsers: userCount || 0,
        totalJobs: jobCount || 0,
        completedJobs: completedJobCount || 0,
        failedJobs: failedJobCount || 0,
        successRate,
        estimatedRevenue
    });
}
