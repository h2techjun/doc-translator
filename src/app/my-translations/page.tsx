'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/config';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, AlertCircle, FileText, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

type Job = {
    id: string;
    created_at: string;
    original_filename: string;
    status: 'WAITING' | 'UPLOADING' | 'PROCESSING' | 'TRANSLATING' | 'COMPLETED' | 'FAILED';
    progress: number;
    translated_file_url: string | null;
    error_message: string | null;
    target_lang: string;
};

export default function MyTranslationsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const supabase = createClient();

    const fetchJobs = async (showLoading = true) => {
        if (showLoading) setIsRefreshing(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/signin';
            return;
        }

        const { data, error } = await supabase
            .from('translation_jobs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            toast.error('번역 기록을 불러오는데 실패했습니다.');
        } else {
            setJobs(data as Job[]);
        }

        setIsLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Polling logic: If any job is in active state, poll every 5 seconds
    useEffect(() => {
        const hasActiveJobs = jobs.some(job =>
            ['WAITING', 'UPLOADING', 'PROCESSING', 'TRANSLATING'].includes(job.status)
        );

        if (hasActiveJobs) {
            const interval = setInterval(() => fetchJobs(false), 5000);
            return () => clearInterval(interval);
        }
    }, [jobs]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">완료</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">실패</Badge>;
            case 'TRANSLATING':
                return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 animate-pulse">번역 중</Badge>;
            case 'PROCESSING':
                return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20 animate-pulse">처리 중</Badge>;
            case 'UPLOADING':
                return <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20 animate-pulse">업로드 중</Badge>;
            default:
                return <Badge variant="secondary" className="bg-slate-500/10 text-slate-600">대기중</Badge>;
        }
    };

    const handleDownload = async (id: string, url: string, filename: string) => {
        const loadingToast = toast.loading('다운로드 준비 중...');
        try {
            // 1. Get signed URL if it's a relative path
            let finalUrl = url;
            if (!url.startsWith('http') && !url.includes('drive.google.com')) {
                const res = await fetch(`/api/translation/${id}`);
                const data = await res.json();
                if (data.translatedFileUrl) {
                    finalUrl = data.translatedFileUrl;
                } else {
                    throw new Error('Url not available');
                }
            }

            // 2. Drive download logic
            if (finalUrl.includes('drive.google.com')) {
                window.open(finalUrl, '_blank');
                toast.dismiss(loadingToast);
                return;
            }

            // 3. Proxy download to bypass CORS and force filename
            const proxyUrl = `/api/download?url=${encodeURIComponent(finalUrl)}&filename=${encodeURIComponent(filename)}`;
            const link = document.createElement('a');
            link.href = proxyUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('다운로드를 시작합니다.', { id: loadingToast });
        } catch (e) {
            toast.error('다운로드 시작에 실패했습니다.', { id: loadingToast });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        내 번역 기록
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        최근 번역 요청한 파일들의 상태와 결과를 확인하세요.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchJobs()}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    새로고침
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        번역 파일 목록
                    </CardTitle>
                    <CardDescription>
                        번역 결과물은 보안을 위해 <strong>10일간 보관</strong>되며 이후 자동 파기됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <p>아직 번역 기록이 없습니다.</p>
                            <Button className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => window.location.href = '/'}>
                                새 번역 시작하기
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border border-border/50 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[40%]">파일명</TableHead>
                                        <TableHead>상태</TableHead>
                                        <TableHead>진행률</TableHead>
                                        <TableHead>요청일</TableHead>
                                        <TableHead className="text-right">작업</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobs.map((job) => (
                                        <TableRow key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                            {job.original_filename?.split('.').pop()?.toUpperCase() || 'FILE'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="truncate max-w-[200px] sm:max-w-[300px]" title={job.original_filename}>
                                                            {job.original_filename}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            To: {job.target_lang || 'EN'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(job.status)}
                                                {job.error_message && (
                                                    <div className="mt-1 text-[10px] text-red-500 max-w-[150px] truncate" title={job.error_message}>
                                                        {job.error_message}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${job.status === 'FAILED' ? 'bg-red-500' : 'bg-emerald-500'
                                                                }`}
                                                            style={{ width: `${job.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {job.progress}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ko })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const isExpired = (new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24) >= 10;

                                                    if (job.status === 'COMPLETED' && job.translated_file_url) {
                                                        if (isExpired) {
                                                            return (
                                                                <span className="text-xs text-muted-foreground font-medium flex items-center justify-end gap-1">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    만료됨
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                                onClick={() => handleDownload(job.id, job.translated_file_url!, `translated_${job.original_filename}`)}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                <span className="hidden sm:inline">다운로드</span>
                                                            </Button>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
