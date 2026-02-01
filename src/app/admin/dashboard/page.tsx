'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Activity, DollarSign, AlertTriangle, MessageSquare, Settings } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';

type AdminStats = {
    totalUsers: number;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    estimatedRevenue: number;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (!res.ok) {
                    if (res.status === 403) throw new Error('관리자 권한이 없습니다.');
                    throw new Error('데이터를 불러오는데 실패했습니다.');
                }
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-10 flex justify-center italic text-muted-foreground animate-pulse">마스터 대시보드 로딩 중...</div>;
    if (error) return (
        <div className="p-10 flex flex-col items-center gap-4 text-red-500 bg-red-50/10 rounded-2xl border border-red-500/20 max-w-md mx-auto my-10">
            <AlertTriangle className="w-10 h-10" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">접근 거부됨 (Access Refused)</h1>
            <p className="text-sm font-bold opacity-80">{error}</p>
            <Link href="/">
                <Button variant="outline" size="sm" className="mt-2 border-red-500/50 text-red-500 hover:bg-red-500/10">홈으로 돌아가기</Button>
            </Link>
        </div>
    );

    const chartData = stats ? [
        { name: '완료됨', value: stats.completedJobs, fill: '#10b981' },
        { name: '실패', value: stats.failedJobs, fill: '#ef4444' },
        { name: '처리 중', value: stats.totalJobs - (stats.completedJobs + stats.failedJobs), fill: '#3b82f6' },
    ] : [];

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-8 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <Activity className="w-10 h-10 text-indigo-500" />
                마스터 대시보드
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Link href="/admin/users">
                    <Card className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers}명</div>
                            <p className="text-xs text-muted-foreground">지난달 대비 +20.1%</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/jobs">
                    <Card className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 작업 수</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalJobs}건</div>
                            <p className="text-xs text-muted-foreground">처리된 파일 수</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">성공률</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats?.successRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">글로벌 번역 신뢰도</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">예상 수익</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            ${stats?.estimatedRevenue?.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">사용량 기반 추정치</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Link href="/admin/posts">
                    <Card className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-black italic tracking-tighter uppercase text-indigo-600">커뮤니티 관리</CardTitle>
                            <MessageSquare className="h-5 w-5 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">게시판 및 공지</div>
                            <p className="text-[10px] font-bold opacity-60 uppercase mt-1 italic">사용자 콘텐츠 및 게시물 중재</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="opacity-60 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border-border/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-tight">시스템 설정</CardTitle>
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold italic">구성 (Configuration)</div>
                        <p className="text-[10px] font-bold opacity-40 uppercase mt-1">글로벌 파라미터 (준비 중)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle>작업 현황</CardTitle>
                        <CardDescription>
                            플랫폼 내 작업 상태 분포
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle>최근 활동 로그</CardTitle>
                        <CardDescription>
                            최신 시스템 이벤트
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for activity log */}
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">시스템 온라인</p>
                                    <p className="text-xs text-muted-foreground">관리자 대시보드가 초기화되었습니다.</p>
                                </div>
                            </div>
                            <div className="flex items-center opacity-50">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">작업 처리 중</p>
                                    <p className="text-xs text-muted-foreground">큐 워커가 활성화되었습니다.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
