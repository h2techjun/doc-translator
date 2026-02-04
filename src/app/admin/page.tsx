
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, CreditCard, ArrowUpRight, ArrowDownRight, Globe, BarChart3, CloudLightning, FileText, Router } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// Mock Data for Charts (Time-series data requires separate endpoint in future)
const mockChartData = [
    { name: '00:00', points: 400 },
    { name: '04:00', points: 300 },
    { name: '08:00', points: 980 },
    { name: '12:00', points: 390 },
    { name: '16:00', points: 480 },
    { name: '20:00', points: 700 },
];

type AdminStats = {
    totalUsers: number;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    estimatedRevenue: number;
    recentJobs: any[];
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto">
            {/* Header with Server Time */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 italic uppercase">
                        Master Control
                    </h1>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">System Online | Real-time Data Active</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Server Timestamp</p>
                    <p className="text-sm font-mono text-emerald-400">{new Date().toISOString()}</p>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Operations" 
                    value={loading ? "..." : stats?.totalJobs.toLocaleString() || "0"} 
                    change="LIVE" 
                    trend="up" 
                    icon={<Activity className="text-emerald-400" />} 
                />
                <StatCard 
                    title="Active Users" 
                    value={loading ? "..." : stats?.totalUsers.toLocaleString() || "0"} 
                    change="REALTIME" 
                    trend="up" 
                    icon={<Users className="text-cyan-400" />} 
                />
                <StatCard 
                    title="Success Rate" 
                    value={loading ? "..." : `${stats?.successRate}%`} 
                    change={stats?.failedJobs ? `${stats.failedJobs} failures` : "Optimal"} 
                    trend={stats?.successRate && stats.successRate > 90 ? "up" : "down"} 
                    icon={<CloudLightning className="text-orange-400" />} 
                />
                <StatCard 
                    title="Processed Data" 
                    value={loading ? "..." : `${stats?.completedJobs} Files`} 
                    change="+--%" 
                    trend="up" 
                    icon={<Globe className="text-blue-400" />} 
                />
            </div>

            {/* Main Charts & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Real-time Graph (Mock for visual, but placeholders for real data hook) */}
                <Card className="lg:col-span-2 bg-[#0f172a]/50 border-emerald-500/20 text-slate-100 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2 italic uppercase tracking-tight">
                            <Activity className="w-5 h-5" />
                            Live Network Traffic
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area type="monotone" dataKey="points" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Guest & Activity Feed */}
                <Card className="bg-[#0f172a]/50 border-cyan-500/20 text-slate-100 backdrop-blur-sm overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-cyan-400 italic uppercase tracking-tight flex justify-between items-center">
                            Recent Guests
                            <span className="text-xs not-italic text-slate-500 font-normal normal-case opacity-70">
                                Tracking IP/Country
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-0">
                        <div className="divide-y divide-slate-800/50">
                            {loading ? (
                                <div className="p-4 text-center text-xs text-slate-500 animate-pulse">Loading feed...</div>
                            ) : stats?.recentJobs?.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500">No recent activity</div>
                            ) : (
                                stats?.recentJobs?.map((job: any) => (
                                    <div key={job.id} className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                                                {/* Country Flag or Globe */}
                                                {job.country_code ? (
                                                    <img 
                                                        src={`https://flagcdn.com/w40/${job.country_code.toLowerCase()}.png`} 
                                                        alt={job.country_code}
                                                        className="w-5 h-auto rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                    />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-slate-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                                    {job.country_name || job.country_code || 'Unknown Region'}
                                                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px] text-slate-400 font-mono">
                                                        {job.ip_address === 'unknown' ? 'Hidden IP' : job.ip_address?.split('.').slice(0,2).join('.') + '.*'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] truncate">
                                                    {job.original_filename}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-emerald-500">
                                                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ko })}
                                            </div>
                                            <div className="text-[9px] text-slate-600 uppercase tracking-widest font-black">
                                                {job.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) {
    return (
        <Card className="bg-[#0f172a]/40 border-slate-800 hover:border-emerald-500/30 transition-all group backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#1e293b] rounded-lg group-hover:bg-emerald-500/10 transition-colors shadow-inner">
                        {icon}
                    </div>
                    <div className={`flex items-center text-xs font-black ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                </div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
                <p className="text-2xl font-bold mt-1 tracking-tight text-white font-mono">{value}</p>
            </CardContent>
        </Card>
    );
}
