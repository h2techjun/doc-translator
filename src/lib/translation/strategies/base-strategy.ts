import { Readable } from 'stream';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_MODELS, BACKUP_MODEL, DEFAULT_MODEL, ModelSpec } from '../../ai/models';

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
 * - 지능형 모델 스위칭 (Dynamic Model Switching)
 * - 자동 백업 전환 (Auto Fallback)
 * - 속도 조절 (Throttling)
 */
export abstract class BaseTranslationStrategy implements TranslationStrategy {
    protected genAI: GoogleGenerativeAI;
    protected currentModelSpec: ModelSpec = DEFAULT_MODEL; // Default: 2.0 Flash

    constructor() {
        // Worker 프로세스에서 환경변수 로드 확인
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing via process.env");
            throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * 🧠 분석 결과에 따라 사용할 모델을 변경합니다.
     */
    public setModel(modelSpec: ModelSpec) {
        console.log(`[Strategy] Switching Model to: ${modelSpec.name} (${modelSpec.id})`);
        this.currentModelSpec = modelSpec;
    }

    abstract translate(fileBuffer: Buffer, targetLang: string, jobId?: string, targetFormat?: string): Promise<Buffer>;

    /**
     * 🤖 Gemini를 이용한 문장 배열 일괄 번역 (Batch Processing with Smart Fallback)
     */
    protected async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        if (!texts || texts.length === 0) return [];

        // 빈 문자열 필터링 및 원본 인덱스 보관
        const validTexts = texts.map((t, i) => ({ t: t.trim(), i })).filter(x => x.t.length > 0);
        if (validTexts.length === 0) return texts;

        let attempt = 0;
        const maxRetries = 5;
        let activeModelId = this.currentModelSpec.id; // Start with current model

        while (attempt <= maxRetries) {
            try {
                // 모델 인스턴스 생성 (동적)
                const model = this.genAI.getGenerativeModel({ model: activeModelId });

                const prompt = `You are a professional translator engine. 
                Translate the following ${validTexts.length} segments into ${targetLang}.
                
                CRITICAL RULES:
                1. Translate EVERYTHING, including headers (e.g., "제1조" -> "Article 1"), labels, and structural markers.
                2. Do NOT leave any original language text behind.
                3. Do NOT include pronunciation guides or dual-language brackets.
                4. Return ONLY the translated segments as a JSON array of strings in the exact same order.
                
                Segments:
                ${JSON.stringify(validTexts.map(x => x.t))}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const translatedArray: string[] = JSON.parse(cleanJson);

                // 결과 매핑 (빈 칸 복원)
                const finalResults = [...texts];
                validTexts.forEach((vt, index) => {
                    finalResults[vt.i] = translatedArray[index] || vt.t;
                });

                return finalResults;

            } catch (error: any) {
                console.error(`[Gemini Batch Error] Attempt ${attempt + 1}/${maxRetries + 1} (${activeModelId}):`, error.message);

                const isQuotaError = error.message?.includes("429") || error.message?.includes("Quota") || error.status === 429;

                // 1. Quota Error -> Wait & Retry (Same Model)
                if (isQuotaError && attempt < maxRetries) {
                    const delayMs = Math.pow(2, attempt) * 2000;
                    console.warn(`⚠️ 429 Limit on ${activeModelId}. Retrying in ${delayMs}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    attempt++;
                    continue;
                }

                // 2. Other Errors (500, 503, etc) -> Switch to Backup Model immediately
                // 만약 현재 모델이 이미 백업 모델이면, 그냥 재시도.
                if (!isQuotaError && activeModelId !== BACKUP_MODEL.id) {
                    console.warn(`🚨 Non-Quota Error detected. Switching to BACKUP MODEL (${BACKUP_MODEL.name}) for stability.`);
                    activeModelId = BACKUP_MODEL.id;
                    attempt++; // 시도 횟수 증가시키고 로직 재진입
                    continue;
                }

                // 최후의 수단: 에러 던지기
                if (attempt >= maxRetries) {
                    console.error(`❌ [BaseStrategy] All retries failed for batch. Model: ${activeModelId}`);
                    // Silent Fail 제거: 사용자에게 에러를 알림
                    throw new Error(`Translation failed after ${maxRetries} attempts. Last error: ${error.message}`);
                }

                attempt++;
            }
        }
        return texts;
    }

    /**
     * 🤖 단일 문장 번역
     */
    protected async translateText(text: string, targetLang: string): Promise<string> {
        const results = await this.translateBatch([text], targetLang);
        return results[0];
    }
}
