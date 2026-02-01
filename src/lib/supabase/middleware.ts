import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next();

    const pathname = request.nextUrl.pathname;

    // ⚡ Fast-path: Skip middleware logic for static assets and internal Next.js paths
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico' ||
        pathname.startsWith('/api/og')
    ) {
        return response;
    }

    try {
        // [Debug] Middleware Entry
        console.log(`[Middleware] Processing: ${pathname}`);

        // Create Middleware Client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll().map(c => {
                            try {
                                return {
                                    ...c,
                                    value: c.value.startsWith('%') ? decodeURIComponent(c.value) : c.value
                                }
                            } catch {
                                return c;
                            }
                        })
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

        // 4. Refresh Session (with Explicit Recovery)
    let { data: { user }, error } = await supabase.auth.getUser();

    // [Fix] Fundamental Solution: Manual Recovery if SDK fails but cookie exists
    if (!user) {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
            if (projectId) {
                const cookieName = `sb-${projectId}-auth-token`;
                const authCookie = request.cookies.get(cookieName);

                if (authCookie) {
                    console.log(`[Middleware] Manual Recovery Attempt for: ${cookieName}`);
                    let tokenValue: string | undefined;
                    let refreshToken: string | undefined;

                    // Parse JSON (handle both encoded and plain)
                    try {
                        const json = JSON.parse(authCookie.value);
                        tokenValue = json.access_token;
                        refreshToken = json.refresh_token;
                    } catch {
                         try {
                            const json = JSON.parse(decodeURIComponent(authCookie.value));
                            tokenValue = json.access_token;
                            refreshToken = json.refresh_token;
                         } catch (e) {
                             console.log(`[Middleware] Cookie Parse Failed: ${e}`);
                         }
                    }

                    if (tokenValue && refreshToken) {
                        const { data: recoverData, error: recoverError } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });

                        if (recoverData.session && recoverData.user) {
                            console.log(`[Middleware] ✅ Recovery Successful: ${recoverData.user.email}`);
                            user = recoverData.user; // Update user variable
                        } else {
                            console.log(`[Middleware] ❌ Recovery Failed: ${recoverError?.message}`);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[Middleware] Recovery Exception:`, e);
        }
    }

        // Admin Route Protection
        const isAdminPath = pathname.startsWith('/admin') || /^\/[a-z]{2}\/admin/.test(pathname);

        if (isAdminPath) {
            // Check auth status
            const isAuth = !!user; // user is now updated by recovery logic
            
            // Assuming 'locale' is extracted from the path or available elsewhere, e.g.,
            // const locale = pathname.split('/')[1]; // Example: /en/admin -> en
            // For now, using a placeholder or assuming it's defined.
            const locale = request.nextUrl.pathname.split('/')[1] || 'en'; // Placeholder for locale

            console.log(`[Middleware] Admin Access Check - Path: ${pathname}, Auth: ${isAuth}, Role: ${user?.role}`);

            if (!isAuth || (error && !user)) { // Use 'error' from getUser(), but respect 'user' if recovered
                console.warn(`[Middleware] Unauthorized Admin Access Attempt. Error: ${error?.message}`);
                const loginUrl = new URL(`/${locale}/signin`, request.url);
                loginUrl.searchParams.set('redirect', pathname);
                loginUrl.searchParams.set('reason', 'unauthenticated');
                // loginUrl.searchParams.set('debug_err', authError.message); 
                return NextResponse.redirect(loginUrl);
            }

            console.log(`[Middleware] Authenticated User: ${user.id} (${user.email}) accessing Admin.`);

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error(`[Middleware] Profile Fetch Error for user ${user.id}:`, profileError);
            } else {
                console.log(`[Middleware] User Role: ${profile?.role}`);
            }

            if (profileError || (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER')) {
                console.warn(`[Middleware] Unauthorized Admin access by user ${user.id}. Role: ${profile?.role || 'None'}`);
                // 권한이 없으면 403 Forbidden 페이지 표시 (로그 아웃 방지)
                const url = request.nextUrl.clone();
                url.pathname = '/forbidden';
                return NextResponse.rewrite(url);
            }

            console.log(`[Middleware] Admin Access Granted.`);
        }
    } catch (e) {
        console.error('[Middleware Error]:', e);
    }

    // Google Drive Picker 팝업 통신 허용
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');

    return response
}
