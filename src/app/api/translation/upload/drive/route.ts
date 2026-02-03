
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';
import { OfficeTranslationEngine } from '@/lib/translation/engine';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileId, accessToken, filename, mimeType, sizeBytes, targetLang } = body;

        if (!fileId || !accessToken || !targetLang) {
            return NextResponse.json({ error: 'Missing required fields (fileId, accessToken, targetLang)' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '인증되지 않은 사용자입니다. 구글 드라이브 업로드는 로그인이 필요합니다.' }, { status: 401 });
        }
        
        // 1. Download from Google Drive (Moved up for Page Count calculation)
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const fileBuffer = Buffer.from(response.data as ArrayBuffer);
        const fileExt = filename.split('.').pop()?.toLowerCase() || 'tmp';

        // 2. Point Calculation & Deduction
        const pageCount = await OfficeTranslationEngine.getPageCount(fileBuffer, fileExt);
        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        const pointSuccess = await PointManager.usePoints(
            user.id,
            pointsToDeduct,
            `[Drive] ${filename} 번역 (${pageCount}p)`
        );

        if (!pointSuccess) {
            return NextResponse.json({ 
                error: `포인트가 부족합니다. (필요: ${pointsToDeduct}P)`, 
                isPointError: true 
            }, { status: 403 });
        }


        // 3. Create Job Record
        const jobId = uuidv4();
        const safeStorageName = `source_file.${fileExt}`;
        const objectPath = `${user.id}/${jobId}/${safeStorageName}`; // 사용자 폴더 격리

        const { error: dbError } = await supabase
            .from('translation_jobs')
            .insert({
                id: jobId,
                user_id: user.id,
                original_filename: filename,
                file_type: mimeType,
                file_size: sizeBytes || 0,
                target_lang: targetLang,
                status: 'UPLOADING',
                original_file_path: objectPath,
                progress: 0,
                page_count: pageCount // Save page count too
            });

        if (dbError) {
            console.error('DB Job Creation Error:', dbError);
            // Refund points? Technically should, but simplified for now.
             // Maybe await PointManager.rewardPoints(user.id, pointsToDeduct, "Refund: Job Creation Failed");
            return NextResponse.json({ error: 'Failed to create job record' }, { status: 500 });
        }

        // 3. Upload to Supabase Storage
        console.log(`Attempting upload to 'documents/${objectPath}' with size ${fileBuffer.length}, User: ${user?.id || 'Anonymous'}`);

        const { error: storageError } = await supabase
            .storage
            .from('documents')
            .upload(objectPath, fileBuffer, {
                contentType: mimeType,
                upsert: true
            });

        if (storageError) {
            console.error('Supabase Storage Detail Error:', JSON.stringify(storageError, null, 2));
            return NextResponse.json({
                error: 'Failed to upload to storage',
                details: storageError.message,
                hint: 'Check bucket existence and RLS policies.'
            }, { status: 500 });
        }

        // 4. Update Job Status to UPLOADED
        await supabase
            .from('translation_jobs')
            .update({ status: 'UPLOADED', progress: 10 })
            .eq('id', jobId);

        return NextResponse.json({
            success: true,
            jobId,
            objectPath,
            filename
        });

    } catch (error: any) {
        console.error('Drive Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
