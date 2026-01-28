export const LANGUAGES = [
    { code: 'ko', name: '한국어 (Korean)', short: 'KO' },
    { code: 'en', name: 'English (영어)', short: 'EN' },
    { code: 'ja', name: '日本語 (Japanese)', short: 'JA' },
    { code: 'zh', name: '中文 (Chinese)', short: 'ZH' },
    { code: 'vi', name: 'Tiếng Việt (Vietnamese)', short: 'VI' },
    { code: 'es', name: 'Español (Spanish)', short: 'ES' },
    { code: 'fr', name: 'Français (French)', short: 'FR' },
    { code: 'de', name: 'Deutsch (German)', short: 'DE' },
    { code: 'ru', name: 'Русский (Russian)', short: 'RU' },
    { code: 'pt', name: 'Português (Portuguese)', short: 'PT' },
    { code: 'it', name: 'Italiano (Italian)', short: 'IT' },
    { code: 'id', name: 'Bahasa Indonesia (Indonesian)', short: 'ID' },
    { code: 'th', name: 'ไทย (Thai)', short: 'TH' },
    { code: 'tr', name: 'Türkçe (Turkish)', short: 'TR' },
    { code: 'pl', name: 'Polski (Polish)', short: 'PL' },
    { code: 'nl', name: 'Nederlands (Dutch)', short: 'NL' },
    { code: 'ar', name: 'العربية (Arabic)', short: 'AR' },
    { code: 'hi', name: 'हिन्दी (Hindi)', short: 'HI' },
    { code: 'bn', name: 'বাংলা (Bengali)', short: 'BN' },
    { code: 'ms', name: 'Bahasa Melayu (Malay)', short: 'MS' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];
