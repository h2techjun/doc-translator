import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
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
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
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

    // Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    // Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check Admin Role (Fetching from public.users)
        // For MVP, we might hardcode admin email check to save DB call cost in middleware
        // or assume custom_claims via auth hook.
        // Here we do a lightweight check:
        /*
        const { data: profile } = await supabase
          .from('users')
          .select('subscription_tier') // or role
          .eq('id', user.id)
          .single()
          
        if (profile?.subscription_tier !== 'admin') {
           return NextResponse.redirect(new URL('/', request.url))
        }
        */
    }

    return response
}
