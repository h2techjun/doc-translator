
import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * 🔐 세션 사용자 가져오기 (테스트 모드 지원)
 * 
 * 개발 환경에서 'x-test-user-id' 헤더가 존재하면 
 * 해당 ID를 가진 가상 사용자로 로그인된 것으로 간주합니다.
 * 이는 E2E 테스트 스크립트 실행을 위해 필요합니다.
 */
export async function getUserSession() {
    // 1. 실제 세션 확인
    const session = await auth();
    if (session?.user) {
        return session;
    }

    // 2. 개발 환경 테스트 백도어 확인
    if (process.env.NODE_ENV === 'development') {
        const headersList = await headers();
        const testUserId = headersList.get('x-test-user-id');

        if (testUserId) {
            console.warn(`⚠️ [Auth Bypass] Using Test User ID: ${testUserId}`);

            // DB에 테스트 유저가 없으면 생성 (Foreign Key 제약 조건 해결)
            try {
                await prisma.user.upsert({
                    where: { id: testUserId },
                    update: {},
                    create: {
                        id: testUserId,
                        email: 'test@example.com',
                        name: 'Test User',
                        image: null,
                        emailVerified: new Date(),
                    }
                });
            } catch (e) {
                console.error("Failed to upsert test user:", e);
                // 진행은 하되, 뒤에서 에러 날 수 있음
            }

            return {
                user: {
                    id: testUserId,
                    email: 'test@example.com',
                    image: null,
                    name: 'Test User',
                    tier: 'PRO'
                }
            };
        }
    }

    return null;
}
