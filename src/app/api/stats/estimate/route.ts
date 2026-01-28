
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const fileType = searchParams.get('fileType') || 'docx';
    const fileSize = parseInt(searchParams.get('fileSize') || '0');

    if (fileSize === 0) {
        return NextResponse.json({ estimatedSeconds: 30 }); // Default fallback
    }

    const supabase = await createClient();

    try {
        // 1. 해당 파일 타입의 완료된 작업 통계 조회
        // status가 'COMPLETED'인 작업들의 평균 소요 시간과 평균 파일 크기를 구합니다.
        // 소요 시간 = updated_at - created_at (약식)
        const { data, error } = await supabase
            .from('translation_jobs')
            .select('created_at, updated_at, file_size')
            .eq('status', 'COMPLETED')
            .eq('file_type', fileType)
            .order('created_at', { ascending: false })
            .limit(50); // 최근 50개 데이터 기반

        if (error) {
            console.error('Error fetching statistics:', error);
            return NextResponse.json({ estimatedSeconds: calculateFallback(fileSize) });
        }

        if (!data || data.length < 3) {
            // 데이터가 부족하면 휴리스틱 계산
            return NextResponse.json({ estimatedSeconds: calculateFallback(fileSize) });
        }

        // 2. 단위 바이트당 처리 속도(ms/byte) 계산
        let totalSpeed = 0;
        let validSamples = 0;

        for (const job of data) {
            const start = new Date(job.created_at).getTime();
            const end = new Date(job.updated_at).getTime();
            const duration = end - start;

            if (duration > 0 && job.file_size > 0) {
                // 너무 짧거나(1초 미만) 너무 긴(1시간 이상) 데이터는 노이즈로 간주하고 제외 가능
                if (duration > 1000 && duration < 3600000) {
                    const speed = duration / job.file_size; // ms per byte
                    totalSpeed += speed;
                    validSamples++;
                }
            }
        }

        if (validSamples === 0) {
            return NextResponse.json({ estimatedSeconds: calculateFallback(fileSize) });
        }

        const avgSpeed = totalSpeed / validSamples; // Average ms per byte
        const estimatedMs = avgSpeed * fileSize;

        // 최소 5초는 보장 (네트워크 딜레이 등 감안)
        const estimatedSeconds = Math.max(5, Math.ceil(estimatedMs / 1000));

        return NextResponse.json({
            estimatedSeconds,
            sampleSize: validSamples,
            avgSpeed
        });

    } catch (e) {
        console.error('Estimation API Error:', e);
        return NextResponse.json({ estimatedSeconds: calculateFallback(fileSize) });
    }
}

function calculateFallback(fileSize: number): number {
    // 기본 가정: 1KB당 0.05초 (매우 대략적) + 기본 오버헤드 10초
    // 1MB = 1024 * 1024 bytes approx 1,000,000
    // 1MB 처리 = 50초? Gemini Flash 기준 1MB 텍스트는 꽤 큼.
    const estimated = 10 + (fileSize / 1024 / 1024) * 20; // 1MB당 20초 가정
    return Math.ceil(estimated);
}
