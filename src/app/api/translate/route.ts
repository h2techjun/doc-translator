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

        // 1. Auth Check (Optional for MVP free tier, but good for rate limiting)
        const supabase = await createClient();
        /* 
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        */

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
        headers.set('Content-Disposition', `attachment; filename="translated_${file.name}"`);
        headers.set('X-Page-Count', result.pageCount.toString());

        return new NextResponse(result.file, { status: 200, headers });

    } catch (error: any) {
        console.error('Translation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Translation failed' },
            { status: 500 }
        );
    }
}
