'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameAd } from '@/components/ads/GameAd';
import { GoogleAd } from '@/components/ads/GoogleAd';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard, FileText, Zap, Settings,
    ArrowRight, Clock, Shield, Crown
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useGeoSmart } from '@/hooks/use-geo-smart';

type Job = {
    id: string;
    created_at: string;
    original_filename: string;
    status: 'WAITING' | 'UPLOADING' | 'PROCESSING' | 'TRANSLATING' | 'COMPLETED' | 'FAILED';
    progress: number;
    target_language: string;
};

type Profile = {
    email: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
    points: number;
    role: string;
};

export default function DashboardPage() {
    const { t } = useGeoSmart();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const loadDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/signin';
                return;
            }

            // 프로필 정보 가져오기
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // 최근 작업 가져오기 (최대 5개)
            const { data: jobsData } = await supabase
                .from('translation_jobs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (jobsData) {
                setJobs(jobsData as Job[]);
            }

            setIsLoading(false);
        };

        loadDashboardData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
            case 'FAILED': return 'text-red-600 bg-red-500/10 border-red-500/20';
            case 'TRANSLATING': return 'text-blue-600 bg-blue-500/10 border-blue-500/20 animate-pulse';
            default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        대시보드
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        안녕하세요, <span className="font-bold text-foreground">{profile?.email?.split('@')[0]}</span>님! 오늘의 번역 현황입니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Zap className="w-4 h-4 mr-2" /> 새 번역 시작
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">현재 플랜</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Crown className={`w-5 h-5 ${profile?.tier === 'GOLD' ? 'text-yellow-500' :
                                    profile?.tier === 'SILVER' ? 'text-slate-400' : 'text-amber-700'
                                    }`} />
                                <span className="text-2xl font-bold">{profile?.tier || 'FREE'}</span>
                            </div>
                            <Link href="/pricing">
                                <Button variant="ghost" size="sm" className="text-xs text-primary">업그레이드</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">보유 포인트</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-500" />
                                <span className="text-2xl font-bold">{profile?.points || 0} P</span>
                            </div>
                            <Link href="/pricing">
                                <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">충전하기</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 번역 작업</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold">{jobs.length} 건</span>
                            <span className="text-xs text-muted-foreground ml-2">(최근 30일)</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Recent Jobs List (Span 2) */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            최근 작업
                        </h2>
                        <Link href="/my-translations" className="text-sm text-primary hover:underline flex items-center">
                            전체보기 <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {jobs.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                <p className="text-muted-foreground text-sm">최근 번역 기록이 없습니다.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                {job.original_filename.split('.').pop()?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium truncate max-w-[200px]">{job.original_filename}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`${getStatusColor(job.status)}`}>
                                        {job.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Menu (Span 1) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        설정 및 관리
                    </h2>
                    <Card>
                        <CardContent className="p-2 space-y-1">
                            <Link href="/settings/profile">
                                <Button variant="ghost" className="w-full justify-start h-12">
                                    <Settings className="w-4 h-4 mr-2" /> 프로필 설정
                                </Button>
                            </Link>
                            <Link href="/my-translations">
                                <Button variant="ghost" className="w-full justify-start h-12">
                                    <FileText className="w-4 h-4 mr-2" /> 번역 기록 전체
                                </Button>
                            </Link>
                            {profile?.role === 'ADMIN' && (
                                <div className="pt-2 mt-2 border-t">
                                    <Link href="/admin">
                                        <Button variant="ghost" className="w-full justify-start h-12 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                            <Shield className="w-4 h-4 mr-2" /> 관리자 대시보드
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 광고 섹션 */}
            <div className="space-y-6 pt-8 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">후원 광고</h3>
                <GameAd />
                <GoogleAd />
            </div>
        </div>
    );
}
