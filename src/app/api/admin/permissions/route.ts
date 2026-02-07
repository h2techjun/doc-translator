import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const supabase = await createServerClient();
    
    // 1. 세션 확인 (이미 미들웨어에서 통과됨)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. 관리자 권한 확인 (Master 여부)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { isMasterAdmin, KNOWN_ADMIN_EMAILS } = await import('@/lib/security-admin');
    
    if (!isMasterAdmin({ id: user.id, email: user.email || null, role: profile?.role })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();

    // ⚡ [SUPREME DISCOVERY] 모든 관리자를 찾는 가장 확실한 방법
    // 방법 1: profiles 테이블에서 role이 ADMIN 또는 MASTER인 사람 전원 조회
    const { data: adminProfiles, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .or(`role.ilike.ADMIN,role.ilike.MASTER,email.in.(${KNOWN_ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`);

    if (pError) console.error("[Permissions API] Profile Error:", pError);

    // 방법 2: admin_permissions 테이블에 등록된 사람 전원 조회
    const { data: permRecords } = await supabaseAdmin.from('admin_permissions').select('user_id, permission');

    // ID 합치기
    const allAdminIds = new Set<string>();
    (adminProfiles || []).forEach(p => allAdminIds.add(p.id));
    (permRecords || []).forEach(r => allAdminIds.add(r.user_id));
    allAdminIds.add(user.id); // 나 자신 포함

    // 전체 프로필 재조회 (누락 방지)
    const { data: finalProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', Array.from(allAdminIds));

    const profileMap = Object.fromEntries((finalProfiles || []).map((p: any) => [p.id, p]));
    
    // 권한 맵 구성
    const adminPermsMap: Record<string, string[]> = {};
    (permRecords || []).forEach(r => {
        if (!adminPermsMap[r.user_id]) adminPermsMap[r.user_id] = [];
        if (r.permission) adminPermsMap[r.user_id].push(r.permission);
    });

    const PERMISSION_TYPES = ['MANAGE_USERS', 'MANAGE_POSTS', 'VIEW_AUDIT_LOGS', 'SYSTEM_SETTINGS'];

    // 데이터 변환
    const result = Array.from(allAdminIds).map(uid => {
        const p = profileMap[uid];
        const email = p?.email || (uid === user.id ? user.email : 'Unknown');
        const isMaster = p?.role === 'MASTER' || email === KNOWN_ADMIN_EMAILS[0];
        
        // 프로필이 없는 유저는 제외 (단, 나 자신이나 화이트리스트는 살림)
        if (!p && uid !== user.id && !KNOWN_ADMIN_EMAILS.includes(email || '')) return null;

        return {
            id: uid,
            full_name: p?.full_name || (uid === user.id ? '나 (MASTER)' : '관리자'),
            email: email,
            role: p?.role || (isMaster ? 'MASTER' : 'ADMIN'),
            is_master: isMaster,
            permissions: isMaster ? PERMISSION_TYPES : (adminPermsMap[uid] || [])
        };
    }).filter(Boolean);

    // 정렬: MASTER 먼저, 그 다음 이름순
    result.sort((a: any, b: any) => {
        if (a.is_master && !b.is_master) return -1;
        if (!a.is_master && b.is_master) return 1;
        return (a.full_name || '').localeCompare(b.full_name || '');
    });

    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, permissions } = await req.json();
    const supabaseAdmin = getAdminClient();

    // 기존 권한 삭제 후 재삽입
    await supabaseAdmin.from('admin_permissions').delete().eq('user_id', userId);
    
    if (permissions && permissions.length > 0) {
        const inserts = permissions.map((p: string) => ({
            user_id: userId,
            permission: p,
            granted_by: user.id
        }));
        await supabaseAdmin.from('admin_permissions').insert(inserts);
    }

    return NextResponse.json({ success: true });
}
