import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        let { data: { user } } = await supabase.auth.getUser();

        // 0. Manual Session Recovery (The Hammer Fix 🔨)
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
                            } catch (e) { console.error("Manual API Cookie Parse Failed:", e); }
                        }

                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) user = recoverData.user;
                        }
                    }
                }
            } catch (e) { console.error("Transaction API Recovery Error:", e); }
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('point_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ transactions: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
