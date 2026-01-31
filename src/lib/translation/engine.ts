import { TranslationResult } from './engine_base';
import { DocxTranslationStrategy } from './strategies/docx-strategy';
import { XlsxTranslationStrategy } from './strategies/xlsx-strategy';
import { PptxTranslationStrategy } from './strategies/pptx-strategy';
import PizZip from 'pizzip';
import { DOMParser } from '@xmldom/xmldom';

export class OfficeTranslationEngine {
    /**
     * 📄 메타데이터를 피킹하여 실제 페이지(또는 슬라이드/시트) 수를 반환합니다.
     */
    static async getPageCount(buffer: Buffer, extension: string): Promise<number> {
        try {
            const zip = new PizZip(buffer);
            if (extension === 'docx') {
                const appXml = zip.file('docProps/app.xml')?.asText();
                const match = appXml?.match(/<Pages>(\d+)<\/Pages>/);
                return match ? parseInt(match[1]) : 1;
            } else if (extension === 'pptx') {
                const appXml = zip.file('docProps/app.xml')?.asText();
                const match = appXml?.match(/<Slides>(\d+)<\/Slides>/);
                return match ? parseInt(match[1]) : 1;
            } else if (extension === 'xlsx') {
                const workbookXml = zip.file('xl/workbook.xml')?.asText();
                if (workbookXml) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(workbookXml, 'application/xml');
                    return xmlDoc.getElementsByTagName('sheet').length || 1;
                }
            }
        } catch (err) {
            console.warn("[Engine] Metadata peek failed, defaulting to 1 page:", err);
        }
        return 1;
    }

    static async translateFile(
        fileBuffer: Buffer,
        fileName: string,
        targetLang: string
    ): Promise<TranslationResult> {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        // 실제 페이지 수 감지
        const actualPageCount = await this.getPageCount(fileBuffer, extension);

        let translatedBuffer: Buffer;

        // 고정밀 번역 전략 사용
        switch (extension) {
            case 'docx':
                const docx = new DocxTranslationStrategy();
                translatedBuffer = await docx.translate(fileBuffer, targetLang);
                break;
            case 'xlsx':
                const xlsx = new XlsxTranslationStrategy();
                translatedBuffer = await xlsx.translate(fileBuffer, targetLang);
                break;
            case 'pptx':
                const pptx = new PptxTranslationStrategy();
                translatedBuffer = await pptx.translate(fileBuffer, targetLang);
                break;
            default:
                throw new Error(`Unsupported or unimplemented file type: ${extension}`);
        }

        return {
            file: translatedBuffer,
            pageCount: actualPageCount,
            characterCount: translatedBuffer.length
        };
    }
}
