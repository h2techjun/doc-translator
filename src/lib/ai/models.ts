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
        rpm: 1000, // 표 데이터 기반 보정 (1K)
        tpm: 1000000, // 표 데이터 기반 보정 (1M)
        description: '최신, 최고속도 번역 모델.',
        contextWindow: 1048576,
        recommendedFor: ['general', 'bulk', 'technical'],
        throttleDelayMs: 60 // 1000ms / 16.6 RPS -> ~60ms
    },
    'flash-2.0': {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash (Stable Backup)',
        type: 'flash-2.0',
        rpm: 2000, // 2.0 Flash는 표에서 2K로 확인됨
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
        rpm: 150, // 표 데이터 기반 (150)
        tpm: 2000000, // 표 데이터 기반 (2M)
        description: '고품질 정밀 번역용.',
        contextWindow: 2097152,
        recommendedFor: ['literature', 'legal', 'contract', 'nuance'],
        throttleDelayMs: 400 // 60s / 150 = 0.4s
    }
};

export const DEFAULT_MODEL = AI_MODELS['flash-2.5'];
export const BACKUP_MODEL = AI_MODELS['flash-2.0'];
export const HIGH_QUALITY_MODEL = AI_MODELS['pro-2.5'];
