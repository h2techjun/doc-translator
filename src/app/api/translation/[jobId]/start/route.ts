
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { addTranslationJob } from "@/lib/queue";
import { NextResponse } from "next/server";

/**
 * ▶️ 작업 시작 API (Start Job)
 * 
 * 클라이언트가 S3 업로드를 완료한 후 호출합니다.
 * 1. 작업 소유권 확인
 * 2. Redis 큐에 작업 추가
 * 3. DB 상태 업데이트 (QUEUED)
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> } // Next.js 15: params is a Promise
) {
    try {
        const session = await getUserSession();
        console.log("🔍 [Start Job API] Session User:", session?.user);

        if (!session?.user || !session.user.id) {
            console.error("❌ [Start Job API] No user session found or user ID is missing.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await params;

        // 작업 조회 및 소유권 확인
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.userId !== session.user.id) {
            console.error(`[Start Job API] Forbidden: Job owner (${job.userId}) !== Session user (${session.user.id})`);
            return NextResponse.json({ error: "Forbidden", details: `Owner: ${job.userId}, You: ${session.user.id}` }, { status: 403 });
        }

        // 이미 처리 중인지 확인
        if (job.status !== "PENDING") {
            return NextResponse.json({ error: "Job already queued or processed" }, { status: 400 });
        }

        // 큐에 추가 (우선순위 적용)
        // PRO 유저 = 1 (High), FREE 유저 = 10 (Low)
        const priority = session.user.tier === "PRO" ? 1 : 10;

        // 타겟 언어는 body에서 받거나 DB에 저장해뒀어야 함. 
        // 여기서는 간단히 body에서 다시 받거나, 위 upload 단계에서 메타데이터로 저장했어야 함.
        // MVP: Body에서 targetLang을 받음.
        const body = await req.json();
        const { targetLang } = body;

        if (!targetLang) {
            return NextResponse.json({ error: "Target language required" }, { status: 400 });
        }

        // originalFileUrl 예: uploads/userId/1234567890_filename.docx
        const originalFilename = job.originalFileUrl?.split('_').slice(1).join('_') || 'document';

        await addTranslationJob({
            jobId: job.id,
            fileKey: job.originalFileUrl,
            filename: originalFilename, // 워커에서 결과 파일명 생성 시 사용
            targetLang: targetLang,
            outputFormat: body.outputFormat || 'docx',
            userId: session.user.id,
        }, priority);

        // 상태 업데이트
        await prisma.job.update({
            where: { id: jobId },
            data: { status: "QUEUED" },
        });

        return NextResponse.json({ success: true, status: "QUEUED" });

    } catch (error) {
        console.error("[Start Job API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
