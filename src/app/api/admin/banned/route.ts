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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 어드민 권한 체크
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'ADMIN') {
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
