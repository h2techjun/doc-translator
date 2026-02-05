import { getAdminClient } from '@/lib/supabase/admin';

export class StorageManager {
    private static BUCKET = 'documents';

    /**
     * 📤 파일을 Supabase Storage에 업로드합니다.
     * 경로: {userId}/{jobId}/input/{filename}
     */
    static async uploadInputFile(userId: string, jobId: string, file: File): Promise<string | null> {
        const supabase = getAdminClient();
        // 🔒 Sanitize filename to strict ASCII to avoid S3/Supabase 'Invalid Key' errors with Korean/Special chars
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${userId}/${jobId}/input/${Date.now()}_${safeFilename}`;

        const { error } = await supabase.storage
            .from(this.BUCKET)
            .upload(path, file, {
                upsert: true
            });

        if (error) {
            console.error('Storage Upload Error Detail:', JSON.stringify(error, null, 2));
            throw new Error(`파일 업로드 실패: ${error.message} (Code: ${(error as any).code || 'UNKNOWN'})`);
        }

        return path;
    }

    /**
     * 📤 번역된 파일 버퍼를 업로드합니다.
     * 경로: {userId}/{jobId}/output/{filename}
     */
    static async uploadOutputFile(userId: string, jobId: string, filename: string, buffer: Buffer): Promise<string | null> {
        const supabase = getAdminClient();
        // 🔒 Sanitize filename to strict ASCII to avoid S3/Supabase 'Invalid Key' errors
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${userId}/${jobId}/output/${Date.now()}_${safeFilename}`;

        const { error } = await supabase.storage
            .from(this.BUCKET)
            .upload(path, buffer, {
                contentType: 'application/octet-stream',
                upsert: true
            });

        if (error) {
            console.error('Storage Output Upload Error Detail:', JSON.stringify(error, null, 2));
            throw new Error(`번역 결과 저장 실패: ${error.message} (Code: ${(error as any).code || 'UNKNOWN'})`);
        }

        return path;
    }

    /**
     * 📥 파일을 다운로드합니다 (Server-side).
     */
    static async downloadFile(path: string): Promise<Blob> {
        const supabase = getAdminClient();
        const { data, error } = await supabase.storage
            .from(this.BUCKET)
            .download(path);

        if (error || !data) {
            throw new Error('파일을 찾을 수 없습니다.');
        }

        return data;
    }

    /**
     * 🔗 다운로드용 Signed URL 생성
     */
    static async getSignedUrl(path: string): Promise<string> {
        const supabase = getAdminClient();
        const { data, error } = await supabase.storage
            .from(this.BUCKET)
            .createSignedUrl(path, 60 * 60); // 1시간 유효

        if (error || !data) {
            throw new Error('다운로드 링크 생성 실패');
        }

        return data.signedUrl;
    }
}
