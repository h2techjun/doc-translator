'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { LANGUAGES } from '@/lib/i18n/languages';

/**
 * 🔗 useUrlSync
 * URL의 슬러그(/translate/en-to-ko/...)를 분석하여 앱의 번역 대상 언어 상태와 동기화합니다.
 */
export function useUrlSync() {
    const params = useParams();
    const { setTargetLang } = useGeoSmart();
    const slug = params?.slug as string[];

    useEffect(() => {
        if (!slug || slug.length === 0) return;

        const firstSegment = slug[0];
        let detectedTarget: string | null = null;

        // 1. "xx-to-yy" 패턴 분석 (예: en-to-ko, ko-to-ja)
        if (firstSegment.includes('-to-')) {
            const parts = firstSegment.split('-to-');
            if (parts.length === 2) {
                detectedTarget = parts[1];
            }
        }
        // 2. 개별 세그먼트 분석 (예: /translate/en/ko/...)
        else if (slug.length >= 2) {
            const potentialTarget = slug[1];
            // 유효한 언어 코드인지 확인
            if (LANGUAGES.some(lang => lang.code === potentialTarget)) {
                detectedTarget = potentialTarget;
            }
        }

        // 유효한 언어 코드인 경우 동기화 실행
        if (detectedTarget && LANGUAGES.some(lang => lang.code === detectedTarget)) {
            console.log(`[useUrlSync] 🔄 URL 기반 도착 언어 동기화: ${detectedTarget}`);
            setTargetLang(detectedTarget);
        }
    }, [slug, setTargetLang]);
}
