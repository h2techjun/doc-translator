
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getUploadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * 🛠️ 입력 데이터 검증 스키마 (Validation Schema)
 */
const requestSchema = z.object({
    filename: z.string().min(1),
    fileType: z.string(), // application/pdf, etc.
    targetLang: z.string().length(2), // en, ko, etc.
    size: z.number().max(100 * 1024 * 1024), // 100MB 제한
});

/**
 * 📤 업로드 요청 API (Get Upload URL)
 * 
 * 1. 사용자 인증 확인
 * 2. 요청 데이터 검증 (파일 타입, 크기 등)
 * 3. DB에 Job 레코드 생성 (PENDING 상태)
 * 4. S3 Pre-signed URL 생성 반환
 */
export async function POST(req: Request) {
    try {
        const session = await getUserSession();
        console.log("🔍 [Upload API] Session User:", session?.user);

        if (!session?.user || !session.user.id) {
            console.error("❌ [Upload API] No user session found or user ID is missing.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = requestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error }, { status: 400 });
        }

        const { filename, fileType, targetLang, size } = result.data;

        // [Self-Healing] DB에 유저가 존재하는지 확인하고 없으면 생성 (개발 환경 이슈 방지)
        let user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            console.warn(`⚠️ [Upload API] User ${session.user.id} not found in DB. Attempting auto-creation...`);

            const email = session.user.email || `missing-${session.user.id}@example.com`;

            // 이메일 충돌 확인
            const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
            if (existingUserByEmail) {
                console.warn(`⚠️ [Upload API] Email ${email} already exists with ID ${existingUserByEmail.id}. Deleting stale user...`);
                // 기존 유저 삭제 (세션 ID와 일치시키기 위해)
                // 주의: 실제 운영 환경에서는 절대 하면 안 되는 로직입니다. Jobs가 있다면 cascade delete 설정 필요.
                try {
                    await prisma.user.delete({ where: { id: existingUserByEmail.id } });
                } catch (delError) {
                    console.error("Failed to delete stale user:", delError);
                    // 삭제 실패 시 이메일 변경하여 진행
                }
            }

            try {
                user = await prisma.user.create({
                    data: {
                        id: session.user.id,
                        email: existingUserByEmail ? `conflict-${Date.now()}-${email}` : email, // 삭제 실패 대비
                        name: session.user.name || 'Anonymous',
                        tier: 'FREE'
                    }
                });
            } catch (createError) {
                // 삭제 후 생성 시에도 동시성 이슈로 실패할 수 있음. 
                // 이메일 변경하여 재시도 (최후의 수단)
                user = await prisma.user.create({
                    data: {
                        id: session.user.id,
                        email: `recovered-${Date.now()}-${email}`,
                        name: session.user.name || 'Anonymous',
                        tier: 'FREE'
                    }
                });
            }
        }

        // 유니크한 파일 키 생성 (uploads/userId/timestamp_filename)
        const fileKey = `uploads/${session.user.id}/${Date.now()}_${filename}`;

        // DB에 작업 생성
        const job = await prisma.job.create({
            data: {
                userId: session.user.id,
                fileType,
                status: "PENDING",
                priority: session.user.tier === "PRO" ? "HIGH" : "LOW",
                originalFileUrl: fileKey,
                fileSize: size,
            },
        });

        // S3 업로드 URL 생성
        const uploadUrl = await getUploadUrl(fileKey, fileType);

        return NextResponse.json({
            jobId: job.id,
            uploadUrl,
            fileKey,
        });

    } catch (error: any) {
        console.error("❌ [Upload API Error]:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            code: error.code, // AWS SDK or Prisma Error Code
            name: error.name
        });

        // 1. Prisma(DB) 연결 에러 처리
        // P1001: Can't reach database server
        if (error.code === 'P1001' || error.message?.includes('database server')) {
            return NextResponse.json({
                error: "Database Connection Failed",
                details: "Cannot connect to PostgreSQL. Please ensure Docker containers are running.",
                originalError: error.message
            }, { status: 503 });
        }

        // 2. S3 연결 에러에 대한 구체적인 피드백
        if (error.code === 'ECONNREFUSED' || error.name === 'TimeoutError' || error.message?.includes('Network Error')) {
            return NextResponse.json({
                error: "Storage Connection Failed",
                details: "S3/MinIO service is unreachable. Please check Docker containers.",
                originalError: error.message
            }, { status: 503 });
        }

        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
