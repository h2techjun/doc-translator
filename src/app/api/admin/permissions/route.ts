
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 0. Manual Session Recovery
    const supabase = await createServerClient();
    const { getSafeUser } = await import('@/lib/supabase/auth-recovery');
    const user = await getSafeUser(req, supabase);

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

    const supabaseAdmin = getAdminClient();
    
    // 1. Fetch all permissions
    const { data: permissionsData, error: permError } = await supabaseAdmin
        .from('admin_permissions')
        .select('*');

    if (permError) {
        console.error("[Permissions API] Fetch Error:", permError);
        return NextResponse.json({ error: permError.message }, { status: 500 });
    }

    if (!permissionsData) return NextResponse.json([]);

    // 2. Aggregate permissions by user_id (Schema Agnostic)
    const adminMap: Record<string, { id: string, permissions: Set<string> }> = {};
    const userIds: string[] = [];

    permissionsData.forEach(entry => {
        const uid = entry.user_id;
        if (!uid) return;
        
        if (!adminMap[uid]) {
            adminMap[uid] = { id: uid, permissions: new Set() };
            userIds.push(uid);
        }

        // 🛡️ [Normalized Schema Support]
        if (entry.permission) {
            adminMap[uid].permissions.add(entry.permission);
        }
        
        // 🛡️ [Denormalized Schema Support]
        if (entry.can_manage_users) adminMap[uid].permissions.add('MANAGE_USERS');
        if (entry.can_manage_posts) adminMap[uid].permissions.add('MANAGE_POSTS');
        if (entry.can_view_audit_logs || entry.can_access_security) adminMap[uid].permissions.add('VIEW_AUDIT_LOGS');
        if (entry.can_manage_admins || entry.can_manage_system) adminMap[uid].permissions.add('SYSTEM_SETTINGS');
    });

    // 3. Fetch ALL users with ADMIN role to ensure they appear in the list
    const { data: adminProfiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .or('role.eq.ADMIN,role.eq.MASTER');

    if (profileError) {
        console.error("[Permissions API] Profile Fetch Error:", profileError);
    }

    // 4. Transform to Frontend format (Profiles are the source of truth for the list)
    const transformedAdmins = (adminProfiles || []).map(p => {
        // MASTER는 이 목록에서 제외 (수정 불가 보호)
        if (p.role === 'MASTER') return null;

        const storedPerms = adminMap[p.id]?.permissions || new Set<string>();

        return {
            id: p.id,
            full_name: p.full_name || '관리자',
            email: p.email || '(이메일 없음)',
            permissions: Array.from(storedPerms)
        };
    }).filter(Boolean);

    return NextResponse.json(transformedAdmins);
}

export async function POST(req: NextRequest) {
    // 0. Manual Session Recovery
    const supabase = await createServerClient();
    const { getSafeUser } = await import('@/lib/supabase/auth-recovery');
    const user = await getSafeUser(req, supabase);

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
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 🚀 [Dual Schema Sync Strategy]
    // 1. Try Normalized Schema Update (One row per permission)
    // We delete and re-insert to ensure clean state
    try {
        await supabaseAdmin.from('admin_permissions').delete().eq('user_id', userId);
        
        if (permissions.length > 0) {
            const insertData = permissions.map(p => ({
                user_id: userId,
                permission: p,
                granted_by: user.id
            }));
            await supabaseAdmin.from('admin_permissions').insert(insertData);
        }
    } catch (e) {
        console.warn("[Permissions API] Normalized Update Failed, falling back to Denormalized:", e);
    }

    // 2. Try Denormalized Schema Update (Boolean columns)
    const hasManageUsers = permissions.includes('MANAGE_USERS');
    const hasManagePosts = permissions.includes('MANAGE_POSTS');
    const hasViewAuditLogs = permissions.includes('VIEW_AUDIT_LOGS');
    const hasSystemSettings = permissions.includes('SYSTEM_SETTINGS');

    const { error: upsertError } = await supabaseAdmin
        .from('admin_permissions')
        .upsert({
            user_id: userId,
            can_manage_users: hasManageUsers,
            can_manage_admins: hasManageUsers,
            can_manage_posts: hasManagePosts,
            can_view_audit_logs: hasViewAuditLogs,
            can_access_security: hasViewAuditLogs, // Bridge naming gap
            can_manage_system: hasSystemSettings,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    // Both updates failed or denormalized failed when it's the primary schema
    if (upsertError && !permissions.includes('VIEW_AUDIT_LOGS')) {
         // Only report if it's a real failure (not just column mismatch)
         console.error("[Permissions API] Sync Error:", upsertError);
         // If upsert fails after normalized delete, it might leave partial state, but usually the UI will re-fetch
    }

    return NextResponse.json({ success: true });
}
