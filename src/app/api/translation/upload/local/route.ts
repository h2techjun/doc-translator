import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';
import { StorageManager } from '@/lib/supabase/storage';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const targetLang = formData.get('targetLang') as string || 'ko';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // 1. Validation & Points
        const pageCount = await OfficeTranslationEngine.getPageCount(buffer, extension);
        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const success = await PointManager.usePoints(
                user.id,
                pointsToDeduct,
                `[Queue] ${file.name} 번역 (${pageCount}p)`
            );
            if (!success) {
                return NextResponse.json({ error: '포인트 부족', isPointError: true }, { status: 403 });
            }
        } else {
            if (pageCount > POINT_COSTS.BASE_PAGES) {
                return NextResponse.json({
                    error: `게스트 제한 초과 (${POINT_COSTS.BASE_PAGES}p). 로그인 필요.`,
                    isAuthError: true
                }, { status: 403 });
            }
        }

        const userId = user ? user.id : undefined; // Guest allows undefined (if DB schema allows null user_id)

        // 2. Create Job (UPLOADING)
        // Guest의 경우 RLS 때문에 insert가 안될 수 있으므로, 
        // 서비스 키를 쓰거나 Guest용 정책이 필요함.
        // 일단은 Authenticated User Flow로 가정.
        if (!userId) {
            // Guest를 위한 임시 처리가 없다면 에러
            // return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
            console.warn("Guest Upload Attempt - Proceeding without UserID (May fail if RLS blocks)");
        }

        const { data: job, error: jobError } = await supabase
            .from('translation_jobs')
            .insert({
                user_id: userId,
                original_filename: file.name,
                file_extension: extension,
                target_lang: targetLang,
                status: 'UPLOADING',
                page_count: pageCount,
                file_size: buffer.length
            })
            .select()
            .single();

        if (jobError || !job) {
            // RLS Error for Guest -> Return 401
            if (!userId && jobError?.code === '42501') {
                return NextResponse.json({ error: '로그인이 필요합니다.', isAuthError: true }, { status: 401 });
            }
            throw new Error(`Job creation failed: ${jobError?.message}`);
        }

        const jobId = job.id;

        // 3. Upload to Storage
        const inputPath = await StorageManager.uploadInputFile(userId || 'guest', jobId, file);
        if (!inputPath) throw new Error("Storage upload failed");

        // 4. Update Job (UPLOADED)
        await supabase
            .from('translation_jobs')
            .update({
                status: 'UPLOADED',
                original_file_path: inputPath,
                progress: 10
            })
            .eq('id', jobId);

        return NextResponse.json({ jobId, status: 'UPLOADED' });

    } catch (error: any) {
        console.error('Upload Local Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
