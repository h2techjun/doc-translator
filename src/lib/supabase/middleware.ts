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

        // 0. Manual Recovery (Improved)
        if (!user) {
            try {
                // Try standard cookie name first
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
                let authCookie = projectId ? request.cookies.get(`sb-${projectId}-auth-token`) : null;

                // Fallback: Search for any supabase auth token (for custom domains or different envs)
                if (!authCookie) {
                    const allCookies = request.cookies.getAll();
                    authCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
                    if (authCookie) console.log(`[Middleware] Found fallback auth cookie: ${authCookie.name}`);
                }

                if (authCookie) {
                    console.log(`[Middleware] Manual Recovery Attempt using cookie: ${authCookie.name}`);
                    let tokenValue: string | undefined;
                    let refreshToken: string | undefined;

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
                            user = recoverData.user; 
                        } else {
                            console.log(`[Middleware] ❌ Recovery Failed: ${recoverError?.message}`);
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
            const isAuth = !!user;
            
            console.log(`[Middleware] Admin Access Check - Path: ${pathname}, Auth: ${isAuth}, Role: ${user?.role}`);

            if (!isAuth || (error && !user)) {
                console.warn(`[Middleware] Unauthorized Admin Access Attempt. Error: ${error?.message}`);
                // [Change] Relaxed Middleware Blocking - Delegating to Client-side Guard
                // const loginUrl = new URL('/signin', request.url);
                // loginUrl.searchParams.set('redirect', pathname);
                // loginUrl.searchParams.set('reason', 'unauthenticated');
                
                // // [Fix] Preserve cookies on redirect (Critical for Session Persistence)
                // const redirectResponse = NextResponse.redirect(loginUrl);
                // const sourceCookies = response.cookies.getAll();
                // sourceCookies.forEach(cookie => {
                //     redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
                // });
                
                // return redirectResponse;
                 console.log('[Middleware] Passing through to Client Guard...');
            }

            if (user) {
                const authUser = user;
                console.log(`[Middleware] Authenticated User: ${authUser.id} (${authUser.email}) accessing Admin.`);

                // 1. Fetch Profile (Optimized: only if user exists)
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, status, banned_until, ban_reason')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) {
                    console.error(`[Middleware] Profile Fetch Error for user ${authUser.id}:`, profileError);
                }

                // 2. [Security] Block Suspended/Banned Users
                // Skip check for signout or specific status pages to avoid infinite loops
                const isStatusPage = pathname.includes('/account-status') || pathname.includes('/signin');
                
                if (profile && !isStatusPage) {
                    const now = new Date();
                    const isBanned = profile.status === 'BANNED';
                    const isSuspended = profile.status === 'SUSPENDED' && (!profile.banned_until || new Date(profile.banned_until) > now);

                    if (isBanned || isSuspended) {
                        console.warn(`[Middleware] Access blocked for ${profile.status} user: ${authUser.id}`);
                        // locale is already defined above or we extract it here
                        const localeFromPath = pathname.split('/')[1] || 'en';
                        const statusUrl = new URL(`/${localeFromPath}/account-status`, request.url);
                        statusUrl.searchParams.set('status', profile.status);
                        if (profile.ban_reason) statusUrl.searchParams.set('reason', profile.ban_reason);
                        if (profile.banned_until) statusUrl.searchParams.set('until', profile.banned_until);
                        return NextResponse.redirect(statusUrl);
                    }
                }

                // 3. Admin Route Protection
                // 'isAdminPath' is already true here because of the outer check (line 111)

                console.log(`[Middleware] Admin Access Check - Path: ${pathname}, Role: ${profile?.role}`);

                if (profileError || (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER')) {
                    console.warn(`[Middleware] Unauthorized Admin access by user ${authUser.id}. Role: ${profile?.role || 'None'}`);
                    const url = request.nextUrl.clone();
                    url.pathname = '/forbidden';
                    return NextResponse.rewrite(url);
                }

                // 3-1. [Security] Granular Permission Checks for ADMIN (MASTER bypasses)
                if (profile.role === 'ADMIN') {
                    const { data: permissions } = await supabase
                        .from('admin_permissions')
                        .select('*')
                        .eq('user_id', authUser.id)
                        .maybeSingle(); // Use maybeSingle to avoid 406 error if row missing

                    const subPath = pathname.replace(/^\/[a-z]{2}\/admin/, '/admin');

                    // If no permissions row exists, permissions is null. Default to false (Block).
                    
                    if (subPath.startsWith('/admin/users') && !permissions?.can_manage_users) {
                        console.warn(`[Middleware] Admin ${authUser.id} denied access to /admin/users (Missing can_manage_users)`);
                        return NextResponse.redirect(new URL('/forbidden', request.url));
                    }

                    if (subPath.startsWith('/admin/permissions') && !permissions?.can_manage_admins) {
                        console.warn(`[Middleware] Admin ${authUser.id} denied access to /admin/permissions (Missing can_manage_admins)`);
                        return NextResponse.redirect(new URL('/forbidden', request.url));
                    }

                    if (subPath.startsWith('/admin/audit-logs') && !permissions?.can_access_security) {
                        console.warn(`[Middleware] Admin ${authUser.id} denied access to /admin/audit-logs (Missing can_access_security)`);
                        return NextResponse.redirect(new URL('/forbidden', request.url));
                    }
                }

                console.log(`[Middleware] Admin Access Granted.`);
            }
        }
    } catch (e) {
        console.error('[Middleware Error]:', e);
    }

    // Google Drive Picker 팝업 통신 허용
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');

    return response
}
