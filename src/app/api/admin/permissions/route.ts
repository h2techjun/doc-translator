
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
        .select('id, full_name, email')
        .in('id', userIds);

    const profileMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));

    // 4. Transform DB columns to FE permission array
    const transformedAdmins = permissionsData.map(entry => {
        const profile = profileMap[entry.user_id];
        const permissions: string[] = [];
        
        // Use real DB column names found via SQL check
        if (entry.can_manage_users) permissions.push('MANAGE_USERS');
        if (entry.can_manage_admins) permissions.push('MANAGE_USERS');
        if (entry.can_access_security) permissions.push('MANAGE_USERS');
        if (entry.can_view_stats) permissions.push('MANAGE_USERS');
        
        return {
            id: entry.user_id, // FE expects 'id'
            full_name: profile?.full_name || '관리자',
            email: profile?.email || 'Unknown',
            permissions: Array.from(new Set(permissions))
        };
    });

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

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('admin_permissions')
        .upsert({
            user_id: userId,
            permission: hasManageUsers ? 'all' : 'none',
            can_manage_users: hasManageUsers,
            can_manage_admins: hasManageUsers,
            can_access_security: hasManageUsers,
            can_view_stats: hasManageUsers,
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) {
        console.error("[Permissions POST API] Upsert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
