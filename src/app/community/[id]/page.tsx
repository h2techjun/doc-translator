import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function addComment(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const postId = formData.get('postId') as string;
    const content = formData.get('content') as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        content
    });

    revalidatePath(`/community/${postId}`);
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = await params

    // Fetch Post
    const { data: post } = await supabase
        .from('posts')
        .select('*, users(full_name)')
        .eq('id', id)
        .single();

    if (!post) return <div>Post not found</div>;

    // Fetch Comments
    const { data: comments } = await supabase
        .from('comments')
        .select('*, users(full_name)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="border-b pb-4 mb-6 dark:border-zinc-800">
                <span className="text-sm text-blue-500 font-bold uppercase">{post.category}</span>
                <h1 className="text-3xl font-bold mt-2">{post.title}</h1>
                <div className="text-gray-500 text-sm mt-2 flex justify-between">
                    <span>{post.users?.full_name}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-10 whitespace-pre-wrap">
                {post.content}
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg">
                <h3 className="font-bold mb-4">댓글 ({comments?.length || 0})</h3>

                <div className="space-y-4 mb-6">
                    {comments?.map((comment) => (
                        <div key={comment.id} className="border-b pb-2 dark:border-zinc-800 last:border-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm">{comment.users?.full_name}</span>
                                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                    ))}
                </div>

                <form action={addComment} className="flex gap-2">
                    <input type="hidden" name="postId" value={id} />
                    <input name="content" required className="flex-1 border rounded-md p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700" placeholder="댓글을 입력하세요..." />
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-zinc-800">등록</button>
                </form>
            </div>
        </div>
    );
}
