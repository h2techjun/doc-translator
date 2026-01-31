
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: 대화 목록 또는 특정 유저와의 메시지 내역 조회
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partner_id');

    if (partnerId) {
        // 1. 특정 유저와의 메시지 내역 조회 (Chat History)
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(full_name, email),
                receiver:receiver_id(full_name, email)
            `)
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);

    } else {
        // 2. 대화방 목록 조회 (Conversations List)
        // Note: This is complex in pure Supabase API without grouping.
        // We will fetch all messages involved with user, then process in memory for MVP.
        // For production, use a Database Function `get_conversations`.

        // Fetch recent 50 messages involved with me
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(full_name, email),
                receiver:receiver_id(full_name, email)
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Process unique partners
        const partnersMap = new Map();
        data?.forEach(msg => {
            const isMeSender = msg.sender_id === user.id;
            const partnerId = isMeSender ? msg.receiver_id : msg.sender_id;
            const partnerInfo = isMeSender ? msg.receiver : msg.sender;

            if (!partnersMap.has(partnerId)) {
                partnersMap.set(partnerId, {
                    partnerId,
                    partnerName: partnerInfo?.full_name || partnerInfo?.email || 'Unknown',
                    lastMessage: msg.content,
                    lastDate: msg.created_at,
                    isRead: isMeSender ? true : !!msg.read_at
                });
            }
        });

        return NextResponse.json(Array.from(partnersMap.values()));
    }
}

// POST: 메시지 전송
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: user.id,
            receiver_id,
            content
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
