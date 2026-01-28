'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GEO_CONFIG, getGeoConfig, GeoConfig } from '@/lib/i18n/geo-config';
import { i18n, Locale } from '@/lib/i18n/dictionaries';

interface GeoSmartContextType {
    // Core Geo Data (Immutable by User)
    region: string;
    currency: string;
    currencySymbol: string;
    pppFactor: number;

    // User Preferences (Mutable)
    uiLang: Locale;
    targetLang: string;
    t: typeof i18n['ko']; // Typed translation object

    // Actions
    setUiLang: (lang: Locale) => void;
    setTargetLang: (lang: string) => void;

    // Status
    isLoading: boolean;
}

const GeoSmartContext = createContext<GeoSmartContextType | undefined>(undefined);

export function GeoSmartProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<GeoConfig>(GEO_CONFIG['DEFAULT']);
    const [region, setRegion] = useState<string>('UNKNOWN');
    const [uiLang, setUiLangState] = useState<Locale>('ko'); // Default fallback
    const [targetLang, setTargetLangState] = useState<string>('en');
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Derived State: Translation Object
    const t = i18n[uiLang] || i18n['en'];

    useEffect(() => {
        const detectGeo = async () => {
            try {
                // 0. Check LocalStorage First
                const savedUiLang = localStorage.getItem('global_ui_lang') as Locale;
                const savedTargetLang = localStorage.getItem('global_target_lang');

                // 1. IP Geolocation (Source of Truth for Price/Region)
                // We only fetch if we don't have region info, OR we always fetch to ensure accuracy?
                // Let's fetch to set Region/Currency correctly, but respect Language preference.
                const res = await fetch('https://ipapi.co/json/');

                let countryCode = 'US';
                if (res.ok) {
                    const data = await res.json();
                    countryCode = data.country_code || 'US';
                }

                // 2. Load Policy
                const policy = getGeoConfig(countryCode);
                setRegion(countryCode);
                setConfig(policy);

                // 3. Set Language State (Priority: LocalStorage > Geo Policy)
                if (savedUiLang) {
                    setUiLangState(savedUiLang);
                } else {
                    setUiLangState(policy.defaultUiLang);
                }

                if (savedTargetLang) {
                    setTargetLangState(savedTargetLang);
                } else {
                    setTargetLangState(policy.defaultTargetLang);
                }

            } catch (error) {
                console.error("📍 Geo-Detection Failed:", error);

                // Fallback Logic
                const savedUiLang = localStorage.getItem('global_ui_lang') as Locale;
                if (savedUiLang) {
                    setUiLangState(savedUiLang);
                } else {
                    const browserLang = navigator.language.slice(0, 2);
                    if (browserLang === 'ko') {
                        setConfig(GEO_CONFIG['KR']);
                        setRegion('KR');
                        setUiLangState('ko');
                        setTargetLangState('en');
                    } else {
                        setConfig(GEO_CONFIG['DEFAULT']);
                        setRegion('US');
                    }
                }
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        if (!isInitialized) {
            detectGeo();
        }
    }, [isInitialized]);

    const setUiLang = (lang: Locale) => {
        setUiLangState(lang);
        localStorage.setItem('global_ui_lang', lang);
    };

    const setTargetLang = (lang: string) => {
        setTargetLangState(lang);
        localStorage.setItem('global_target_lang', lang);
    };

    const value = {
        region,
        currency: config.currency,
        currencySymbol: config.currencySymbol,
        pppFactor: config.pppFactor,
        uiLang,
        targetLang,
        t,
        setUiLang,
        setTargetLang,
        isLoading
    };

    return (
        <GeoSmartContext.Provider value={value}>
            {children}
        </GeoSmartContext.Provider>
    );
}

export function useGeoSmart() {
    const context = useContext(GeoSmartContext);
    if (context === undefined) {
        throw new Error('useGeoSmart must be used within a GeoSmartProvider');
    }
    return context;
}
