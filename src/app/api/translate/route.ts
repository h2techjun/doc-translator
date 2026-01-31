import { NextRequest, NextResponse } from 'next/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { createClient } from '@/lib/supabase/server';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const targetLang = formData.get('targetLang') as string || 'ko';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Auth & Points Check
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // 🌟 [POINT CALCULATION LOGIC]
        // 5 points for first 2 pages + 2 points per additional page.
        const pageCount = await OfficeTranslationEngine.getPageCount(buffer, extension);

        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 🌟 [GUEST MODE SUPPORT]
        // Guests: Up to 2 pages free (ad-monetized). More than 2 pages? Login required.
        if (user) {
            const success = await PointManager.usePoints(
                user.id,
                pointsToDeduct,
                `${file.name} 번역 (${pageCount}p, ${targetLang})`
            );

            if (!success) {
                return NextResponse.json({
                    error: '포인트가 부족합니다. 광고 시청이나 충전을 통해 포인트를 획득하세요.',
                    isPointError: true
                }, { status: 403 });
            }
        } else {
            // Guest mode limit check
            if (pageCount > POINT_COSTS.BASE_PAGES) {
                return NextResponse.json({
                    error: `게스트 모드에서는 최대 ${POINT_COSTS.BASE_PAGES}페지만 무료 번역이 가능합니다. 대용량 문서는 로그인해 주세요.`,
                    isAuthError: true
                }, { status: 403 });
            }
            console.log(`Guest translation request (Free): ${file.name} (${pageCount}p)`);
        }

        // 2. Buffer Conversion (Already done above)

        // 3. Translation Engine Execution
        // @The-Nerd: Engine handles DOCX, XLSX, PPTX, HWP
        const result = await OfficeTranslationEngine.translateFile(buffer, file.name, targetLang);

        // 4. Return Result
        // Send as downloadable file
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`translated_${file.name}`)}`);
        headers.set('X-Page-Count', result.pageCount.toString());

        return new NextResponse(result.file as any, { status: 200, headers });

    } catch (error: any) {
        console.error('Translation Error:', error);

        // 429 Quota Exceeded Handling
        if (error.message?.includes('Quota Exceeded') || error.message?.includes('429') || error.status === 429) {
            return NextResponse.json(
                { error: '⚠️ API 사용량이 초과되었습니다 (Daily/Minute Quota Exceeded). 잠시 후 다시 시도해주세요.', isQuotaError: true },
                { status: 429 }
            );
        }

        // 400 Bad Request Handling
        if (error.message?.includes('Invalid') || error.message?.includes('400')) {
            return NextResponse.json(
                { error: error.message || '잘못된 요청입니다.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: error.message || 'Translation failed',
                cause: error.cause,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
