'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GEO_CONFIG, getGeoConfig, GeoConfig } from '@/lib/i18n/geo-config';
import { i18n, Locale, Dictionary } from '@/lib/i18n/dictionaries';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface GeoSmartContextType {
    // Core Geo Data (Immutable by User)
    region: string;
    currency: string;
    currencySymbol: string;
    pppFactor: number;

    // User Preferences (Mutable)
    uiLang: Locale;
    targetLang: string;
    t: Dictionary; // Typed translation object

    // User Data
    user: User | null;
    profile: any | null;

    // Actions
    setUiLang: (lang: Locale) => void;
    setTargetLang: (lang: string) => void;
    refreshProfile: () => Promise<void>;

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
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);

    // Derived State: Translation Object
    const t = i18n[uiLang] || i18n['en'];

    const supabase = createClient();

    // 🔄 Profile Sync Logic
    const refreshProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setProfile(null);
            return;
        }

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        setProfile(existingProfile);
    }, [supabase]);

    // 🌍 Geo-Detection Logic (Run once)
    useEffect(() => {
        if (isInitialized) return;

        const detectGeo = async () => {
            try {
                const savedUiLang = localStorage.getItem('global_ui_lang') as Locale;
                const savedTargetLang = localStorage.getItem('global_target_lang');
                let countryCode = 'US';

                // 🌍 1. Browser-based Geo Detection (Fastest & Zero Errors)
                // Why? 외부 무료 API(ipapi.co)는 Rate Limit(429) 및 CORS 문제 잦음.
                const browserLang = navigator.language || 'en';

                if (browserLang.startsWith('ko')) {
                    countryCode = 'KR';
                } else {
                    countryCode = 'US'; // Default fallback
                }

                const policy = getGeoConfig(countryCode);
                setRegion(countryCode);
                setConfig(policy);

                // 사용자 설정이 있으면 우선, 없으면 정책 기본값
                if (savedUiLang) setUiLangState(savedUiLang);
                else setUiLangState(policy.defaultUiLang);

                if (savedTargetLang) setTargetLangState(savedTargetLang);
                else setTargetLangState(policy.defaultTargetLang);

            } catch (error) {
                // 심각한 로직 에러(거의 발생 안 함)
                // console.error("Critical Geo Logic Error:", error);

                // 최후의 보루: 한국어 브라우저면 KR, 아니면 US
                const browserLang = navigator.language || 'en';
                if (browserLang.startsWith('ko')) {
                    setConfig(GEO_CONFIG['KR']);
                    setRegion('KR');
                    setUiLangState('ko');
                } else {
                    setConfig(GEO_CONFIG['DEFAULT']);
                    setRegion('US');
                }
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        detectGeo();
    }, [isInitialized]);

    // 🔐 Auth Sync Logic (Lifecycle management)
    useEffect(() => {
        // 1. Initial User Sync
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user);
                refreshProfile();
            }
        }).catch(() => {
            setUser(null);
            setProfile(null);
        });

        // 2. Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                refreshProfile();
            } else {
                setProfile(null);
            }

            if (event === 'SIGNED_OUT') {
                localStorage.removeItem('sb-access-token');
                localStorage.removeItem('sb-refresh-token');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, refreshProfile]);

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
        user,
        profile,
        setUiLang,
        setTargetLang,
        refreshProfile,
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
