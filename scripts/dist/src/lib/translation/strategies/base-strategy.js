"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTranslationStrategy = void 0;
const generative_ai_1 = require("@google/generative-ai");
/**
 * 🛠️ 공통 번역 유틸리티 (Gemini API Version)
 */
class BaseTranslationStrategy {
    constructor() {
        // Worker 프로세스에서 환경변수 로드 확인
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing via process.env");
            throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    /**
     * 🤖 Gemini를 이용한 문장 배열 일괄 번역 (Batch Processing)
     * 🎯 목적: 성능 향량 및 API 호출 횟수 절약, 문맥 보존 강화
     */
    async translateBatch(texts, targetLang) {
        if (!texts || texts.length === 0)
            return [];
        // 빈 문자열 필터링 및 원본 인덱스 보관
        const validTexts = texts.map((t, i) => ({ t: t.trim(), i })).filter(x => x.t.length > 0);
        if (validTexts.length === 0)
            return texts;
        try {
            // 배치 크기 조절 (너무 크면 오류 가능성 있으므로 20개 단위 권장)
            const prompt = `Translate the following ${validTexts.length} segments into ${targetLang}. 
            Provide the translations as a JSON array of strings in the exact same order.
            Maintain the formatting like capitalization and punctuation.
            
            Segments:
            ${JSON.stringify(validTexts.map(x => x.t))}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const translatedArray = JSON.parse(cleanJson);
            // 결과 매핑 (빈 칸 복원)
            const finalResults = [...texts];
            validTexts.forEach((vt, index) => {
                finalResults[vt.i] = translatedArray[index] || vt.t;
            });
            return finalResults;
        }
        catch (error) {
            console.error("[Gemini Batch Error]:", error);
            return texts; // 실패 시 안전하게 원본 반환
        }
    }
    /**
     * 🤖 단일 문장 번역 (내부적으로 일괄 번역 로직 재사용)
     */
    async translateText(text, targetLang) {
        const results = await this.translateBatch([text], targetLang);
        return results[0];
    }
}
exports.BaseTranslationStrategy = BaseTranslationStrategy;
