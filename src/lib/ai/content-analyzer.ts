import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_MODELS, ModelSpec } from "./models";

export type DocumentType = 'general' | 'legal' | 'literature' | 'technical';

export class ContentAnalyzer {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // 분석은 가장 빠르고 똑똑한 2.0 Flash 사용
        this.model = this.genAI.getGenerativeModel({ model: AI_MODELS['flash-2.5'].id });
    }

    /**
     * 🕵️ 문서 내용을 분석하여 최적의 번역 모델을 추천합니다.
     * @param textSample 문서의 앞부분 텍스트 샘플 (약 1000자 권장)
     */
    async analyzeAndRecommend(textSample: string): Promise<{
        docType: DocumentType;
        recommendedModel: ModelSpec;
        reason: string;
    }> {
        if (!textSample || textSample.length < 50) {
            return {
                docType: 'general',
                recommendedModel: AI_MODELS['flash-2.5'],
                reason: '샘플 텍스트가 너무 짧아 기본 모델을 사용합니다.'
            };
        }

        try {
            const prompt = `Analyze the following text sample and classify its type into one of these categories:
            1. 'legal': Contracts, terms of service, official documents (Required high precision).
            2. 'literature': Novels, poems, essays, scripts (Requires nuance and style).
            3. 'technical': Manuals, specs, code comments (Requires accuracy).
            4. 'general': Daily conversation, news, emails, generic content.

            Text Sample:
            "${textSample.slice(0, 1000).replace(/"/g, '')}"

            Respond in JSON format:
            {
                "type": "legal" | "literature" | "technical" | "general",
                "reason": "Brief explanation"
            }`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            const docType = analysis.type as DocumentType;
            let recommendedModel = AI_MODELS['flash-2.5']; // Default

            // 결정 로직
            if (docType === 'legal' || docType === 'literature') {
                recommendedModel = AI_MODELS['pro-2.5']; // 고품질 필요
            } else if (docType === 'technical') {
                recommendedModel = AI_MODELS['flash-2.5']; // 기술 문서는 2.0 Flash도 충분히 잘함 (속도 중요)
            }

            return {
                docType,
                recommendedModel,
                reason: analysis.reason
            };

        } catch (error) {
            console.error("Content Analysis Failed:", error);
            return {
                docType: 'general',
                recommendedModel: AI_MODELS['flash-2.5'],
                reason: '분석 중 오류가 발생하여 기본 모델로 전환합니다.'
            };
        }
    }
}
