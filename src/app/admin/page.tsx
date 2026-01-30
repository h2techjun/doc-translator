'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, CreditCard, Activity,
    ArrowUpRight, ArrowDownRight, Globe, ShieldAlert,
    BarChart3, Settings, LogOut, Menu, X, Zap, RefreshCw, Trash2, Ban
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/config';
import { useGeoSmart } from '@/context/geo-smart-context';

// Mock Data for the cybernetic dashboard
const data = [
    { name: '00:00', points: 400, traffic: 240 },
    { name: '04:00', points: 300, traffic: 139 },
    { name: '08:00', points: 980, traffic: 980 },
    { name: '12:00', points: 390, traffic: 390 },
    { name: '16:00', points: 480, traffic: 480 },
    { name: '20:00', points: 700, traffic: 600 },
];

/**
 * 👑 마스터 관리자 대시보드 (Master Admin Dashboard)
 * 
 * 디자인 테마: Cybernetic Dark Mode
 * 색상: Emerald & Cyan Neon accents on Deep Indigo
 */
export default function AdminDashboard() {
    const { t: rootT } = useGeoSmart();
    const t = rootT.admin;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bannedList, setBannedList] = useState<any[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [newBanIdentifier, setNewBanIdentifier] = useState('');
    const supabase = createClient();

    const fetchBanned = async () => {
        try {
            const res = await fetch('/api/admin/banned');
            if (res.ok) {
                const data = await res.json();
                setBannedList(data);
            }
        } catch (err) {
            console.error('Fetch banned list error:', err);
        }
    };

    const [users, setUsers] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) setUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/admin/jobs');
            if (res.ok) setJobs(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'jobs') fetchJobs();
    }, [activeTab]);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    window.location.href = '/signin';
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || profile?.role !== 'ADMIN') {
                    console.error('Unauthorized access attempt:', error);
                    window.location.href = '/';
                    return;
                }

                setIsAdmin(true);
                fetchBanned();
            } catch (err) {
                console.error('Admin check error:', err);
                window.location.href = '/';
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, [supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    <p className="text-emerald-400 font-mono text-sm animate-pulse uppercase tracking-widest">{t.verifying}</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans">
            {/* 📟 Cyber Sidebar */}
            <aside className={`bg-[#0f172a] border-r border-[#1e293b] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Zap className="w-5 h-5 text-black fill-current" />
                    </div>
                    {isSidebarOpen && <span className="font-black tracking-widest text-lg">MASTER</span>}
                </div>

                <nav className="flex-grow px-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard />} label={t.dashboard} active={activeTab === 'dashboard'} isOpen={isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Users />} label={t.users} active={activeTab === 'users'} isOpen={isSidebarOpen} onClick={() => setActiveTab('users')} />
                    <NavItem icon={<Globe />} label={t.jobs} active={activeTab === 'jobs'} isOpen={isSidebarOpen} onClick={() => setActiveTab('jobs')} />
                    <NavItem icon={<ShieldAlert />} label={t.security} active={activeTab === 'security'} isOpen={isSidebarOpen} onClick={() => setActiveTab('security')} />
                </nav>

                <div className="p-4 border-t border-[#1e293b]">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {isSidebarOpen && t.shutdown}
                    </Button>
                </div>
            </aside>

            {/* 🌌 Main Control Area */}
            <main className="flex-grow p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            MASTER CONTROL
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">System Online | 99.8% Optimal</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-tighter">Server Time</p>
                            <p className="text-sm font-mono text-emerald-400">2026-01-28 04:12:05</p>
                        </div>
                        <Button className="bg-[#1e293b] border border-[#334155] hover:bg-[#334155]">
                            <Settings className="w-4 h-4 mr-2" />
                            SysConf
                        </Button>
                    </div>
                </header>

                {/* Content based on Active Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Total Credits" value="1,284,592" change="+12.5%" trend="up" icon={<CreditCard className="text-emerald-400" />} />
                            <StatCard title="Active Sessions" value="45,883" change="+5.2%" trend="up" icon={<Users className="text-cyan-400" />} />
                            <StatCard title="System Load" value="24.8%" change="-2.1%" trend="down" icon={<Activity className="text-orange-400" />} />
                            <StatCard title="Global Traffic" value="4.2 TB" change="+18.4%" trend="up" icon={<Globe className="text-blue-400" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <Card className="lg:col-span-2 bg-[#0f172a] border-[#1e293b] text-slate-100">
                                <CardHeader>
                                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Real-time Credit Flow
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                            <Area type="monotone" dataKey="points" stroke="#10b981" fillOpacity={0.3} fill="#10b981" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#0f172a] border-[#1e293b] text-slate-100">
                                <CardHeader>
                                    <CardTitle className="text-cyan-400">Tier Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[{ name: 'Bronze', count: 4000 }, { name: 'Silver', count: 1200 }, { name: 'Gold', count: 350 }]}>
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-[#0f172a] border-[#1e293b] text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-emerald-400">{t.userManagement}</CardTitle>
                                <CardDescription>{t.totalUsers}: {users.length}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-[#1e293b]/50 rounded-lg border border-[#1e293b]">
                                            <div>
                                                <p className="font-bold">{user.email}</p>
                                                <p className="text-xs text-slate-500">{user.id}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                    {user.role || 'USER'}
                                                </span>
                                                <span className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'jobs' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-[#0f172a] border-[#1e293b] text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-cyan-400">{t.translationJobs}</CardTitle>
                                <CardDescription>{t.recentActivity}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {jobs.map(job => (
                                        <div key={job.id} className="flex items-center justify-between p-4 bg-[#1e293b]/50 rounded-lg border border-[#1e293b]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                                                    {job.original_filename?.split('.').pop()?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{job.original_filename}</p>
                                                    <p className="text-xs text-slate-500">{job.target_lang} • {new Date(job.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                job.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'security' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <Card className="bg-[#0f172a] border-[#1e293b] text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-rose-400 flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6" />
                                    {t.banSystem}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    {t.banDesc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 mb-8 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                    <Input
                                        placeholder="차단할 Email 또는 IP 주소 입력..."
                                        className="bg-[#020617] border-[#1e293b] text-white"
                                        value={newBanIdentifier}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBanIdentifier(e.target.value)}
                                    />
                                    <Button
                                        className="bg-rose-600 hover:bg-rose-500 text-white min-w-[120px]"
                                        disabled={isActionLoading || !newBanIdentifier}
                                        onClick={async () => {
                                            setIsActionLoading(true);
                                            await fetch('/api/admin/banned', {
                                                method: 'POST',
                                                body: JSON.stringify({ action: 'BAN', identifier: newBanIdentifier })
                                            });
                                            setNewBanIdentifier('');
                                            await fetchBanned();
                                            setIsActionLoading(false);
                                        }}
                                    >
                                        <Ban className="w-4 h-4 mr-2" />
                                        수동 차단
                                    </Button>
                                    <Button variant="ghost" className="text-slate-400" onClick={fetchBanned}>
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {bannedList.length === 0 ? (
                                        <div className="text-center py-10 border border-dashed border-[#1e293b] rounded-xl text-slate-500">
                                            차단된 엔티티가 없습니다. 시스템이 청정합니다.
                                        </div>
                                    ) : (
                                        bannedList.map((ban) => (
                                            <div key={ban.id} className="flex justify-between items-center p-4 bg-[#1e293b]/50 border border-[#1e293b] rounded-xl group hover:border-rose-500/30 transition-all">
                                                <div>
                                                    <p className="font-mono text-white text-lg">{ban.identifier}</p>
                                                    <div className="flex gap-4 mt-1">
                                                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Reason: {ban.reason}</span>
                                                        <span className="text-[10px] uppercase tracking-widest text-rose-500/60">{new Date(ban.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                                    disabled={isActionLoading}
                                                    onClick={async () => {
                                                        setIsActionLoading(true);
                                                        await fetch('/api/admin/banned', {
                                                            method: 'POST',
                                                            body: JSON.stringify({ action: 'UNBAN', identifier: ban.identifier })
                                                        });
                                                        await fetchBanned();
                                                        setIsActionLoading(false);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    차단 해제
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false, isOpen = true, onClick }: { icon: any, label: string, active?: boolean, isOpen?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'}`}
        >
            <span className="w-5 h-5">{icon}</span>
            {isOpen && <span className="font-medium">{label}</span>}
            {active && isOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
        </div>
    );
}

function StatCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) {
    return (
        <Card className="bg-[#0f172a] border-[#1e293b] hover:border-emerald-500/30 transition-all group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#1e293b] rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                        {icon}
                    </div>
                    <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                </div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</h3>
                <p className="text-2xl font-bold mt-1 tracking-tight text-white">{value}</p>
            </CardContent>
        </Card>
    );
}
