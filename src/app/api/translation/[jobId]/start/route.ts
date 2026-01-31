
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';
// import { CreditManager } from '@/lib/payment/credit-manager';
// import { CREDIT_COSTS } from '@/lib/payment/types';

/**
 * 🚀 번역 시작 핸들러 (Production)
 * 
 * Why:
 * - Supabase Storage에서 파일을 받아오고, 실제 번역 엔진을 구동합니다.
 * - 수익화(Credit) 로직이 포함될 위치입니다.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const { jobId } = params;

    try {
        const body = await req.json();
        const { targetLang } = body;

        console.log(`[Job: ${jobId}] 🚀 번역 작업 시작 (Production)`);

        const supabase = await createClient();

        // 1. 작업 조회
        const { data: job, error: jobError } = await supabase
            .from('translation_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: '작업을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 2. 파일 다운로드
        const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('documents')
            .download(job.original_file_path);

        if (downloadError || !fileData) {
            throw new Error(`파일 다운로드 실패: ${downloadError.message}`);
        }

        const fileBuffer = Buffer.from(await fileData.arrayBuffer());

        // 5. [수익화] 페이지 수 감지 및 포인트 차감
        const extension = job.original_filename.split('.').pop()?.toLowerCase() || '';
        const pageCount = await OfficeTranslationEngine.getPageCount(fileBuffer, extension);

        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const success = await PointManager.usePoints(
                user.id,
                pointsToDeduct,
                `${job.original_filename} Drive 번역 (${pageCount}p)`
            );

            if (!success) {
                throw new Error('포인트가 부족합니다. 광고 시청이나 충전을 통해 포인트를 획득하세요.');
            }
        } else {
            // Guest mode limit check
            if (pageCount > POINT_COSTS.BASE_PAGES) {
                throw new Error(`게스트 모드에서는 최대 ${POINT_COSTS.BASE_PAGES}페지만 무료 번역이 가능합니다. 대용량 문서는 로그인해 주세요.`);
            }
            console.log(`Guest Drive translation free tier: ${job.original_filename} (${pageCount}p)`);
        }

        // 상태 업데이트
        await supabase
            .from('translation_jobs')
            .update({ status: 'PROCESSING', progress: 10 })
            .eq('id', jobId);

        // 3. 번역 엔진 구동
        const result = await OfficeTranslationEngine.translateFile(
            fileBuffer,
            job.original_filename,
            targetLang || job.target_lang
        );

        await supabase.from('translation_jobs').update({ progress: 80 }).eq('id', jobId);

        // 4. 결과 업로드
        // Sanitize output path (Korean characters cause 400 Invalid Key error)
        const fileExt = job.original_filename.split('.').pop() || 'docx';
        const safeTranslatedName = `translated_file.${fileExt}`;
        const translatedPath = `${jobId}/${safeTranslatedName}`;

        console.log(`[Job: ${jobId}] 결과 업로드 시도: ${translatedPath}, 크기: ${result.file.byteLength}`);

        const { error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(translatedPath, result.file, {
                contentType: 'application/octet-stream',
                upsert: true
            });

        if (uploadError) {
            console.error(`[Job: ${jobId}] 결과 업로드 실패 (Storage):`, uploadError);
            throw new Error(`결과 업로드 실패: ${uploadError.message}`);
        }

        // 5. URL 생성 및 완료 처리
        const { data: publicUrlData } = supabase
            .storage
            .from('documents')
            .getPublicUrl(translatedPath);

        await supabase
            .from('translation_jobs')
            .update({
                status: 'COMPLETED',
                progress: 100,
                translated_file_path: translatedPath,
                translated_file_url: publicUrlData.publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);

        console.log(`[Job: ${jobId}] ✅ 번역 완료`);
        return NextResponse.json({ success: true, jobId });

    } catch (error: any) {
        console.error(`[Job: ${jobId}] ❌ 작업 실패:`, error);

        const supabase = await createClient();
        await supabase
            .from('translation_jobs')
            .update({
                status: 'FAILED',
                error_message: error.message,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
