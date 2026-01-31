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
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) =>
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
    const pathname = request.nextUrl.pathname;
    const isAdminPath = pathname.startsWith('/admin') || /^\/[a-z]{2}\/admin/.test(pathname);

    if (isAdminPath) {
        if (!user) {
            // Redirect to signin with return URL
            const url = new URL('/signin', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }

        try {
            // Check Admin Role
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            // Debugging: If error (e.g., column missing) or role mismatch
            if (error || (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER')) {
                console.error('[Middleware] Admin access denied:', { userId: user.id, error, role: profile?.role });
                // Redirect to home with error parameter
                return NextResponse.redirect(new URL('/?error=access_denied', request.url));
            }
        } catch (err) {
            console.error('[Middleware] Unexpected auth error:', err);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Google Drive Picker 팝업 통신 허용
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');

    return response
}
