export const UI_LANGUAGES = [
    { code: 'ko', name: '한국어 (Korean)', short: 'KO' },
    { code: 'en', name: 'English (영어)', short: 'EN' },
    { code: 'ja', name: '日本語 (Japanese)', short: 'JA' },
    { code: 'zh', name: '中文 (Chinese)', short: 'ZH' },
    { code: 'es', name: 'Español (Spanish)', short: 'ES' },
    { code: 'fr', name: 'Français (French)', short: 'FR' },
] as const;

export const TARGET_LANGUAGES = [
    ...UI_LANGUAGES,
    { code: 'de', name: 'Deutsch (German)', short: 'DE' },
    { code: 'ru', name: 'Русский (Russian)', short: 'RU' },
    { code: 'pt', name: 'Português (Portuguese)', short: 'PT' },
    { code: 'vi', name: 'Tiếng Việt (Vietnamese)', short: 'VI' },
    { code: 'ar', name: 'العربية (Arabic)', short: 'AR' },
    { code: 'hi', name: '히न्दी (Hindi)', short: 'HI' },
] as const;

// For backward compatibility or general use
export const LANGUAGES = TARGET_LANGUAGES;

export type LanguageCode = typeof TARGET_LANGUAGES[number]['code'];
