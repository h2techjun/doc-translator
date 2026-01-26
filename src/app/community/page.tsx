import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function CommunityPage({ searchParams }: { searchParams: { tab?: string } }) {
    const supabase = await createClient();
    const tab = searchParams.tab || 'free'; // 'free' | 'inquiry' | 'notice'

    const { data: posts } = await supabase
        .from('posts')
        .select('*, users(full_name, email)') // Join author
        .eq('category', tab)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Community</h1>
                <Link href="/community/write" className="bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition">
                    글쓰기
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <Link href="/community?tab=free" className={`pb-2 px-1 ${tab === 'free' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    자유게시판
                </Link>
                <Link href="/community?tab=inquiry" className={`pb-2 px-1 ${tab === 'inquiry' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    문의게시판
                </Link>
                <Link href="/community?tab=notice" className={`pb-2 px-1 ${tab === 'notice' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    공지사항
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {posts?.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">작성된 글이 없습니다. 첫 글을 남겨보세요!</div>
                ) : (
                    posts?.map((post) => (
                        <div key={post.id} className="block p-6 bg-white dark:bg-zinc-900 border rounded-lg hover:shadow-md transition cursor-pointer">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>
                            <div className="mt-4 flex items-center text-sm text-gray-400">
                                <span>By {post.users?.full_name || 'Anonymous'}</span>
                                <span className="mx-2">•</span>
                                <span>Views {post.view_count}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
