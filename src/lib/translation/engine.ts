import { TranslationResult, BaseFileTranslator } from './engine_base';
import { DocxTranslationStrategy } from './strategies/docx-strategy';
import { XlsxTranslationStrategy } from './strategies/xlsx-strategy';
import { PptxTranslationStrategy } from './strategies/pptx-strategy';
import { HwpxTranslationStrategy } from './strategies/hwp-strategy';

export class OfficeTranslationEngine {
    static async translateFile(
        fileBuffer: Buffer,
        fileName: string,
        targetLang: string
    ): Promise<TranslationResult> {
        const extension = fileName.split('.').pop()?.toLowerCase();
        let translatedBuffer: Buffer;

        // Use high-fidelity strategies
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
            case 'hwpx':
            case 'hwp': // Fallback for HWPX renamed to HWP
                const hwp = new HwpxTranslationStrategy();
                translatedBuffer = await hwp.translate(fileBuffer, targetLang);
                break;
            default:
                throw new Error(`Unsupported or unimplemented file type: ${extension}`);
        }

        return {
            file: translatedBuffer,
            pageCount: 1, // Basic count
            characterCount: translatedBuffer.length
        };
    }
}
