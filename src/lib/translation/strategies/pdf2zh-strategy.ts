
import { BaseTranslationStrategy } from './base-strategy';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
// import { prisma } from "@/lib/prisma"; // Prisma unused in Supabase environment

/**
 * 📄 PDF 문서 번역 전략 (pdf2zh 기반 - 최고 품질)
 * 
 * 🎯 목적 (Purpose):
 * PDFMathTranslate (pdf2zh)를 사용하여 레이아웃을 완벽하게 보존하면서 PDF를 번역합니다.
 */
export class Pdf2zhTranslationStrategy extends BaseTranslationStrategy {
    private pythonScriptPath: string;

    constructor() {
        super();
        this.pythonScriptPath = path.join(
            process.cwd(),
            'scripts',
            'translate-pdf.py'
        );
    }

    /**
     * 📄 PDF 파일 번역 실행 (pdf2zh 기반)
     */
    async translate(fileBuffer: Buffer, targetLang: string, jobId?: string, targetFormat?: string): Promise<Buffer> {
        console.log(`[Pdf2zhStrategy] 📄 PDF → PDF 번역 시작 (pdf2zh, 목표 언어: ${targetLang}, 포맷: ${targetFormat || 'PDF'})`);

        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `pdf-input-${Date.now()}.pdf`);

        // targetFormat이 docx이면 확장자 변경 (Python 스크립트가 인식)
        const outputExt = targetFormat?.toLowerCase() === 'docx' ? 'docx' : 'pdf';
        const outputPath = path.join(tempDir, `pdf-output-${Date.now()}.${outputExt}`);

        try {
            await fs.writeFile(inputPath, fileBuffer);
            console.log(`  💾 임시 파일 저장: ${inputPath}`);

            // Python 스크립트 실행 (jobId 전달하여 진행률 업데이트)
            const result = await this.executePdf2zh(inputPath, outputPath, targetLang, jobId);

            if (!result.success) {
                throw new Error(`pdf2zh 실행 실패: ${result.error}`);
            }

            console.log(`  ✅ pdf2zh 번역 완료: ${result.output_path}`);
            console.log(`  📦 파일 크기: ${result.file_size} bytes`);

            const translatedBuffer = await fs.readFile(outputPath);
            await this.cleanupTempFiles(inputPath, outputPath);

            return translatedBuffer;

        } catch (error: any) {
            console.error(`  ❌ PDF 번역 에러:`, error);
            await this.cleanupTempFiles(inputPath, outputPath);
            throw new Error(`PDF 번역 실패: ${error.message}`);
        }
    }

    /**
     * 🐍 Python pdf2zh 스크립트 실행
     */
    private async executePdf2zh(
        inputPath: string,
        outputPath: string,
        targetLang: string,
        jobId?: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`  🐍 Python 스크립트 실행 중...`);

            const pythonProcess = spawn('python', [
                this.pythonScriptPath,
                inputPath,
                outputPath,
                targetLang
            ]);

            let stdout = '';
            let stderr = '';

            // 표준 출력 수집 및 진행률 파싱
            pythonProcess.stdout.on('data', async (data) => {
                const text = data.toString();
                stdout += text;
                console.log(`  [Python] ${text.trim()}`);

                // 진행률 업데이트
                // 1. OCR 진행률 (__PROGRESS__ 0~40)
                // 2. Tqdm (pdf2zh) 진행률 (추후 추가 가능)
                const progressMatch = text.match(/__PROGRESS__ (\d+)/);
                if (progressMatch && jobId) {
                    const percent = parseInt(progressMatch[1]);
                    try {
                        // Prisma update removed for build stability. 
                        // TODO: Implement Supabase-based progress update if needed.
                        console.log(`[Pdf2zhProgress] Job ${jobId}: ${percent}%`);
                    } catch (e) {
                        console.warn("Progress parsing error:", e);
                    }
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                console.error(`  [Python Error] ${text.trim()}`);
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const startMarker = "__JSON_START__";
                        const endMarker = "__JSON_END__";
                        const startIndex = stdout.indexOf(startMarker);
                        const endIndex = stdout.indexOf(endMarker);

                        if (startIndex !== -1 && endIndex !== -1) {
                            const jsonStr = stdout.substring(startIndex + startMarker.length, endIndex).trim();
                            const result = JSON.parse(jsonStr);
                            resolve(result);
                        } else {
                            // Fallback regex
                            const jsonMatch = stdout.match(/\{[\s\S]*\}(?=[^}]*$)/);
                            if (jsonMatch) {
                                const result = JSON.parse(jsonMatch[0]);
                                resolve(result);
                            } else {
                                throw new Error("JSON 결과 구분자를 찾을 수 없습니다.");
                            }
                        }
                    } catch (e: any) {
                        reject(new Error(`JSON 파싱 실패: ${stdout}\n\n${e.message}`));
                    }
                } else {
                    reject(new Error(`Python script failed with code ${code}\nStderr: ${stderr}`));
                }
            });
        });
    }

    private async cleanupTempFiles(...files: string[]) {
        for (const file of files) {
            try {
                await fs.unlink(file);
                console.log(`  🗑️ 임시 파일 삭제: ${file}`);
            } catch (error) {
                // 무시
            }
        }
    }
}
