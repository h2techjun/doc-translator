"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XlsxTranslationStrategy = void 0;
const base_strategy_1 = require("./base-strategy");
const exceljs_1 = __importDefault(require("exceljs"));
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
class XlsxTranslationStrategy extends base_strategy_1.BaseTranslationStrategy {
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
    async translate(fileBuffer, targetLang) {
        console.log(`[XlsxStrategy] 📊 Excel 번역 시작 (목표 언어: ${targetLang})`);
        // 1️⃣ Excel 워크북 로드
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.load(fileBuffer); // ExcelJS 타입 호환성을 위한 캐스팅
        console.log(`  ✅ 워크북 로드 완료 (시트 수: ${workbook.worksheets.length})`);
        // 2️⃣ 모든 워크시트에서 텍스트 수집
        const cellsToTranslate = [];
        const originalTexts = [];
        for (const worksheet of workbook.worksheets) {
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    // 일반 문자열
                    if (cell.value && typeof cell.value === 'string') {
                        originalTexts.push(cell.value);
                        cellsToTranslate.push({ cell, type: 'string' });
                    }
                    // Rich Text
                    else if (cell.value && typeof cell.value === 'object' && 'richText' in cell.value) {
                        const richValue = cell.value;
                        if (Array.isArray(richValue.richText)) {
                            richValue.richText.forEach((rt, rtIndex) => {
                                if (rt.text) {
                                    originalTexts.push(rt.text);
                                    cellsToTranslate.push({ cell, type: 'richText', rtIndex });
                                }
                            });
                        }
                    }
                });
            });
        }
        console.log(`  ✅ 번역 대상 발견: ${originalTexts.length} 세그먼트`);
        // 3️⃣ 일괄 번역 및 주입 (Batch size 50 - 엑셀은 짧은 셀이 많으므로 크게 잡음)
        const batchSize = 50;
        for (let i = 0; i < originalTexts.length; i += batchSize) {
            const batch = originalTexts.slice(i, i + batchSize);
            const translatedBatch = await this.translateBatch(batch, targetLang);
            translatedBatch.forEach((translated, index) => {
                const target = cellsToTranslate[i + index];
                if (target.type === 'string') {
                    target.cell.value = translated;
                }
                else if (target.type === 'richText' && target.rtIndex !== undefined) {
                    const richValue = target.cell.value;
                    richValue.richText[target.rtIndex].text = translated;
                }
            });
            console.log(`  🔄 진행률: ${Math.min(i + batchSize, originalTexts.length)}/${originalTexts.length}`);
        }
        // 6️⃣ 수정된 워크북을 Buffer로 직렬화하여 반환
        const resultBuffer = await workbook.xlsx.writeBuffer();
        console.log(`  ✅ Excel 번역 완료 (출력 크기: ${resultBuffer.byteLength} bytes)`);
        return Buffer.from(resultBuffer);
    }
}
exports.XlsxTranslationStrategy = XlsxTranslationStrategy;
