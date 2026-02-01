
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, Users, FileText, ShieldAlert,
    Settings, LogOut, Zap, MessageSquare, DollarSign,
    Menu, ChevronRight, Flag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/config';
import { useGeoSmart } from '@/context/geo-smart-context';
import { motion } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const supabase = createClient();
    const { profile } = useGeoSmart(); // useGeoSmart를 통해 profile.role 가져오기 (가장 정확)

    const isActive = (path: string) => pathname === path;

    // 🔒 권한별 메뉴 필터링
    const navItems = [
        { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard, role: ['MASTER', 'ADMIN'] },
        { href: '/admin/users', label: '회원 관리', icon: Users, role: ['MASTER', 'ADMIN'] },
        { href: '/admin/jobs', label: '작업 감시', icon: FileText, role: ['MASTER', 'ADMIN'] },
        { href: '/admin/posts', label: '커뮤니티', icon: MessageSquare, role: ['MASTER', 'ADMIN'] },
        { href: '/admin/finance', label: '자금 관리', icon: DollarSign, role: ['MASTER'] },
        { href: '/admin/reports', label: '신고 관리', icon: Flag, role: ['MASTER', 'ADMIN'] },
        // 🔹 아래 메뉴는 MASTER 전용
        { href: '/admin/settings', label: '시스템 설정', icon: Settings, role: ['MASTER'] },
        { href: '/admin/security', label: '보안 센터', icon: ShieldAlert, role: ['MASTER'] },
    ];

    // 현재 사용자의 권한으로 필터링
    const visibleNavItems = navItems.filter(item =>
        !item.role || (profile?.role && item.role.includes(profile.role))
    );

    return (
        <aside
            className={`
                bg-[#0f172a] border-r border-[#1e293b] flex flex-col transition-all duration-300 z-20
                ${isOpen ? 'w-64' : 'w-20'} 
                h-screen sticky top-0
            `}
        >
            {/* Header */}
            <div className="p-6 flex items-center gap-3 relative">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 shadow-[0_0_15px] ${profile?.role === 'MASTER' ? 'bg-purple-500 shadow-purple-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                    {profile?.role === 'MASTER' ? <ShieldAlert className="w-5 h-5 text-black fill-current" /> : <Zap className="w-5 h-5 text-black fill-current" />}
                </div>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-black tracking-tighter text-xl italic text-white"
                    >
                        {profile?.role === 'MASTER' ? 'MASTER' : 'ADMIN'}
                    </motion.span>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-7 w-6 h-6 bg-[#1e293b] rounded-full border border-[#334155] flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors"
                >
                    <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-grow px-3 space-y-1 mt-4 overflow-y-auto">
                {visibleNavItems.map((item) => (
                    <Link key={item.href} href={item.href} className="block">
                        <div
                            className={`
                                flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative
                                ${isActive(item.href)
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    : 'text-slate-400 hover:text-white hover:bg-[#1e293b]'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.href) ? 'text-emerald-400' : 'group-hover:text-white'}`} />

                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-medium text-sm whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}

                            {isActive(item.href) && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-tr-full rounded-br-full" />
                            )}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#1e293b]">
                <Button
                    variant="ghost"
                    className={`w-full ${isOpen ? 'justify-start' : 'justify-center'} text-red-400 hover:text-red-300 hover:bg-red-400/10`}
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                    }}
                >
                    <LogOut className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
                    {isOpen && "로그아웃"}
                </Button>
            </div>
        </aside>
    );
}
