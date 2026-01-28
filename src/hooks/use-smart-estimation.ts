
import { useState, useCallback } from 'react';

interface EstimationResult {
    estimatedSeconds: number;
    sampleSize?: number;
    avgSpeed?: number;
    loading: boolean;
}

export function useSmartEstimation() {
    const [estimation, setEstimation] = useState<EstimationResult>({
        estimatedSeconds: 0,
        loading: false
    });

    const estimateTime = useCallback(async (file: File) => {
        setEstimation(prev => ({ ...prev, loading: true }));
        try {
            // 파일 확장자 추출
            const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';

            const params = new URLSearchParams({
                fileType,
                fileSize: file.size.toString()
            });

            const res = await fetch(`/api/stats/estimate?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch estimation');

            const data = await res.json();
            setEstimation({
                estimatedSeconds: data.estimatedSeconds,
                sampleSize: data.sampleSize,
                avgSpeed: data.avgSpeed,
                loading: false
            });
        } catch (error) {
            console.error("Estimation Hook Error:", error);
            // 에러 시 기본값 (파일 크기 비례 단순 계산)
            const fallbackSeconds = 10 + Math.ceil(file.size / (1024 * 1024) * 20);
            setEstimation({
                estimatedSeconds: fallbackSeconds,
                loading: false
            });
        }
    }, []);

    return { estimation, estimateTime };
}
