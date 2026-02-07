import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const supabase = await createServerClient();
    
    // 1. 유저 인증
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. 관리자 권한 확인 (Master 혹은 Admin)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { isMasterAdmin, KNOWN_ADMIN_EMAILS } = await import('@/lib/security-admin');
    
    if (!isMasterAdmin({ id: user.id, email: user.email || null, role: profile?.role })) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();

    // 💡 [PRECISION AUDIT] 모든 관리자 후보군 전수 조사
    // 1. profiles 테이블에서 role이 ADMIN 또는 MASTER인 사람 (대소문자 무관)
    // 2. KNOWN_ADMIN_EMAILS 화이트리스트 이메일을 가진 사람
    const { data: adminProfiles, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .or(`role.ilike.ADMIN,role.ilike.MASTER,email.in.(${KNOWN_ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`);

    if (pError) console.error("[Permissions API] Profile Audit Error:", pError);

    // 3. 기존에 저장된 권한 레코드 조회
    const { data: permRecords } = await supabaseAdmin.from('admin_permissions').select('user_id, permission');

    // 모든 관리자 ID 합치기
    const allAdminIds = new Set<string>();
    (adminProfiles || []).forEach(p => allAdminIds.add(p.id));
    (permRecords || []).forEach(r => allAdminIds.add(r.user_id));
    allAdminIds.add(user.id);

    // 프로필 정보 맵 구성
    const profileMap = Object.fromEntries((adminProfiles || []).map((p: any) => [p.id, p]));
    // 내가 발견되지 않았다면 현재 세션 정보로 보강
    if (!profileMap[user.id]) {
        profileMap[user.id] = { id: user.id, full_name: '나 (MASTER)', email: user.email, role: profile?.role || 'MASTER' };
    }

    // 권한 맵 구성
    const adminPermsMap: Record<string, string[]> = {};
    (permRecords || []).forEach(r => {
        if (!adminPermsMap[r.user_id]) adminPermsMap[r.user_id] = [];
        if (r.permission) adminPermsMap[r.user_id].push(r.permission);
    });

    const PERMISSION_TYPES = ['MANAGE_USERS', 'MANAGE_POSTS', 'VIEW_AUDIT_LOGS', 'SYSTEM_SETTINGS'];

    // 최종 데이터 변환
    const result = Array.from(allAdminIds).map(uid => {
        const p = profileMap[uid];
        if (!p) return null; // 프로필이 전수 조사에서 안 나왔다면 제외

        const email = p.email || '';
        const isMaster = p.role === 'MASTER' || email === KNOWN_ADMIN_EMAILS[0];

        return {
            id: uid,
            full_name: p.full_name || '관리자',
            email: email,
            role: p.role || (isMaster ? 'MASTER' : 'ADMIN'),
            is_master: isMaster,
            permissions: isMaster ? PERMISSION_TYPES : (adminPermsMap[uid] || [])
        };
    }).filter(Boolean);

    // 정렬 (MASTER 우선 -> 이름순)
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

    // 트랜잭션 대신 순차 처리 (기존 권한 삭제 후 선별적 재삽입)
    await supabaseAdmin.from('admin_permissions').delete().eq('user_id', userId);
    
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const inserts = permissions.map((p: string) => ({
            user_id: userId,
            permission: p,
            granted_by: user.id
        }));
        await supabaseAdmin.from('admin_permissions').insert(inserts);
    }

    return NextResponse.json({ success: true });
}
