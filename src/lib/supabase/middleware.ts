import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 💡 원래 코드의 핵심: getUser()를 통해 세션을 확인
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 1. 관리자 페이지 보호 (/admin)
    if (pathname.startsWith('/admin')) {
        // 새로고침 시 세션 복구가 늦어지는 경우를 대비해 getSession()으로 한 번 더 검증
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // 로그인 페이지인 /signin 으로 정확히 리다이렉트
                const url = request.nextUrl.clone()
                url.pathname = '/signin'
                url.searchParams.set('redirectedFrom', pathname)
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}
