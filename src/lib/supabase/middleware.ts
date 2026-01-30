import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, i18nResponse?: NextResponse) {
    let response = i18nResponse || NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create Middleware Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // i18nResponse가 있는 경우 이를 기반으로 새 응답 생성
                    response = i18nResponse ? i18nResponse : NextResponse.next({ request });

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    // Admin Route Protection
    // i18n 경로가 포함된 경우를 고려하여 정규식 또는 인덱스 검사 (예: /ko/admin 또는 /admin)
    const pathname = request.nextUrl.pathname;
    const isAdminPath = pathname.startsWith('/admin') || /^\/[a-z]{2}\/admin/.test(pathname);

    if (isAdminPath) {
        if (!user) {
            return NextResponse.redirect(new URL('/signin', request.url))
        }

        // Check Admin Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Google Drive Picker 팝업 통신 허용
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');

    return response
}
