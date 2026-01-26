
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables manually since we are outside Next.js context
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// DB 설정 (Adapter 사용)
const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/translation_db?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Redis 설정
const REDIS_CONNECTION = {
    host: 'localhost',
    port: 6379,
};

// S3 설정
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT || "http://localhost:9000",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
    },
    forcePathStyle: true,
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "translations";

console.log(`[Worker] Starting with BUCKET=${BUCKET_NAME}`);

async function processJob(job: Job) {
    console.log(`\n[Worker] Processing Job ${job.id}...`);
    try {
        // 1. 상태 업데이트
        await prisma.job.update({
            where: { id: job.id },
            data: { status: 'PROCESSING' }
        });

        // 2. 모의 번역 수행 (3초)
        await job.updateProgress(10);
        console.log(`  - Translating ${job.data.fileKey}...`);
        await new Promise(r => setTimeout(r, 1000));
        await job.updateProgress(50);
        await new Promise(r => setTimeout(r, 2000));

        // 3. 결과 파일 생성 (간단 텍스트)
        const resultKey = `translations/${job.data.userId}/${Date.now()}_result.txt`;
        const content = `Translation Result for ${job.data.filename}\nTarget: ${job.data.targetLang}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: resultKey,
            Body: content,
            ContentType: 'text/plain'
        }));

        // 4. 완료 처리
        await prisma.job.update({
            where: { id: job.id },
            data: {
                status: 'COMPLETED',
                translatedFileUrl: resultKey,
                completedAt: new Date()
            }
        });
        await job.updateProgress(100);
        console.log(`  - Completed! saved to ${resultKey}`);

    } catch (e: any) {
        if (e.code === 'P2025') {
            console.warn(`  ⚠️ Job ${job.id} record not found in DB. Skipping...`);
            // DB에 없으므로 그냥 완료 처리하거나 무시
            return;
        }

        console.error(`  - Failed: ${e.message}`);
        try {
            await prisma.job.update({
                where: { id: job.id },
                data: { status: 'FAILED', error: e.message }
            });
        } catch (updateError) {
            console.error('  - Failed to update job status to FAILED', updateError);
        }
        throw e;
    }
}

const worker = new Worker('translation-queue', processJob, {
    connection: REDIS_CONNECTION,
    concurrency: 1
});

worker.on('ready', () => console.log('✅ Worker is ready and waiting for jobs...'));
worker.on('error', err => console.error('❌ Worker error:', err));
