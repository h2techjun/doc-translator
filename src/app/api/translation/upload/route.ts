
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * 🚀 업로드 핸들러 (Production)
 * 
 * Why:
 * - Supabase Storage에 직접 업로드하기 위한 Presigned URL을 발급합니다.
 * - 작업을 DB에 기록하여 비동기 파이프라인을 시작합니다.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filename, fileType, size, targetLang } = body;

        if (!filename || !fileType) {
            return NextResponse.json({ error: '필수 파일 정보가 누락되었습니다.' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. 작업 레코드 생성
        const jobId = uuidv4();
        const objectPath = `${jobId}/${filename}`;

        // TODO: 사용자 인증 연동 시 user_id 추가 필요
        const { error: dbError } = await supabase
            .from('translation_jobs')
            .insert({
                id: jobId,
                original_filename: filename,
                file_type: fileType,
                file_size: size,
                target_lang: targetLang,
                status: 'UPLOADING',
                original_file_path: objectPath,
                progress: 0
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            return NextResponse.json({ error: '작업 레코드 생성 실패', details: dbError.message }, { status: 500 });
        }

        // 2. Presigned Upload URL 생성
        const { data, error: storageError } = await supabase
            .storage
            .from('documents')
            .createSignedUploadUrl(objectPath);

        if (storageError || !data) {
            console.error('Storage Error:', storageError);
            return NextResponse.json({ error: '업로드 URL 생성 실패', details: storageError?.message }, { status: 500 });
        }

        return NextResponse.json({
            jobId,
            uploadUrl: data.signedUrl,
            objectPath
        });

    } catch (error: any) {
        console.error('Upload Handle Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
