
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

    const { KNOWN_ADMIN_EMAILS } = await import('@/lib/security-admin');
    const supabaseAdmin = getAdminClient();

    // 1. Fetch all existing permission records
    const { data: permissionsData, error: permError } = await supabaseAdmin
        .from('admin_permissions')
        .select('*');

    if (permError) {
        console.error("[Permissions API] Fetch Error:", permError);
        return NextResponse.json({ error: permError.message }, { status: 500 });
    }

    // 2. Map permissions by user_id
    const adminMap: Record<string, { id: string, permissions: Set<string> }> = {};
    const userIdsFromPerms: string[] = [];

    (permissionsData || []).forEach((entry: any) => {
        const uid = entry.user_id;
        if (!uid) return;
        
        if (!adminMap[uid]) {
            adminMap[uid] = { id: uid, permissions: new Set() };
            userIdsFromPerms.push(uid);
        }

        if (entry.permission) adminMap[uid].permissions.add(entry.permission);
        if (entry.can_manage_users) adminMap[uid].permissions.add('MANAGE_USERS');
        if (entry.can_manage_posts) adminMap[uid].permissions.add('MANAGE_POSTS');
        if (entry.can_view_audit_logs || entry.can_access_security) adminMap[uid].permissions.add('VIEW_AUDIT_LOGS');
        if (entry.can_manage_admins || entry.can_manage_system) adminMap[uid].permissions.add('SYSTEM_SETTINGS');
    });

    // 3. 🔍 Discovery: Combine all possible Admin sources (Robust Strategy)
    const allAdminIds = new Set<string>(userIdsFromPerms);
    allAdminIds.add(user.id); // Always include self

    try {
        // Source A: Users with explicit ADMIN/MASTER roles
        const { data: roleProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .in('role', ['ADMIN', 'MASTER']);
        
        roleProfiles?.forEach(p => allAdminIds.add(p.id));

        // Source B: Users in the KNOWN_ADMIN_EMAILS whitelist
        if (KNOWN_ADMIN_EMAILS.length > 0) {
            const { data: whiteProfiles } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .in('email', KNOWN_ADMIN_EMAILS);
            
            whiteProfiles?.forEach(p => allAdminIds.add(p.id));
        }
    } catch (e) {
        console.error("[Permissions API] ID Collection Error:", e);
    }

    // 4. Final Fetch: Get full profile info for the complete set
    const { data: finalProfiles, error: finalError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', Array.from(allAdminIds));

    if (finalError) {
        console.error("[Permissions API] Final Profile Fetch Error:", finalError);
    }

    const profileMap = Object.fromEntries((finalProfiles || []).map((p: any) => [p.id, p]));

    // 5. Transform to Frontend format (Async Recovery)
    const transformedAdmins = await Promise.all(Array.from(allAdminIds).map(async (uid) => {
        const p = profileMap[uid];
        
        // 데이터 정합성 보장: 프로필이 없으면 최소한의 정보로라도 표시 (투명성)
        const effectiveEmail = p?.email || (uid === user.id ? user.email : null);
        const isMaster = p?.role === 'MASTER' || (effectiveEmail && effectiveEmail === KNOWN_ADMIN_EMAILS[0]);
        
        let finalFullName = p?.full_name || (uid === user.id ? '나 (MASTER)' : '관리자');
        let finalEmail = effectiveEmail;
        let finalRole = p?.role || (isMaster ? 'MASTER' : 'USER'); // Default fallback

        // [Recovery] 프로필이 없고 화이트리스트도 아니면 Auth API 직접 조회
        if (!p && uid !== user.id && !KNOWN_ADMIN_EMAILS.includes(effectiveEmail || '')) {
             try {
                const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(uid);
                
                if (authUser) {
                    finalEmail = authUser.email || 'No Email';
                    finalFullName = authUser.user_metadata?.full_name || 'Auth User';
                    finalRole = authUser.user_metadata?.role || 'USER'; // Metadata role fallback
                    // Auth 유저가 확인되면 'Unknown'이 아님
                } else {
                    // 진짜 없는 유저 (삭제됨)
                    finalFullName = 'Unknown User (삭제됨)';
                    finalEmail = 'user_not_found';
                }
             } catch (e) {
                 console.warn(`[Permissions API] Auth Recovery Failed for ${uid}:`, e);
                 finalFullName = 'Unknown User (Error)';
                 finalEmail = 'error';
             }
        }

        const storedPerms = adminMap[uid]?.permissions || new Set<string>();

        return {
            id: uid,
            full_name: finalFullName,
            email: finalEmail || uid.substring(0, 8),
            role: finalRole,
            is_master: isMaster,
            permissions: isMaster ? PERMISSION_TYPES.map(t => t.id) : Array.from(storedPerms)
        };
    }));

    console.log(`[Permissions API] Returning ${transformedAdmins.length} admins.`);

    // Sorting: MASTER first, then by name
    transformedAdmins.sort((a: any, b: any) => {
        if (a.is_master && !b.is_master) return -1;
        if (!a.is_master && b.is_master) return 1;
        return (a.full_name || '').localeCompare(b.full_name || '');
    });

    return NextResponse.json(transformedAdmins);
}

const PERMISSION_TYPES = [
    { id: 'MANAGE_USERS', label: '사용자 관리' },
    { id: 'MANAGE_POSTS', label: '게시물 관리' },
    { id: 'VIEW_AUDIT_LOGS', label: '감사 로그 조회' },
    { id: 'SYSTEM_SETTINGS', label: '시스템 설정' },
];

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
