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
                {/* 📌 Pinned System Notice */}
                {tab === 'notice' && (
                    <div className="block p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                            Fixed Notice
                        </div>
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                                [필독] 서비스 운영 정책 안내 (포인트/광고/충전)
                            </h2>
                            <span className="text-xs text-gray-400">System • {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-4 mt-4">
                            <p>DocTranslation의 지속 가능한 서비스를 위한 포인트 및 광고 정책을 안내해 드립니다.</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">💰 포인트(Point)</h4>
                                    <ul className="text-xs space-y-1">
                                        <li>• 가입 시 10P 즉시 지급</li>
                                        <li>• 번역 1회(2p이내) 5P 소모</li>
                                        <li>• 3p부터 페이지당 2P 추가</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">📺 광고(Ads)</h4>
                                    <ul className="text-xs space-y-1">
                                        <li>• 포인트 부족 시 광고 시청 가능</li>
                                        <li>• 시청 후 리워드 버튼 클릭 시 5P</li>
                                        <li>• 베타 기간 무제한 충전 지원</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {posts?.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        {tab === 'notice' ? '상단의 고정 공지사항을 확인해 주세요.' : '작성된 글이 없습니다. 첫 글을 남겨보세요!'}
                    </div>
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
