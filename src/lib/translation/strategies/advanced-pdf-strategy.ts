import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { BaseTranslationStrategy } from './base-strategy';

export class AdvancedPdfTranslationStrategy extends BaseTranslationStrategy {
    async translate(
        fileBuffer: Buffer,
        targetLang: string,
        jobId?: string,
        targetFormat?: string
    ): Promise<Buffer> {
        console.log(`[AdvancedPDF] 🚀 Starting advanced PDF translation (PaddleOCR Hybrid)`);

        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
        // 출력 포맷에 따라 확장자 결정
        const isDocx = targetFormat?.toLowerCase() === 'docx';
        const outputFilename = `output-${Date.now()}.${isDocx ? 'docx' : 'pdf'}`;
        const outputPath = path.join(tempDir, outputFilename);

        try {
            // 1. 입력 파일 임시 저장
            await fs.promises.writeFile(inputPath, fileBuffer);

            // 2. Python 스크립트 실행 (py -3.13 명시)
            const pythonScript = path.resolve('scripts/advanced-translate-pdf.py');
            console.log(`[AdvancedPDF] Executing: py -3.13 ${pythonScript} ${inputPath} ${outputPath} ${targetLang}`);

            const result = await this.executePythonScript(inputPath, outputPath, targetLang);

            if (!result.success) {
                throw new Error(result.error || 'Python translation script failed');
            }

            // 3. 결과 파일 읽기
            if (!fs.existsSync(outputPath)) {
                throw new Error(`Output file not found at ${outputPath}`);
            }
            const outputBuffer = await fs.promises.readFile(outputPath);

            return outputBuffer;
        } finally {
            // 4. 클린업
            try {
                if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath);
                if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
            } catch (cleanupError) {
                console.warn(`[AdvancedPDF] Cleanup error: ${cleanupError}`);
            }
        }
    }

    private executePythonScript(input: string, output: string, lang: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // Windows 환경이므로 py -3.13 런처 사용
            const proc = spawn('py', [
                '-3.13',
                'scripts/advanced-translate-pdf.py',
                input,
                output,
                lang
            ]);

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => {
                const str = data.toString();
                stdout += str;
                // 프로그레스 로그가 있다면 추출 가능 (__PROGRESS__ format)
                process.stdout.write(data);
            });

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });

            proc.on('close', (code) => {
                if (code === 0) {
                    try {
                        // 스크립트의 JSON 출력 섹션 파싱
                        const jsonMatch = stdout.match(/__JSON_START__([\s\S]*?)__JSON_END__/);
                        if (jsonMatch) {
                            resolve(JSON.parse(jsonMatch[1]));
                        } else {
                            // 폴백: 전체 출력 시도
                            resolve(JSON.parse(stdout));
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${e.message}\nStdout: ${stdout}`));
                    }
                } else {
                    reject(new Error(`Python script failed with code ${code}\nStderr: ${stderr}`));
                }
            });
        });
    }
}
