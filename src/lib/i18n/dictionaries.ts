import { en } from './locales/en';
import { ko } from './locales/ko';
import { zh } from './locales/zh';
import { es } from './locales/es';
import { fr } from './locales/fr';

export const dictionaries = {
    en,
    ko,
    zh,
    es,
    fr
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof dictionaries.en;
