
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

    // Use Admin Client to bypass RLS and fetch all permission data
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from('admin_permissions')
        .select(`
            *,
            profiles:admin_id(full_name, email)
        `);

    if (error) {
        console.error("[Permissions API] Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform DB booleans to FE permission array to prevent crashing
    const transformedAdmins = (data || []).map(entry => {
        // Safe access to profiles mapping (it might be an array or object in PostgREST)
        const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
        
        const permissions: string[] = [];
        // Map DB booleans to FE permission string keys
        if (entry.can_adjust_points) permissions.push('MANAGE_USERS');
        if (entry.can_block_users) permissions.push('MANAGE_USERS');
        if (entry.can_kick_users) permissions.push('MANAGE_USERS');
        
        // Remove duplicates if any
        const uniquePermissions = Array.from(new Set(permissions));

        return {
            id: entry.admin_id, // Important: FE expects 'id'
            full_name: profile?.full_name || '관리자',
            email: profile?.email || 'Unknown',
            permissions: uniquePermissions // Always an array
        };
    });

    return NextResponse.json(transformedAdmins);
}

export async function POST(req: NextRequest) {
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
                            console.error("[Permissions POST API] Manual Cookie Parse Failed:", e);
                        }
                    }
                    if (tokenValue && refreshToken) {
                        const { data: recoverData } = await supabase.auth.setSession({
                            access_token: tokenValue,
                            refresh_token: refreshToken
                        });
                        if (recoverData.user) {
                            console.log(`[Permissions POST API] Manual Recovery Success: ${recoverData.user.email}`);
                            user = recoverData.user;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[Permissions POST API] Recovery logic failed:", e);
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

    const { userId, permissions } = await req.json();

    if (!userId || !Array.isArray(permissions)) {
        return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
    }

    // Map FE permissions array back to DB boolean columns
    const canAdjustPoints = permissions.includes('MANAGE_USERS');
    const canBlockUsers = permissions.includes('MANAGE_USERS');
    const canKickUsers = permissions.includes('MANAGE_USERS');

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('admin_permissions')
        .upsert({
            admin_id: userId,
            can_adjust_points: canAdjustPoints,
            can_block_users: canBlockUsers,
            can_kick_users: canKickUsers,
            updated_at: new Date().toISOString()
        }, { onConflict: 'admin_id' });

    if (error) {
        console.error("[Permissions POST API] Upsert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
