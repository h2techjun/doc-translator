
import fs from 'fs';
import path from 'path';

/**
 * 📦 Local Mock DB
 * 
 * Why:
 * - Supabase 없이 로컬에서 비동기 번역 파이프라인(상태 폴링 등)을 완벽하게 검증하기 위함입니다.
 * - `local-jobs.json` 파일에 상태를 저장하여 서버가 재시작되어도 작업 정보가 유지됩니다.
 */

const DB_FILE = path.join(process.cwd(), 'local-jobs.json');

// DB 초기화
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ jobs: {} }, null, 2));
}

export interface MockJob {
    id: string;
    original_filename: string;
    file_type: string;
    file_size: number;
    target_lang: string;
    status: 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    original_file_path: string; // id/filename
    translated_file_path?: string;
    translated_file_url?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

export class LocalDB {
    private static read(): { jobs: Record<string, MockJob> } {
        try {
            if (!fs.existsSync(DB_FILE)) return { jobs: {} };
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('LocalDB Read Error:', e);
            return { jobs: {} };
        }
    }

    private static write(data: { jobs: Record<string, MockJob> }) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('LocalDB Write Error:', e);
        }
    }

    static getJob(id: string): MockJob | null {
        const db = this.read();
        return db.jobs[id] || null;
    }

    static createJob(job: MockJob) {
        const db = this.read();
        db.jobs[job.id] = job;
        this.write(db);
    }

    static updateJob(id: string, updates: Partial<MockJob>) {
        const db = this.read();
        if (db.jobs[id]) {
            db.jobs[id] = { ...db.jobs[id], ...updates, updated_at: new Date().toISOString() };
            this.write(db);
        }
    }
}
