
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 📡 작업 상태 조회 핸들러 (Production)
 * 
 * Why:
 * - Supabase DB에서 실시간 상태를 조회합니다.
 */
import { StorageManager } from '@/lib/supabase/storage';

/**
 * 📡 작업 상태 조회 핸들러 (Production)
 * 
 * Why:
 * - Supabase DB에서 실시간 상태를 조회합니다.
 * - [보안] Supabase Storage Path를 Signed URL로 변환하여 반환합니다.
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

    // 🌟 Storage Path -> Signed URL 변환 (보안 강화)
    let downloadUrl = job.translated_file_url;

    // URL이 아니고 Path인 경우 (http로 시작하지 않음)
    if (downloadUrl && !downloadUrl.startsWith('http') && job.status === 'COMPLETED') {
        try {
            downloadUrl = await StorageManager.getSignedUrl(downloadUrl);
        } catch (e) {
            console.warn(`[StatusAPI] Signed URL creation failed for ${downloadUrl}`, e);
            // 서명 실패 시 null 처리하거나 원본 반환 (클라이언트에서 에러 처리)
        }
    }

    return NextResponse.json({
        status: job.status,
        progress: job.progress,
        remainingSeconds: job.remaining_seconds,
        translatedFileUrl: downloadUrl,
        errorMessage: job.error_message,
        error: job.error_message, // 🔧 Add alias for frontend compatibility
        originalFilename: job.original_filename
    });
}
