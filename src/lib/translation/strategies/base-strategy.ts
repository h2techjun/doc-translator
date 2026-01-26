import { Readable } from 'stream';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 🎨 번역 엔진 인터페이스 (Translation Strategy Interface)
 */
/**
 * 🎨 번역 엔진 인터페이스 (Translation Strategy Interface)
 * 스트림 대신 Buffer를 사용하여 안정성을 확보합니다.
 */
export interface TranslationStrategy {
    translate(fileBuffer: Buffer, targetLang: string, jobId?: string, targetFormat?: string): Promise<Buffer>;
}

/**
 * 🛠️ 공통 번역 유틸리티 (Gemini API Version)
 */
export abstract class BaseTranslationStrategy implements TranslationStrategy {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        // Worker 프로세스에서 환경변수 로드 확인
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing via process.env");
            throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    abstract translate(fileBuffer: Buffer, targetLang: string, jobId?: string, targetFormat?: string): Promise<Buffer>;

    /**
     * 🤖 Gemini를 이용한 고성능 문장 번역
     */
    protected async translateText(text: string, targetLang: string): Promise<string> {
        if (!text || text.trim().length === 0) return text;

        try {
            const prompt = `Translate the following text into ${targetLang}. 
            Only return the translated text without any explanations or extra characters.
            
            Text: ${text}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const translated = response.text().trim();

            return translated;
        } catch (error) {
            console.error("[Gemini API Error]:", error);
            // 실패 시 원본 유지를 통한 서비스 연속성 확보
            return text;
        }
    }
}
