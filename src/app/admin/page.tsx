
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, CreditCard, ArrowUpRight, ArrowDownRight, Globe, BarChart3, CloudLightning } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock Data (will be replaced by real API)
const data = [
    { name: '00:00', points: 400 },
    { name: '04:00', points: 300 },
    { name: '08:00', points: 980 },
    { name: '12:00', points: 390 },
    { name: '16:00', points: 480 },
    { name: '20:00', points: 700 },
];

export default function AdminDashboardPage() {
    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto">
            {/* Header with Server Time */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 italic uppercase">
                        Master Control
                    </h1>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">System Online | 99.9% Optimal</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Server Timestamp</p>
                    <p className="text-sm font-mono text-emerald-400">{new Date().toISOString()}</p>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Credits" value="1,284,592" change="+12.5%" trend="up" icon={<CreditCard className="text-emerald-400" />} />
                <StatCard title="Active Users" value="45,883" change="+5.2%" trend="up" icon={<Users className="text-cyan-400" />} />
                <StatCard title="System GPU" value="24.8%" change="-2.1%" trend="down" icon={<CloudLightning className="text-orange-400" />} />
                <StatCard title="Throughput" value="4.2 TB" change="+18.4%" trend="up" icon={<Globe className="text-blue-400" />} />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Real-time Graph */}
                <Card className="lg:col-span-2 bg-[#0f172a]/50 border-emerald-500/20 text-slate-100 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2 italic uppercase tracking-tight">
                            <Activity className="w-5 h-5" />
                            Neural Network Load
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
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

                {/* Tier Distribution */}
                <Card className="bg-[#0f172a]/50 border-cyan-500/20 text-slate-100 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-cyan-400 italic uppercase tracking-tight">User Hierarchy</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'Bronze', count: 4000 }, { name: 'Silver', count: 1200 }, { name: 'Gold', count: 350 }]}>
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={40} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
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
