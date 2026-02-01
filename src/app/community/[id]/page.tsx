import { createClient } from '@/lib/supabase/server';
import { PostDetailClient } from '@/components/community/PostDetailClient';
import { notFound } from 'next/navigation';

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // 조회수 증가 로직은 추후 구현 (RPC 필요)

    const { data: post } = await supabase
        .from('posts')
        .select(`
            *,
            users (
                id,
                full_name,
                email
            )
        `)
        .eq('id', params.id)
        .single();

    if (!post) return notFound();

    // Fetch comments
    const { data: comments } = await supabase
        .from('comments')
        .select(`
            *,
            users (
                id,
                full_name,
                email
            )
        `)
        .eq('post_id', params.id)
        .order('created_at', { ascending: true });

    return <PostDetailClient post={post} initialComments={comments || []} />;
}
