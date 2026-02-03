import { Locale } from './dictionaries';

export interface GeoConfig {
    country: string;
    currency: string;
    currencySymbol: string;
    pppFactor: number; // 1.0 = Standard (USD 10), 0.4 = 60% Discount (USD 4 equivalent)
    defaultUiLang: Locale;
    defaultTargetLang: string;
}

// 🌏 Global Geo Database
// This is the source of truth for Region-based Policy (Price, Currency, Defaults)
export const GEO_CONFIG: Record<string, GeoConfig> = {
    // 🇰🇷 South Korea
    'KR': {
        country: 'South Korea',
        currency: 'KRW',
        currencySymbol: '₩',
        pppFactor: 1.0, // Standard Price
        defaultUiLang: 'ko',
        defaultTargetLang: 'en'
    },
    // 🇺🇸 USA (Standard)
    'US': {
        country: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        pppFactor: 1.0,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇯🇵 Japan
    'JP': {
        country: 'Japan',
        currency: 'JPY',
        currencySymbol: '¥',
        pppFactor: 1.0,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇨🇳 China
    'CN': {
        country: 'China',
        currency: 'CNY',
        currencySymbol: '¥',
        pppFactor: 0.6, // 40% Discount
        defaultUiLang: 'zh',
        defaultTargetLang: 'ko'
    },
    // 🇻🇳 Vietnam (High PPP Discount)
    'VN': {
        country: 'Vietnam',
        currency: 'VND',
        currencySymbol: '₫',
        pppFactor: 0.4, // 60% Discount
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇮🇳 India (High PPP Discount)
    'IN': {
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        pppFactor: 0.3, // 70% Discount
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇮🇩 Indonesia
    'ID': {
        country: 'Indonesia',
        currency: 'IDR',
        currencySymbol: 'Rp',
        pppFactor: 0.4,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇹🇭 Thailand
    'TH': {
        country: 'Thailand',
        currency: 'THB',
        currencySymbol: '฿',
        pppFactor: 0.5,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },
    // 🇪🇺 Euro Zone (Simplified)
    'DE': { country: 'Germany', currency: 'EUR', currencySymbol: '€', pppFactor: 1.0, defaultUiLang: 'en', defaultTargetLang: 'ko' },
    'FR': { country: 'France', currency: 'EUR', currencySymbol: '€', pppFactor: 1.0, defaultUiLang: 'fr', defaultTargetLang: 'ko' },
    'ES': { country: 'Spain', currency: 'EUR', currencySymbol: '€', pppFactor: 0.9, defaultUiLang: 'es', defaultTargetLang: 'ko' },
    'IT': { country: 'Italy', currency: 'EUR', currencySymbol: '€', pppFactor: 0.9, defaultUiLang: 'en', defaultTargetLang: 'ko' },

    // 🇷🇺 Russia
    'RU': {
        country: 'Russia',
        currency: 'RUB',
        currencySymbol: '₽',
        pppFactor: 0.5,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    },

    // 🌎 Default Fallback (Global)
    'DEFAULT': {
        country: 'Global',
        currency: 'USD',
        currencySymbol: '$',
        pppFactor: 1.0,
        defaultUiLang: 'en',
        defaultTargetLang: 'ko'
    }
};

export function getGeoConfig(countryCode: string): GeoConfig {
    return GEO_CONFIG[countryCode] || GEO_CONFIG['DEFAULT'];
}
