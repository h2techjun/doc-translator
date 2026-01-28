import { NextRequest, NextResponse } from 'next/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const targetLang = formData.get('targetLang') as string || 'ko';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Auth & Points Check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
        }

        // 포인트 차감 시도
        const { PointManager } = await import('@/lib/payment/point-manager');
        const success = await PointManager.usePoints(
            user.id,
            5,
            `${file.name} 번역 (${targetLang})`
        );

        if (!success) {
            return NextResponse.json({
                error: '포인트가 부족합니다. 광고 시청이나 충전을 통해 포인트를 획득하세요.',
                isPointError: true
            }, { status: 403 });
        }

        // 2. Buffer Conversion
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Translation Engine Execution
        // @The-Nerd: Engine handles DOCX, XLSX, PPTX, HWP
        const result = await OfficeTranslationEngine.translateFile(buffer, file.name, targetLang);

        // 4. Return Result
        // Send as downloadable file
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`translated_${file.name}`)}`);
        headers.set('X-Page-Count', result.pageCount.toString());

        return new NextResponse(result.file, { status: 200, headers });

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
            { error: error.message || 'Translation failed' },
            { status: 500 }
        );
    }
}
