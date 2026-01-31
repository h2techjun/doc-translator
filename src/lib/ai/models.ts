export type ModelTier = 'flash-2.5' | 'flash-2.0' | 'pro-2.5';

export interface ModelSpec {
    id: string; // API Model Name (e.g., 'gemini-2.0-flash')
    name: string; // Display Name
    type: ModelTier;
    rpm: number; // Requests Per Minute limit
    tpm: number; // Tokens Per Minute limit
    description: string;
    contextWindow: number; // Input Token Limit
    recommendedFor: string[]; // e.g., ['general', 'bulk']
    throttleDelayMs: number; // Recommended delay between requests
}

export const AI_MODELS: Record<ModelTier, ModelSpec> = {
    'flash-2.5': {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash (Speed King)',
        type: 'flash-2.5',
        rpm: 1000,
        tpm: 1000000,
        description: '최신, 최고속도 번역 모델.',
        contextWindow: 1048576,
        recommendedFor: ['general', 'bulk', 'technical'],
        throttleDelayMs: 60
    },
    'flash-2.0': {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash (Stable Backup)',
        type: 'flash-2.0',
        rpm: 2000,
        tpm: 4000000,
        description: '검증된 안정성 모델.',
        contextWindow: 1048576,
        recommendedFor: ['backup', 'fallback'],
        throttleDelayMs: 30
    },
    'pro-2.5': {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro (Deep Thinker)',
        type: 'pro-2.5',
        rpm: 150,
        tpm: 2000000,
        description: '고품질 정밀 번역용.',
        contextWindow: 2097152,
        recommendedFor: ['literature', 'legal', 'contract', 'nuance'],
        throttleDelayMs: 400
    }
};

export const DEFAULT_MODEL = AI_MODELS['flash-2.5'];
export const BACKUP_MODEL = AI_MODELS['flash-2.0'];
export const HIGH_QUALITY_MODEL = AI_MODELS['pro-2.5'];
