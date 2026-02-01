import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { post_id, content } = body;

    if (!post_id || !content) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id,
            user_id: user.id,
            content
        })
        .select(`
            *,
            users (
                id,
                full_name,
                email
            )
        `)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// 댓글 삭제 (본인만 가능)
export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
