
import ExcelJS from 'exceljs';
import { translateText } from "@/lib/ai/gemini";

/**
 * 📊 Excel 문서 번역기 (토큰 기반 청킹)
 * 
 * 셀 단위로 번역하되, 토큰 수를 고려하여 청크를 생성합니다.
 */
export class XlsxTranslator {
    private buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    /**
     * 토큰 수 추정
     */
    private estimateTokens(text: string): number {
        if (/[\u3131-\uD79D]/.test(text)) {
            return text.length * 2;
        }
        return text.split(/\s+/).length * 1.3;
    }

    /**
     * 토큰 기반 청크 생성
     */
    private createTokenBasedChunks(
        cells: { sheetId: number; address: string; text: string; index: number }[],
        maxTokensPerChunk: number = 1500
    ): { sheetId: number; address: string; text: string; index: number }[][] {
        const chunks: { sheetId: number; address: string; text: string; index: number }[][] = [];
        let currentChunk: { sheetId: number; address: string; text: string; index: number }[] = [];
        let currentTokens = 0;

        for (const cell of cells) {
            const cellTokens = this.estimateTokens(cell.text);

            if (cellTokens > maxTokensPerChunk) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = [];
                    currentTokens = 0;
                }
                chunks.push([cell]);
                continue;
            }

            if (currentTokens + cellTokens > maxTokensPerChunk && currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = [cell];
                currentTokens = cellTokens;
            } else {
                currentChunk.push(cell);
                currentTokens += cellTokens;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    async translate(targetLang: string): Promise<Buffer> {
        console.log("➡️ Loading XLSX Workbook...");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(this.buffer);

        // 1. 번역할 셀 수집
        const cellsToTranslate: {
            sheetId: number;
            address: string;
            text: string;
            index: number
        }[] = [];

        workbook.eachSheet((worksheet, sheetId) => {
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    if (cell.type === ExcelJS.ValueType.String && cell.text) {
                        const text = cell.text.trim();
                        if (text.length > 0) {
                            cellsToTranslate.push({
                                sheetId: worksheet.id,
                                address: cell.address,
                                text: text,
                                index: cellsToTranslate.length
                            });
                        }
                    }
                });
            });
        });

        if (cellsToTranslate.length === 0) {
            console.log("⚠️ No text cells found in Excel.");
            return this.buffer;
        }

        console.log(`➡️ Found ${cellsToTranslate.length} cells to translate.`);

        // 2. 토큰 기반 청크 생성
        const chunks = this.createTokenBasedChunks(cellsToTranslate, 1500);
        const translatedMap: Record<number, string> = {};

        console.log(`➡️ Created ${chunks.length} token-based chunks`);

        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
            const chunk = chunks[chunkIdx];
            const sourceTexts = chunk.map(c => c.text);

            console.log(`   Processing chunk ${chunkIdx + 1}/${chunks.length} (${chunk.length} cells)...`);

            try {
                const prompt = `
You are a professional spreadsheet translator.
Translate the following JSON array of cell values into "${targetLang}" language.
Maintain terminology and formatting appropriate for spreadsheets.
IMPORTANT: Return ONLY a raw JSON array of strings. No markdown, no explanations.
The output array must have exactly the same number of elements as the input.

Input JSON:
${JSON.stringify(sourceTexts)}
`;

                const rawResponse = await translateText(prompt, targetLang);
                const cleanedJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                let translatedArray: string[] = [];
                try {
                    translatedArray = JSON.parse(cleanedJson);
                } catch (jsonError) {
                    console.error("JSON Parse Error:", cleanedJson.substring(0, 200));
                    throw new Error("JSON Parse Failed");
                }

                if (!Array.isArray(translatedArray)) {
                    throw new Error("Not Array");
                }

                chunk.forEach((item, idx) => {
                    if (translatedArray[idx]) {
                        translatedMap[item.index] = translatedArray[idx];
                    } else {
                        translatedMap[item.index] = item.text;
                    }
                });

            } catch (err: any) {
                console.error(`Chunk ${chunkIdx + 1} error:`, err.message);

                // 개별 셀 재시도
                console.log(`   🔄 Retrying cells individually...`);

                for (const cell of chunk) {
                    try {
                        const translated = await translateText(cell.text, targetLang);
                        translatedMap[cell.index] = translated;
                    } catch (retryErr) {
                        console.error(`      ❌ Failed for cell ${cell.address}`);
                        translatedMap[cell.index] = cell.text;
                    }
                }
            }
        }

        // 3. 번역 결과 적용
        cellsToTranslate.forEach((item) => {
            if (translatedMap[item.index]) {
                const worksheet = workbook.getWorksheet(item.sheetId);
                if (worksheet) {
                    const cell = worksheet.getCell(item.address);
                    cell.value = translatedMap[item.index];
                }
            }
        });

        // 4. 저장
        const newBuffer = await workbook.xlsx.writeBuffer();
        return newBuffer as Buffer;
    }
}
