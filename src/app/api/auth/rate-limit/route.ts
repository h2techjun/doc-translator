import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, type } = await request.json();
        console.log(`[API/RateLimit] Check request for: ${email} (${type})`);

        // 0. 클라이언트 IP 가져오기 (Proxy 등 고려)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = await createClient();

        // 1. 차단 여부 선제 확인 (Email or IP)
        const { data: banData, error: banError } = await supabase
            .from('banned_entities')
            .select('*')
            .or(`identifier.eq.${email},identifier.eq.${ip}`)
            .maybeSingle();

        if (banData) {
            return NextResponse.json({
                allowed: false,
                reason: 'BANNED',
                message: '반복적인 어뷰징 시도로 인해 차단된 사용자/IP입니다. 관리자에게 문의하십시오.'
            }, { status: 403 });
        }

        // 2. 최근 24시간 내 발송 횟수 체크 (Daily Limit: 5)
        const { count, error: countError } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (countError) throw countError;

        if (count && count >= 5) {
            // [ADVANCED] 마스터의 요청: 제한 초과 후에도 계속 시도하면 자동 차단
            // 최근 1시간 내에 실패 요청(로그 시도)이 3회 이상 더 발견되면 차단
            if (count >= 8) {
                await supabase.from('banned_entities').insert([
                    { identifier: email, reason: '24시간 내 5회 초과 후 반복 시도' },
                    { identifier: ip, reason: '보안 정책 위반 반복 (IP)' }
                ]);
                return NextResponse.json({
                    allowed: false,
                    reason: 'JUST_BANNED',
                    message: '보안 정책 위반 누적으로 귀하의 접근이 영구 차단되었습니다.'
                }, { status: 403 });
            }

            return NextResponse.json({
                allowed: false,
                reason: 'DAILY_LIMIT_EXCEEDED',
                message: '하루 발송 제한(5회)을 초과했습니다. 보안을 위해 하루가 지난 후에 다시 시도해 주세요.'
            }, { status: 429 });
        }

        // 3. 마지막 발송 시간 체크 (Interval Limit: 1 min)
        const { data: lastLog, error: lastError } = await supabase
            .from('email_logs')
            .select('created_at')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastError && lastLog) {
            const timeDiff = Date.now() - new Date(lastLog.created_at).getTime();
            if (timeDiff < 60 * 1000) {
                return NextResponse.json({
                    allowed: false,
                    reason: 'INTERVAL_TOO_SHORT',
                    message: `보안을 위해 잠시 기다려 주세요. (${Math.ceil((60 * 1000 - timeDiff) / 1000)}초 후 가능)`
                }, { status: 429 });
            }
        }

        // 4. 기록 추가 (로그 저장 - IP 포함)
        const { error: insertError } = await supabase
            .from('email_logs')
            .insert({ email, type, ip_address: ip });

        if (insertError) throw insertError;

        return NextResponse.json({ allowed: true });

    } catch (error: any) {
        console.error('Rate limit API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
