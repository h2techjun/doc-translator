
import { NextRequest, NextResponse } from 'next/server';

/**
 * 📥 파일 다운로드 프록시 (File Download Proxy)
 * 
 * Why:
 * - Supabase Storage URL은 Cross-Origin 문제로 인해 클라이언트에서 'download' 속성(파일명 지정)이 무시될 수 있음.
 * - 이 API는 파일을 중계(Proxy)하여 Same-Origin 다운로드로 처리하고, Content-Disposition을 강제합니다.
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const fileUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'downloaded_file';

    if (!fileUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // 1. Fetch file from external URL (Supabase Storage)
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch file: ${response.statusText}` },
                { status: response.status }
            );
        }

        // 2. Prepare headers for download
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Content-Length', response.headers.get('Content-Length') || '');

        // Encode filename for safe Content-Disposition (RFC 5987)
        const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

        // 3. Stream the response directly
        return new NextResponse(response.body, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('Download Proxy Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            url: fileUrl
        }, { status: 500 });
    }
}
