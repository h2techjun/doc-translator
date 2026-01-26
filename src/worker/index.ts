
import dotenv from 'dotenv';
import path from 'path';

// 워커는 독립 프로세스이므로 .env 로드 필요
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log("🔍 [Worker] Loaded API Key:", process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : "UNDEFINED");


import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DocxTranslator } from '@/lib/document/docx-translator';
import { XlsxTranslator } from '@/lib/document/xlsx-translator';
import { PptxTranslator } from '@/lib/document/pptx-translator';
import { PdfTranslator } from '@/lib/document/pdf-translator';
import { Readable } from 'stream';

/**
 * 👷 Real Translation Worker
 * 
 * Redis 큐에서 작업을 가져와 실제 번역을 수행합니다.
 * - DOCX: PizZip + Gemini
 * - XLSX: (To be implemented)
 * - PDF: (To be implemented)
 */

// DB 설정
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

// Helper: Stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

async function processJob(job: Job) {
    console.log(`\n[Worker] Processing Job ${job.id} (Queue ID: ${job.id})...`);
    console.log(`  - File Key: ${job.data.fileKey}`);
    console.log(`  - Target Lang: ${job.data.targetLang}`);
    console.log(`  - Output Format: ${job.data.outputFormat || 'Auto'}`);

    try {
        // 1. 상태 업데이트: PROCESSING
        await prisma.job.update({
            where: { id: job.data.jobId || job.id }, // queue.ts 수정 전 들어온 작업 대비
            data: { status: 'PROCESSING' }
        });

        // 2. S3에서 파일  다운로드
        console.log('  - Downloading file...');
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: job.data.fileKey
        });
        const s3Response = await s3Client.send(getCommand);
        if (!s3Response.Body) throw new Error("File body is empty");

        const fileBuffer = await streamToBuffer(s3Response.Body as Readable);
        const fileType = job.data.fileType || 'application/octet-stream';

        // 3. 파일 타입별 번역 수행
        let outputBuffer: Buffer;
        let outputExt = 'bin';

        if (job.data.filename?.endsWith('.docx') || fileType.includes('word')) {
            console.log('  - Detected DOCX. Starting DocxTranslator...');
            const translator = new DocxTranslator(fileBuffer);
            outputBuffer = await translator.translate(job.data.targetLang);
            outputExt = 'docx';
        } else if (job.data.filename?.endsWith('.xlsx') || fileType.includes('spreadsheet')) {
            console.log('  - Detected XLSX. Starting XlsxTranslator...');
            const translator = new XlsxTranslator(fileBuffer);
            outputBuffer = await translator.translate(job.data.targetLang);
            outputExt = 'xlsx';
        } else if (job.data.filename?.endsWith('.pdf') || fileType.includes('pdf')) {
            console.log('  - Detected PDF. Starting PdfTranslator (Output: DOCX)...');
            const translator = new PdfTranslator(fileBuffer);
            outputBuffer = await translator.translate(job.data.targetLang);
            outputExt = 'docx';
        } else if (job.data.filename?.endsWith('.pptx') || fileType.includes('presentation')) {
            console.log('  - Detected PPTX. Starting PptxTranslator...');
            const translator = new PptxTranslator(fileBuffer);
            outputBuffer = await translator.translate(job.data.targetLang);
            outputExt = 'pptx';
        } else {
            console.log('  ⚠️ Unsupported file type. Returning original.');
            outputBuffer = fileBuffer;
        }

        // 4. 결과 파일 업로드
        // 파일명 형식: [Original]_[TargetLang].ext (예: contract_KO.docx)
        const originalName = job.data.filename ? path.parse(job.data.filename).name : `document_${Date.now()}`;
        const langSuffix = job.data.targetLang ? job.data.targetLang.toUpperCase() : 'Translated';
        const resultFilename = `${originalName}_${langSuffix}.${outputExt}`;
        const resultKey = `translations/${job.data.userId}/${resultFilename}`;

        console.log(`  - Uploading result to ${resultFilename}...`);

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: resultKey,
            Body: outputBuffer,
            ContentType: fileType // 원본 타입 유지 (또는 타입에 따라 변경)
        }));

        // 5. DB 업데이트: COMPLETED
        await prisma.job.update({
            where: { id: job.data.jobId },
            data: {
                status: 'COMPLETED',
                translatedFileUrl: resultKey,
                completedAt: new Date()
            }
        });

        await job.updateProgress(100);
        console.log(`✅ Job ${job.id} Completed Successfully!`);

    } catch (error: any) {
        console.error(`❌ Job ${job.id} Failed:`, error);

        // P2025: Record not found (무시)
        if (error.code === 'P2025') {
            console.warn("  ⚠️ Job record not found in DB.");
            return;
        }

        try {
            await prisma.job.update({
                where: { id: job.data.jobId || job.id },
                data: {
                    status: 'FAILED',
                    error: error.message
                }
            });
        } catch (e) { /* ignore */ }

        throw error;
    }
}

const worker = new Worker('translation-queue', processJob, {
    connection: REDIS_CONNECTION,
    concurrency: 1
});

worker.on('ready', () => console.log('🚀 AI Translation Worker is ready!'));
worker.on('error', err => console.error('❌ Worker error:', err));
worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed in Queue: ${err.message}`));
