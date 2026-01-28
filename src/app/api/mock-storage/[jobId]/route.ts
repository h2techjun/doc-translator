
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * 📦 가상 스토리지 엔드포인트 (Mock Storage PUT Handler)
 * 
 * Why:
 * - 프론트엔드(FileDropzone)가 Presigned URL로 PUT 요청을 보낼 때, 이를 로컬 파일시스템으로 받기 위함입니다.
 * - S3 업로드 로직과 동일한 클라이언트 흐름을 유지할 수 있습니다.
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const { jobId } = params;

    // 파일명은 쿼리 파라미터로 전달받음 (업로드 URL 생성 시 포함)
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: '파일명이 필요합니다.' }, { status: 400 });
    }

    try {
        console.log(`[MockStorage] 파일 수신 중: ${jobId}/${filename}`);

        // 1. 저장 경로 확보
        const uploadDir = path.join(process.cwd(), '.uploads', jobId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // 2. 스트림으로 파일 저장
        // NextRequest의 body는 ReadableStream입니다. 
        // Node.js fs.write와 호환되도록 변환 필요
        const buffer = await req.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        console.log(`[MockStorage] 저장 완료: ${filePath} (${buffer.byteLength} bytes)`);

        return NextResponse.json({ success: true, path: filePath });

    } catch (error: any) {
        console.error('[MockStorage] 업로드 실패:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// OPTIONS 메서드 처리 (CORS 프리플라이트 대응)
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
