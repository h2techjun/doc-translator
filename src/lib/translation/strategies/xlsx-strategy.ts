import { BaseTranslationStrategy } from './base-strategy';
import ExcelJS from 'exceljs';

/**
 * 📊 엑셀 문서 번역 전략 (ExcelJS 기반 - Buffer Mode)
 * 
 * 🎯 목적 (Purpose):
 * Excel 파일의 모든 서식을 유지하면서 텍스트만 번역합니다.
 * 
 * 🔄 처리 흐름 (Workflow):
 * 1. Excel 워크북 로드 (ExcelJS.Workbook)
 * 2. 모든 시트의 셀을 순회하며 텍스트 추출
 * 3. Gemini API로 텍스트 번역
 * 4. 원본 서식을 유지하며 번역된 텍스트 삽입
 * 5. 수정된 워크북을 Buffer로 반환
 * 
 * ✅ 보존되는 요소 (Preserved Elements):
 * - 셀 서식 (색상, 폰트, 크기, 정렬)
 * - 테두리 및 배경색
 * - 수식 (Formula) - 번역하지 않음
 * - Rich Text 서식 (굵게, 기울임 등)
 * - 시트 구조 및 레이아웃
 * 
 * 📦 의존성 (Dependencies):
 * - ExcelJS: Excel 파일 조작 라이브러리
 * - BaseTranslationStrategy: Gemini API 번역 기능 제공
 */
export class XlsxTranslationStrategy extends BaseTranslationStrategy {
    /**
     * 📊 Excel 파일 번역 실행
     * 
     * @param fileBuffer - 원본 Excel 파일의 Buffer
     * @param targetLang - 목표 언어 (예: "Korean", "English", "Japanese")
     * @returns 번역된 Excel 파일의 Buffer
     * 
     * @throws {Error} Excel 파일 로드 실패 시
     * @throws {Error} 워크북 쓰기 실패 시
     */
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[XlsxStrategy] 📊 Excel 번역 시작 (목표 언어: ${targetLang})`);

        // 1️⃣ Excel 워크북 로드
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any); // ExcelJS 타입 호환성을 위한 캐스팅
        console.log(`  ✅ 워크북 로드 완료 (시트 수: ${workbook.worksheets.length})`);

        // 2️⃣ 모든 워크시트에 대해 번역 처리
        for (const worksheet of workbook.worksheets) {
            console.log(`  🔄 시트 "${worksheet.name}" 처리 중... (행 수: ${worksheet.rowCount})`);

            // 3️⃣ 모든 행과 셀을 순회하며 텍스트 번역
            for (let rowIdx = 1; rowIdx <= worksheet.rowCount; rowIdx++) {
                const row = worksheet.getRow(rowIdx);

                for (let colIdx = 1; colIdx <= row.cellCount; colIdx++) {
                    const cell = row.getCell(colIdx);

                    // 4️⃣ 일반 문자열 셀 처리
                    if (cell.value && typeof cell.value === 'string') {
                        const originalText = cell.value;
                        cell.value = await this.translateText(originalText, targetLang);
                    }
                    // 5️⃣ Rich Text 셀 처리 (서식이 적용된 텍스트)
                    // Rich Text는 { richText: [{ text: "...", font: {...} }] } 형태
                    else if (cell.value && typeof cell.value === 'object' && 'richText' in (cell.value as any)) {
                        const richValue = cell.value as any;
                        if (Array.isArray(richValue.richText)) {
                            for (const rt of richValue.richText) {
                                if (rt.text) {
                                    rt.text = await this.translateText(rt.text, targetLang);
                                }
                            }
                        }
                    }
                    // ⚠️ 수식(Formula)은 번역하지 않음 - 기능성 보존
                    // cell.value가 { formula: "=SUM(A1:A10)" } 형태인 경우 건너뜀
                }
            }
        }

        // 6️⃣ 수정된 워크북을 Buffer로 직렬화하여 반환
        const resultBuffer = await workbook.xlsx.writeBuffer();
        console.log(`  ✅ Excel 번역 완료 (출력 크기: ${resultBuffer.byteLength} bytes)`);

        return Buffer.from(resultBuffer);
    }
}
