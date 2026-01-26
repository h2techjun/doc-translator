import { FileType } from '@/types/file';

export interface TranslationResult {
    file: Buffer; // 번역된 파일 바이너리
    pageCount: number; // 과금용 페이지 수/슬라이드 수
    characterCount: number; // 과금용 글자 수
}

export abstract class BaseFileTranslator {
    abstract parse(buffer: Buffer): Promise<any>;
    abstract translate(content: any, targetLang: string): Promise<any>;
    abstract generate(content: any): Promise<Buffer>;

    // 메인 실행 함수
    async process(buffer: Buffer, targetLang: string): Promise<TranslationResult> {
        const content = await this.parse(buffer);
        const translated = await this.translate(content, targetLang);
        return {
            file: await this.generate(translated),
            pageCount: this.countPages(content),
            characterCount: this.countCharacters(content)
        };
    }

    protected abstract countPages(content: any): number;
    protected abstract countCharacters(content: any): number;
}

export class OfficeTranslationEngine {
    private static translators: Record<string, BaseFileTranslator> = {};

    static register(type: string, translator: BaseFileTranslator) {
        this.translators[type] = translator;
    }

    static async translateFile(
        fileBuffer: Buffer,
        fileName: string,
        targetLang: string
    ): Promise<TranslationResult> {
        const extension = fileName.split('.').pop()?.toLowerCase();

        let translator: BaseFileTranslator | null = null;

        // Static mapping or Dynamic Registry
        switch (extension) {
            case 'docx':
                translator = new DocxTranslator();
                break;
            case 'xlsx':
                translator = new XlsxTranslator();
                break;
            case 'pptx':
                translator = new PptxTranslator();
                break;
            case 'hwp':
            case 'hwpx':
                translator = new HwpTranslator();
                break;
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }

        return translator.process(fileBuffer, targetLang);
    }
}

// Circular dependency avoidance: Import at the end or use a Registry file
import { DocxTranslator } from './parsers/docx';
import { XlsxTranslator } from './parsers/xlsx';
import { PptxTranslator } from './parsers/pptx';
import { HwpTranslator } from './parsers/hwp';
