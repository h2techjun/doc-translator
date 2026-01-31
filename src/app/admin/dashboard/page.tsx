'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Activity, DollarSign, AlertTriangle } from 'lucide-react';
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

    if (loading) return <div className="p-10 flex justify-center italic text-muted-foreground animate-pulse">Initializing Master Dashboard...</div>;
    if (error) return (
        <div className="p-10 flex flex-col items-center gap-4 text-red-500 bg-red-50/10 rounded-2xl border border-red-500/20 max-w-md mx-auto my-10">
            <AlertTriangle className="w-10 h-10" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">Access Refused</h1>
            <p className="text-sm font-bold opacity-80">{error}</p>
            <Link href="/">
                <Button variant="outline" size="sm" className="mt-2 border-red-500/50 text-red-500 hover:bg-red-500/10">Return Home</Button>
            </Link>
        </div>
    );

    const chartData = stats ? [
        { name: 'Completed', value: stats.completedJobs, fill: '#10b981' },
        { name: 'Failed', value: stats.failedJobs, fill: '#ef4444' },
        { name: 'Processing', value: stats.totalJobs - (stats.completedJobs + stats.failedJobs), fill: '#3b82f6' },
    ] : [];

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-8 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <Activity className="w-10 h-10 text-indigo-500" />
                Master Dashboard
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Link href="/admin/users">
                    <Card className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/jobs">
                    <Card className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalJobs}</div>
                            <p className="text-xs text-muted-foreground">files processed</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats?.successRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">Global translation reliability</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            ${stats?.estimatedRevenue?.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Based on usage projection</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle>Job Performance</CardTitle>
                        <CardDescription>
                            Distribution of job statuses across the platform.
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
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest system events logs.
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
                                    <p className="text-sm font-medium leading-none">System Online</p>
                                    <p className="text-xs text-muted-foreground">Admin dashboard initialized.</p>
                                </div>
                            </div>
                            <div className="flex items-center opacity-50">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Job Processing</p>
                                    <p className="text-xs text-muted-foreground">Queue worker is active.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
