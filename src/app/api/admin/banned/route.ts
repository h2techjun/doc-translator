import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * 🛡️ 어드민 전용 차단 관리 API
 * GET: 차단 이력 조회
 * POST: 특정 식별자 차단 해제 (Delete)
 */
export async function GET() {
    try {
        const supabase = await createClient();
        // 0. Manual Session Recovery (The Hammer Fix 🔨)
        let { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
                if (projectId) {
                    const cookieName = `sb-${projectId}-auth-token`;
                    // @ts-ignore
                    const authCookie = (await import('next/headers')).cookies().get(cookieName);

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
                                console.error("[API] Manual Cookie Parse Failed:", e);
                            }
                        }

                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) {
                                user = recoverData.user;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("[API] Recovery Error:", e);
            }
        }

        if (!user) return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });

        // 어드민 권한 체크
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER') {
            return NextResponse.json({ error: '접근 권한이 없습니다 (관리자 이상의 권한 필요).' }, { status: 403 });
        }

        const { data: banned, error } = await supabase
            .from('banned_entities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(banned);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { action, identifier } = await request.json();
        const supabase = await createClient();
        // 0. Manual Session Recovery (The Hammer Fix 🔨)
        let { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
                if (projectId) {
                    const cookieName = `sb-${projectId}-auth-token`;
                    // @ts-ignore
                    const authCookie = (await import('next/headers')).cookies().get(cookieName);

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
                                console.error("[API] Manual Cookie Parse Failed:", e);
                            }
                        }

                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) {
                                user = recoverData.user;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("[API] Recovery Error:", e);
            }
        }

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'ADMIN' && profile?.role !== 'MASTER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === 'UNBAN') {
            const { error } = await supabase
                .from('banned_entities')
                .delete()
                .eq('identifier', identifier);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'BAN') {
            const { error } = await supabase
                .from('banned_entities')
                .insert({ identifier, reason: 'Manually blocked by Admin' });
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
