
'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Trash2, EyeOff, Eye, AlertCircle, Megaphone, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

type Post = {
    id: string;
    title: string;
    category: 'free' | 'inquiry' | 'notice';
    created_at: string;
    is_hidden: boolean;
    view_count: number;
    author: { email: string } | null;
};

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            toast.error('게시글을 불러오지 못했습니다');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const toggleHidePost = async (id: string, currentHidden: boolean) => {
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: !currentHidden }),
            });
            if (res.ok) {
                toast.success(currentHidden ? '게시글이 공개되었습니다' : '게시글이 숨김 처리되었습니다');
                fetchPosts();
            }
        } catch (error) {
            toast.error('작업 실패');
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm('정말 이 게시글을 영구적으로 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('게시글이 삭제되었습니다');
                fetchPosts();
            }
        } catch (error) {
            toast.error('삭제 실패');
        }
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'notice': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Megaphone className="w-3 h-3" /> 공지사항</Badge>;
            case 'inquiry': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">문의</Badge>;
            default: return <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 text-[10px]">자유</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-3xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <MessageSquare className="w-8 h-8 text-indigo-500" />
                커뮤니티 관리 (Community)
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                사용자 게시글 모니터링 및 관리.
            </p>

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/10 bg-slate-50/30 dark:bg-slate-900/30">
                    <CardTitle className="text-lg font-black italic uppercase tracking-widest text-indigo-600">게시글 피드 (Post Feed)</CardTitle>
                    <CardDescription className="text-xs font-bold">커뮤니티 게시판의 가시성 및 내용을 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="border-b border-border/20">
                                <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">콘텐츠 정보</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">작성자</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">트래픽</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">작성일</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-6">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-48 text-center animate-pulse italic font-bold">스캔 중...</TableCell></TableRow>
                            ) : posts.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-48 text-center font-bold opacity-30 text-2xl italic">데이터 없음</TableCell></TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id} className={`group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-border/10 ${post.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryBadge(post.category)}
                                                    <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 italic tracking-tight">{post.title}</span>
                                                    {post.is_hidden && <Badge variant="destructive" className="h-4 px-1 text-[8px] font-black italic">숨김</Badge>}
                                                </div>
                                                <span className="text-[10px] font-mono text-muted-foreground opacity-50">{post.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-indigo-500">{post.author?.email || '알 수 없음'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-mono text-xs font-black">
                                                <Activity className="w-3 h-3 text-emerald-500" />
                                                {post.view_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold opacity-60">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    onClick={() => toggleHidePost(post.id, post.is_hidden)}
                                                >
                                                    {post.is_hidden ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => deletePost(post.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
