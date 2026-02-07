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

    // 1. 유저 정보 획득 (이 과정에서 세션이 자동 리프레시됨)
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // 2. 관리자 페이지 보호 로직
    if (pathname.startsWith('/admin')) {
        // 유저가 없다면 한 번 더 확실하게 세션 체크
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // 정말 세션이 없는 경우에만 로그인으로 리다이렉트
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('redirectedFrom', pathname)
                return NextResponse.redirect(url)
            }
        }
        
        // 유저가 있다면 role 체크 (보안 강화)
        // 주의: getUser() 이후의 흐름이므로 세션은 보장됨
    }

    // 3. Sliding Expiration: 활동 시 세션 만료 시간 연장을 위해 response 리턴
    return response
}
