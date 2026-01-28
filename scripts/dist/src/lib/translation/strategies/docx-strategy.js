"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxTranslationStrategy = void 0;
const base_strategy_1 = require("./base-strategy");
const pizzip_1 = __importDefault(require("pizzip"));
const xmldom_1 = require("@xmldom/xmldom");
/**
 * 📝 워드 문서 번역 전략 (PizZip + XML 핸들링 - Buffer Mode)
 *
 * 🎯 목적 (Purpose):
 * Word 문서의 모든 서식과 레이아웃을 100% 보존하면서 텍스트만 번역합니다.
 *
 * 🔄 처리 흐름 (Workflow):
 * 1. DOCX 파일을 ZIP 아카이브로 압축 해제 (PizZip)
 * 2. word/document.xml 파일 추출 및 XML DOM 파싱
 * 3. <w:t> 태그(텍스트 노드) 순회하며 Gemini API 번역
 * 4. 번역된 텍스트를 XML에 다시 삽입
 * 5. ZIP으로 재압축하여 DOCX 파일 생성
 *
 * ✅ 보존되는 요소 (Preserved Elements):
 * - 문단 스타일 (제목, 본문, 인용 등)
 * - 글꼴, 크기, 색상, 굵기, 기울임
 * - 표(Table) 구조 및 셀 병합
 * - 이미지 및 도형
 * - 머리글/바닥글
 * - 페이지 레이아웃 및 여백
 *
 * 📦 의존성 (Dependencies):
 * - PizZip: ZIP 압축/해제 라이브러리
 * - @xmldom/xmldom: XML DOM 파싱 및 직렬화
 * - BaseTranslationStrategy: Gemini API 번역 기능 제공
 */
class DocxTranslationStrategy extends base_strategy_1.BaseTranslationStrategy {
    /**
     * 📝 Word 파일 번역 실행
     *
     * @param fileBuffer - 원본 DOCX 파일의 Buffer
     * @param targetLang - 목표 언어 (예: "Korean", "English", "Japanese")
     * @returns 번역된 DOCX 파일의 Buffer
     *
     * @throws {Error} DOCX 파일 구조가 올바르지 않을 때
     * @throws {Error} XML 파싱 실패 시
     */
    async translate(fileBuffer, targetLang) {
        var _a;
        console.log(`[DocxStrategy] 📝 Word 번역 시작 (목표 언어: ${targetLang})`);
        // 1️⃣ DOCX 파일을 ZIP 아카이브로 로드
        // DOCX는 내부적으로 XML 파일들을 ZIP으로 압축한 형태입니다.
        const zip = new pizzip_1.default(fileBuffer);
        // 2️⃣ 핵심 문서 내용이 담긴 word/document.xml 추출
        // 이 파일에 모든 텍스트, 스타일, 구조 정보가 포함되어 있습니다.
        const xmlContent = (_a = zip.file('word/document.xml')) === null || _a === void 0 ? void 0 : _a.asText();
        if (!xmlContent) {
            throw new Error('Word 문서 구조가 올바르지 않습니다 (document.xml 누락)');
        }
        // 3️⃣ XML 문자열을 DOM 객체로 파싱
        // DOM을 사용하면 태그별로 쉽게 접근하고 수정할 수 있습니다.
        const parser = new xmldom_1.DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
        // 4️⃣ 모든 텍스트 노드 추출 및 데이터 준비
        const textElements = xmlDoc.getElementsByTagName('w:t');
        const originalTexts = [];
        const validIndices = [];
        for (let i = 0; i < textElements.length; i++) {
            const text = textElements[i].textContent || '';
            if (text.trim().length > 1) {
                originalTexts.push(text);
                validIndices.push(i);
            }
        }
        console.log(`  ✅ 번역 대상 발견: ${originalTexts.length}/${textElements.length}`);
        // 5️⃣ 일괄 번역 처리 (Batch size 20)
        const batchSize = 20;
        for (let i = 0; i < originalTexts.length; i += batchSize) {
            const batch = originalTexts.slice(i, i + batchSize);
            const translatedBatch = await this.translateBatch(batch, targetLang);
            // 결과 주입
            translatedBatch.forEach((translated, index) => {
                const targetIdx = validIndices[i + index];
                textElements[targetIdx].textContent = translated;
            });
            console.log(`  🔄 진행률: ${Math.min(i + batchSize, originalTexts.length)}/${originalTexts.length}`);
        }
        // 7️⃣ 수정된 DOM을 다시 XML 문자열로 직렬화
        const serializer = new xmldom_1.XMLSerializer();
        const newXmlContent = serializer.serializeToString(xmlDoc);
        // 8️⃣ ZIP 아카이브 내의 document.xml을 업데이트
        zip.file('word/document.xml', newXmlContent);
        // 9️⃣ 수정된 ZIP을 Buffer로 생성하여 반환
        const resultBuffer = zip.generate({ type: 'nodebuffer' });
        console.log(`  ✅ Word 번역 완료 (출력 크기: ${resultBuffer.length} bytes)`);
        return resultBuffer;
    }
}
exports.DocxTranslationStrategy = DocxTranslationStrategy;
