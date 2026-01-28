export interface TranslationResult {
    file: Buffer;
    pageCount: number;
    characterCount: number;
}

export abstract class BaseFileTranslator {
    abstract translate(buffer: Buffer, targetLang: string): Promise<Buffer>;
}
