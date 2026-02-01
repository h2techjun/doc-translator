'use client';

import React from 'react';
import Link from 'next/link';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { ReportModal } from '@/components/common/ReportModal';

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
    view_count: number;
    category: string;
    users?: {
        full_name: string | null;
        email: string | null;
    } | null;
}

interface CommunityClientProps {
    posts: Post[] | null;
    tab: string;
}

export const CommunityClient = ({ posts, tab }: CommunityClientProps) => {
    const { t } = useGeoSmart();

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t.community.title}</h1>
                <Link href="/community/write" className="bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition">
                    {t.community.write}
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <Link href="/community?tab=free" className={`pb-2 px-1 ${tab === 'free' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    {t.community.tabs.free}
                </Link>
                <Link href="/community?tab=inquiry" className={`pb-2 px-1 ${tab === 'inquiry' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    {t.community.tabs.inquiry}
                </Link>
                <Link href="/community?tab=notice" className={`pb-2 px-1 ${tab === 'notice' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}>
                    {t.community.tabs.notice}
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {/* 📌 Pinned System Notice */}
                {tab === 'notice' && (
                    <div className="block p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                            {t.community.noticeFixed}
                        </div>
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                                {t.pricingPage.policy.title}
                            </h2>
                            <span className="text-xs text-gray-400">System • {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 space-y-4 mt-4">
                            <p>{t.pricingPage.hero.subtitle}</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">💰 {t.pricingPage.policy.pointTitle}</h4>
                                    <ul className="text-xs space-y-1">
                                        {t.pricingPage.policy.pointItems.map((item, i) => (
                                            <li key={i}>• {item.replace('{base}', '5').replace('{basePages}', '2').replace('{nextPage}', '3').replace('{extra}', '2')}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">📺 {t.pricingPage.policy.adTitle}</h4>
                                    <ul className="text-xs space-y-1">
                                        {t.pricingPage.policy.adItems.map((item, i) => (
                                            <li key={i}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {posts?.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        {t.community.noPosts}
                    </div>
                ) : (
                    posts?.map((post) => (
                        <Link href={`/community/${post.id}`} key={post.id} className="block p-6 bg-white dark:bg-zinc-900 border rounded-lg hover:shadow-md transition cursor-pointer">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>
                            <div className="mt-4 flex items-center text-sm text-gray-400">
                                <span>{t.community.postedBy} {post.users?.full_name || 'Anonymous'}</span>
                                <span className="mx-2">•</span>
                                <span>{t.community.views} {post.view_count}</span>
                                <div className="ml-auto" onClick={(e) => e.preventDefault()}>
                                    <ReportModal targetType="POST" targetId={post.id} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};
