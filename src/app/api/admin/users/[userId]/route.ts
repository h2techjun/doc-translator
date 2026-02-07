
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Service Role Client for Admin Operations
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const id = params.userId;
        const body = await req.json();
        const { points, tier, role } = body;

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
                                console.error("[Update User API] Manual Cookie Parse Failed:", e);
                            }
                        }
                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) {
                                console.log(`[Update User API] Manual Recovery Success: ${recoverData.user.email}`);
                                user = recoverData.user;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("[Update User API] Recovery logic failed:", e);
            }
        }

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { isAuthorizedAdmin } = await import('@/lib/security-admin');
        if (!isAuthorizedAdmin({ 
            id: user.id, 
            email: user.email || null, 
            role: profile?.role 
        })) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Target Profile to Check Hierarchy
        const supabaseAdmin = getAdminClient();
        const { data: targetProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', id)
            .single();

        const { isMasterAdmin } = await import('@/lib/security-admin');
        const isRequesterMaster = isMasterAdmin({ id: user.id, email: user.email || null, role: profile?.role });

        // MASTER가 아닌 ADMIN이 다른 ADMIN이나 MASTER를 수정하려 할 때 차단
        if (!isRequesterMaster && (targetProfile?.role === 'ADMIN' || targetProfile?.role === 'MASTER')) {
            return NextResponse.json({ error: '관리자 또는 마스터 정보는 마스터만 수정할 수 있습니다.' }, { status: 403 });
        }

        // 3. Update User Profile
        const updateData: any = {};

        if (points !== undefined) updateData.points = points;
        if (tier !== undefined) updateData.tier = tier;
        if (role !== undefined) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No data to update' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[Admin API] Update Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('[Admin API] Unexpected Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
