
import { TranslationStrategy } from "./strategies/base-strategy";
import { DocxTranslationStrategy } from "./strategies/docx-strategy";
import { XlsxTranslationStrategy } from "./strategies/xlsx-strategy";
import { PdfTranslationStrategy } from "./strategies/pdf-strategy";
import { Pdf2zhTranslationStrategy } from "./strategies/pdf2zh-strategy";

/**
 * 🏭 번역 전략 팩토리 (Translation Strategy Factory)
 * 
 * 파일 확장자나 MIME 타입을 분석하여 적절한 번역 엔진을 반환합니다.
 * 
 * 🎯 PDF 전략 선택:
 * - 기본: pdf2zh (최고 품질, Python 필요)
 * - Fallback: Gemini Vision (Python 없을 시)
 * - 환경 변수 PDF_STRATEGY로 강제 선택 가능
 */
export class TranslationProcessorFactory {
    static getProcessor(fileKey: string): TranslationStrategy {
        const ext = fileKey.split('.').pop()?.toLowerCase();

        switch (ext) {
            case 'docx':
                return new DocxTranslationStrategy();
            case 'xlsx':
                return new XlsxTranslationStrategy();
            case 'pdf':
                return this.getPdfStrategy();
            default:
                throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
        }
    }

    /**
     * 📄 PDF 전략 선택 로직
     * 
     * 우선순위:
     * 1. 환경 변수 PDF_STRATEGY (pdf2zh | gemini)
     * 2. pdf2zh (기본값, Python 필요)
     * 3. Gemini Vision (Fallback)
     */
    private static getPdfStrategy(): TranslationStrategy {
        const strategy = process.env.PDF_STRATEGY?.toLowerCase();

        // 환경 변수로 강제 지정
        if (strategy === 'gemini') {
            console.log('[Factory] PDF 전략: Gemini Vision (환경 변수 지정)');
            return new PdfTranslationStrategy();
        }

        if (strategy === 'pdf2zh') {
            console.log('[Factory] PDF 전략: pdf2zh (환경 변수 지정)');
            return new Pdf2zhTranslationStrategy();
        }

        // 기본값: pdf2zh 시도
        console.log('[Factory] PDF 전략: pdf2zh (기본값)');
        return new Pdf2zhTranslationStrategy();
    }
}
