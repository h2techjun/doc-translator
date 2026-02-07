
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 0. Manual Session Recovery (The Hammer Fix 🔨)
    const supabase = await createServerClient();
    let { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
            if (projectId) {
                const cookieName = `sb-${projectId}-auth-token`;
                const authCookie = req.cookies.get(cookieName);
                if (authCookie) {
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
                            console.error("[Permissions API] Manual Cookie Parse Failed:", e);
                        }
                    }
                    if (tokenValue && refreshToken) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });
                        if (recoverData.user) {
                            console.log(`[Permissions API] Manual Recovery Success: ${recoverData.user.email}`);
                            user = recoverData.user;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[Permissions API] Recovery logic failed:", e);
        }
    }

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const { isMasterAdmin } = await import('@/lib/security-admin');
    if (!isMasterAdmin({ 
        id: user.id, 
        email: user.email || null, 
        role: profile?.role 
    })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use Admin Client to bypass RLS
    const supabaseAdmin = getAdminClient();
    
    // 2. Fetch admin_permissions safely
    const { data: permissionsData, error: permError } = await supabaseAdmin
        .from('admin_permissions')
        .select('*');

    if (permError) {
        console.error("[Permissions API] Fetch Error:", permError);
        return NextResponse.json({ error: permError.message }, { status: 500 });
    }

    if (!permissionsData || permissionsData.length === 0) {
        return NextResponse.json([]);
    }

    // 3. Fetch related profiles for those admins
    const userIds = permissionsData.map(p => p.user_id).filter(Boolean);
    const { data: profilesData } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', userIds);

    const profileMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));

    // 4. Transform DB columns to FE permission array
    const transformedAdmins = permissionsData
        .map(entry => {
            const adminProfile = profileMap[entry.user_id];
            
            // MASTER는 이 목록에 표시될 필요가 없거나 수정 대상이 아님
            if (adminProfile?.role === 'MASTER') return null;

            const permissions: string[] = [];
            
            // DB columns match canonical names from migrations/middleware
            if (entry.can_manage_users) permissions.push('MANAGE_USERS');
            if (entry.can_manage_posts) permissions.push('MANAGE_POSTS');
            if (entry.can_view_audit_logs) permissions.push('VIEW_AUDIT_LOGS');
            if (entry.can_manage_admins || entry.can_manage_system) permissions.push('SYSTEM_SETTINGS');
            
            return {
                id: entry.user_id,
                full_name: adminProfile?.full_name || '관리자',
                email: adminProfile?.email || entry.user_id.substring(0, 8),
                permissions: Array.from(new Set(permissions))
            };
        })
        .filter(Boolean);

    return NextResponse.json(transformedAdmins);
}

export async function POST(req: NextRequest) {
    // 0. Manual Session Recovery
    const supabase = await createServerClient();
    let { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
            if (projectId) {
                const cookieName = `sb-${projectId}-auth-token`;
                const authCookie = req.cookies.get(cookieName);
                if (authCookie) {
                    let json;
                    try { json = JSON.parse(authCookie.value); }
                    catch { json = JSON.parse(decodeURIComponent(authCookie.value)); }
                    if (json?.access_token && json?.refresh_token) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: json.access_token,
                            refresh_token: json.refresh_token
                        });
                        if (recoverData.user) user = recoverData.user;
                    }
                }
            }
        } catch (e) { console.error("[Permissions POST API] Recovery failed:", e); }
    }

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single();

    // Support both role-based and explicit email-based MASTER check
    const isMaster = profile?.role === 'MASTER' || profile?.email === 'h2techjun@gmail.com' || user.email === 'h2techjun@gmail.com';
    
    if (!isMaster) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, permissions } = await req.json();

    if (!userId || !Array.isArray(permissions)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Map FE permissions array back to REAL DB columns
    const hasManageUsers = permissions.includes('MANAGE_USERS');
    const hasManagePosts = permissions.includes('MANAGE_POSTS');
    const hasViewAuditLogs = permissions.includes('VIEW_AUDIT_LOGS');
    const hasSystemSettings = permissions.includes('SYSTEM_SETTINGS');

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('admin_permissions')
        .upsert({
            user_id: userId,
            can_manage_users: hasManageUsers,
            can_manage_admins: hasManageUsers, // MANAGE_USERS 권한이 있으면 어드민 관리 접근도 허용 (어드민 페이지용)
            can_manage_posts: hasManagePosts,
            can_view_audit_logs: hasViewAuditLogs,
            can_manage_system: hasSystemSettings,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) {
        console.error("[Permissions POST API] Upsert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
