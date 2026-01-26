
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

/**
 * 🔍 작업 상태 조회 API (Get Job Status)
 * 
 * 특정 작업의 현재 진행 상태(PENDING, QUEUED, PROCESSING, COMPLETED, FAILED)를 조회합니다.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const session = await getUserSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await params;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let downloadUrl = null;
        if (job.status === 'COMPLETED' && job.translatedFileUrl) {
            downloadUrl = await getDownloadUrl(job.translatedFileUrl);
        }

        // ETA 계산 로직
        let remainingSeconds = null;
        if (job.status === 'PROCESSING' && job.fileSize) {
            // 최근 완료된 10개의 작업으로 평균 속도 계산
            const recentJobs = await prisma.job.findMany({
                where: {
                    status: 'COMPLETED',
                    completedAt: { not: null },
                    fileSize: { not: null }
                },
                orderBy: { completedAt: 'desc' },
                take: 10
            });

            if (recentJobs.length > 0) {
                const totalSpeed = recentJobs.reduce((acc, j) => {
                    const duration = (j.completedAt!.getTime() - j.createdAt.getTime()) / 1000; // 초 단위
                    if (duration <= 0) return acc;
                    return acc + ((j.fileSize || 0) / duration); // bytes per second
                }, 0);

                const avgSpeed = totalSpeed / recentJobs.length; // 평균 처리 속도 (B/s)

                if (avgSpeed > 0) {
                    const estimatedTotalTime = job.fileSize / avgSpeed;
                    const elapsed = (new Date().getTime() - job.createdAt.getTime()) / 1000;

                    // 남은 시간 = 예상 총 시간 - 경과 시간 (최소 5초)
                    remainingSeconds = Math.max(5, Math.round(estimatedTotalTime - elapsed));

                    // 진행률 기반 보정 (만약 진행률이 높으면 남은 시간 줄임)
                    if (job.progress > 0) {
                        const estimatedByProgress = estimatedTotalTime * (1 - (job.progress / 100));
                        // 두 예측의 평균 사용
                        remainingSeconds = Math.round((remainingSeconds + estimatedByProgress) / 2);
                    }
                }
            } else {
                // 데이터가 없으면 기본값 (1MB당 10초 가정)
                const estimatedTotalTime = (job.fileSize / 1024 / 1024) * 10;
                remainingSeconds = Math.round(estimatedTotalTime);
            }
        }

        return NextResponse.json({
            id: job.id,
            status: job.status,
            progress: job.progress,
            remainingSeconds: remainingSeconds,
            translatedFileUrl: downloadUrl, // 🗝️ Pre-signed URL 반환
            completedAt: job.completedAt,
        });

    } catch (error) {
        console.error("[Get Job Status API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
