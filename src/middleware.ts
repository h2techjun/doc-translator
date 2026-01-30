import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createI18nMiddleware from 'next-intl/middleware';

const locales = ['en', 'ko', 'zh', 'ja', 'hi', 'th', 'vi'];

const i18nMiddleware = createI18nMiddleware({
    locales,
    defaultLocale: 'en',
    localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest) {
    // 1. i18n 미들웨어 실행
    const response = i18nMiddleware(request);

    // 2. 수파베이스 세션 업데이트 (인증 및 보안 가드)
    // updateSession 내부에 i18n response를 전달하여 헤더/쿠키를 병합할 수 있도록 구조가 되어있어야 함
    // 현재 updateSession은 새로운 NextResponse를 생성하므로, i18n 결과를 기반으로 응답을 처리하도록 위임
    return await updateSession(request, response)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api/qa|api/auth|api/payments|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
