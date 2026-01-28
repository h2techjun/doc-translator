
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 📡 작업 상태 조회 핸들러 (Production)
 * 
 * Why:
 * - Supabase DB에서 실시간 상태를 조회합니다.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const { jobId } = params;
    const supabase = await createClient();

    const { data: job, error } = await supabase
        .from('translation_jobs')
        .select('status, progress, remaining_seconds, translated_file_url, error_message, original_filename')
        .eq('id', jobId)
        .single();

    if (error || !job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
        status: job.status,
        progress: job.progress,
        remainingSeconds: job.remaining_seconds,
        translatedFileUrl: job.translated_file_url,
        errorMessage: job.error_message,
        originalFilename: job.original_filename // For correct file naming
    });
}
