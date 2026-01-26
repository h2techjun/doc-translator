import { Readable, PassThrough } from 'stream';
import { BaseTranslationStrategy } from './base-strategy';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

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
export class DocxTranslationStrategy extends BaseTranslationStrategy {
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
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[DocxStrategy] 📝 Word 번역 시작 (목표 언어: ${targetLang})`);

        // 1️⃣ DOCX 파일을 ZIP 아카이브로 로드
        // DOCX는 내부적으로 XML 파일들을 ZIP으로 압축한 형태입니다.
        const zip = new PizZip(fileBuffer);

        // 2️⃣ 핵심 문서 내용이 담긴 word/document.xml 추출
        // 이 파일에 모든 텍스트, 스타일, 구조 정보가 포함되어 있습니다.
        const xmlContent = zip.file('word/document.xml')?.asText();
        if (!xmlContent) {
            throw new Error('Word 문서 구조가 올바르지 않습니다 (document.xml 누락)');
        }

        // 3️⃣ XML 문자열을 DOM 객체로 파싱
        // DOM을 사용하면 태그별로 쉽게 접근하고 수정할 수 있습니다.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

        // 4️⃣ 모든 텍스트 노드 추출
        // <w:t> 태그는 Word XML에서 실제 텍스트를 담는 요소입니다.
        const textElements = xmlDoc.getElementsByTagName('w:t');
        console.log(`  ✅ 발견된 텍스트 노드 수: ${textElements.length}`);

        // 5️⃣ 각 텍스트 노드를 순회하며 번역
        // ⚠️ 최적화 고려사항:
        // - 병렬 처리 가능하나 Gemini API Rate Limit을 고려하여 순차 처리
        // - 프로덕션에서는 문단 단위 배치 처리 권장
        for (let i = 0; i < textElements.length; i++) {
            const element = textElements[i];
            const originalText = element.textContent;

            // 6️⃣ 의미 있는 텍스트만 번역 (공백/짧은 텍스트 제외)
            if (originalText && originalText.trim().length > 1) {
                const translated = await this.translateText(originalText, targetLang);
                element.textContent = translated;

                // 진행률 로깅 (매 10개마다)
                if ((i + 1) % 10 === 0) {
                    console.log(`  🔄 번역 진행: ${i + 1}/${textElements.length}`);
                }
            }
        }

        // 7️⃣ 수정된 DOM을 다시 XML 문자열로 직렬화
        const serializer = new XMLSerializer();
        const newXmlContent = serializer.serializeToString(xmlDoc);

        // 8️⃣ ZIP 아카이브 내의 document.xml을 업데이트
        zip.file('word/document.xml', newXmlContent);

        // 9️⃣ 수정된 ZIP을 Buffer로 생성하여 반환
        const resultBuffer = zip.generate({ type: 'nodebuffer' });
        console.log(`  ✅ Word 번역 완료 (출력 크기: ${resultBuffer.length} bytes)`);

        return resultBuffer;
    }
}
