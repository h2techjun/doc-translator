import { getAdminClient } from '@/lib/supabase/admin';

export class StorageManager {
    private static BUCKET = 'documents';

    /**
     * 📤 파일을 Supabase Storage에 업로드합니다.
     * 경로: {userId}/{jobId}/input/{filename}
     */
    static async uploadInputFile(userId: string, jobId: string, file: File): Promise<string | null> {
        const supabase = getAdminClient();
        const path = `${userId}/${jobId}/input/${file.name}`;

        const { error } = await supabase.storage
            .from(this.BUCKET)
            .upload(path, file, {
                upsert: true
            });

        if (error) {
            console.error('Storage Upload Error:', error);
            throw new Error('파일 업로드에 실패했습니다.');
        }

        return path;
    }

    /**
     * 📤 번역된 파일 버퍼를 업로드합니다.
     * 경로: {userId}/{jobId}/output/{filename}
     */
    static async uploadOutputFile(userId: string, jobId: string, filename: string, buffer: Buffer): Promise<string | null> {
        const supabase = getAdminClient();
        const path = `${userId}/${jobId}/output/${filename}`;

        const { error } = await supabase.storage
            .from(this.BUCKET)
            .upload(path, buffer, {
                contentType: 'application/octet-stream',
                upsert: true
            });

        if (error) {
            console.error('Storage Output Upload Error:', error);
            throw new Error('번역 파일 저장에 실패했습니다.');
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
