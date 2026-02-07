import { NextRequest } from 'next/server';
import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * The Hammer Fix 🔨: Manual Session Recovery
 * 
 * 쿠키에서 Supabase 인증 토큰을 수동으로 추출하여 세션을 강제로 복구합니다.
 * Next.js 서버 컴포넌트나 API 라우터에서 getUser()가 간헐적으로 사용자를 찾지 못하는 문제를 해결합니다.
 */
export async function recoverSession(req: NextRequest, supabase: SupabaseClient): Promise<User | null> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];

    if (!projectId) {
        console.warn("[Auth Recovery] Failed to extract projectId from NEXT_PUBLIC_SUPABASE_URL");
        return null;
    }

    const cookieName = `sb-${projectId}-auth-token`;
    const authCookie = req.cookies.get(cookieName);

    if (!authCookie) {
        return null;
    }

    let tokenValue: string | undefined;
    let refreshToken: string | undefined;

    try {
        // 1. Try parsing plain JSON
        const json = JSON.parse(authCookie.value);
        tokenValue = json.access_token;
        refreshToken = json.refresh_token;
    } catch {
        try {
            // 2. Try parsing decoded JSON
            const json = JSON.parse(decodeURIComponent(authCookie.value));
            tokenValue = json.access_token;
            refreshToken = json.refresh_token;
        } catch (e) {
            console.error("[Auth Recovery] Manual Cookie Parse Failed:", e);
            return null;
        }
    }

    if (tokenValue && refreshToken) {
        const { data: recoverData, error } = await supabase.auth.setSession({
            access_token: tokenValue,
            refresh_token: refreshToken
        });

        if (error) {
            console.error("[Auth Recovery] setSession failed:", error.message);
            return null;
        }

        if (recoverData.user) {
            console.log(`[Auth Recovery] Manual Recovery Success for: ${recoverData.user.email}`);
            return recoverData.user;
        }
    }

    return null;
}

/**
 * 헬퍼 함수: 표준 getUser()를 먼저 시도하고, 실패 시 recoverSession()을 실행합니다.
 */
export async function getSafeUser(req: NextRequest, supabase: SupabaseClient): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) return user;
    
    // Fallback to manual recovery
    return recoverSession(req, supabase);
}
