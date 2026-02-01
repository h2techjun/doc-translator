import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = cookies()

    // [Debug] Check if cookies are available in RSC
    const allCookies = cookieStore.getAll();
    console.log(`[RSC] Cookies count: ${allCookies.length}`);
    // console.log(`[RSC] Cookies:`, allCookies.map(c => c.name));

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const all = cookieStore.getAll()
                    // [Critical Fix] Re-encode cookies for API Routes/RSC
                    // This ensures Supabase SDK gets the properly encoded value it expects
                    return all.map(c => ({
                        ...c,
                        value: encodeURIComponent(c.value)
                    }))
                },
                setAll(cookiesToSet: any) {
                    try {
                        cookiesToSet.forEach((cookie: any) =>
                            cookieStore.set(cookie.name, cookie.value, cookie.options)
                        )
                    } catch {
                        // `setAll` 메소드가 서버 컴포넌트에서 호출되었습니다.
                        // 미들웨어에서 사용자 세션을 갱신하고 있다면 이 에러는 무시해도 안전합니다.
                    }
                },
            },
        }
    )
}
