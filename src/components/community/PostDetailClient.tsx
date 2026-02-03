'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowLeft, MoreHorizontal, User, Send, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportModal } from '@/components/common/ReportModal';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    users: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
}

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
    view_count: number;
    category: string;
    users: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
}

interface PostDetailClientProps {
    post: Post;
    initialComments: Comment[];
}

export const PostDetailClient = ({ post, initialComments }: PostDetailClientProps) => {
    const { user, t } = useGeoSmart();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAddComment = async () => {
        if (!user) {
            toast.error(t.auth.signinDesc);
            router.push('/signin');
            return;
        }
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: post.id, content: newComment })
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([...comments, comment]);
                setNewComment('');
                toast.success('댓글이 등록되었습니다.');
            } else {
                toast.error('댓글 등록 실패');
            }
        } catch (e) {
            toast.error('시스템 오류');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setComments(comments.filter(c => c.id !== id));
                toast.success('삭제되었습니다.');
            }
        } catch (e) {
            toast.error('삭제 실패');
        }
    };



    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Link href="/community" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로 돌아가기
            </Link>

            {/* Post Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold break-words">{post.title}</h1>
                    {user?.id === post.users?.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-500">삭제하기</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center text-sm text-gray-500 gap-4 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{post.users?.full_name || '익명'}</span>
                    </div>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>조회 {post.view_count}</span>
                    <div className="ml-auto flex gap-2">

                        <ReportModal targetType="POST" targetId={post.id} />
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="min-h-[200px] mb-12 whitespace-pre-wrap text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                {post.content}
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> 댓글 {comments.length}
                </h3>

                {/* Comment Input */}
                <div className="mb-8 flex gap-3">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "댓글을 남겨보세요..." : "로그인이 필요합니다."}
                        className="bg-white dark:bg-black min-h-[80px]"
                        disabled={!user || submitting}
                    />
                    <Button
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim() || submitting}
                        className="h-auto"
                    >
                        등록
                    </Button>
                </div>

                {/* Comment List */}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="w-8 h-8 mt-1">
                                <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">{comment.users?.full_name || '익명'}</span>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                                    </span>
                                    {user?.id === comment.users?.id && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
