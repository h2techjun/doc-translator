export interface TranslatorService {
    /**
     * 텍스트 배열을 받아 번역된 텍스트 배열을 반환
     * @param texts 원본 텍스트 배열
     * @param targetLang 목표 언어 코드 (e.g., 'ko', 'en')
     */
    translateBatch(texts: string[], targetLang: string): Promise<string[]>;
}

export class MockTranslatorService implements TranslatorService {
    async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        // 개발용 Mock: 그냥 [Translated] 접두사만 붙임
        return texts.map(t => `[${targetLang}] ${t}`);
    }
}

// TODO: 실제 Google Gemini / DeepL 구현체 추가
