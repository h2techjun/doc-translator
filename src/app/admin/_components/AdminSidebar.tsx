
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
import { useAdmin, AdminPermissions } from '@/context/admin-context';
import { motion } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const supabase = createClient();
    const { profile } = useGeoSmart();
    const { permissions, isMaster } = useAdmin();

    const isActive = (path: string) => pathname === path;

    interface NavItem {
        href: string;
        label: string;
        icon: any;
        permission?: keyof AdminPermissions;
    }

    // 🔒 권한별 메뉴 매핑
    const navItems: NavItem[] = [
        { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
        { href: '/admin/users', label: '회원 관리', icon: Users, permission: 'can_manage_users' },
        { href: '/admin/jobs', label: '작업 감시', icon: FileText, permission: 'can_manage_system' },
        { href: '/admin/posts', label: '커뮤니티', icon: MessageSquare, permission: 'can_manage_posts' },
        { href: '/admin/finance', label: '자금 관리', icon: DollarSign, permission: 'can_manage_finance' },
        { href: '/admin/reports', label: '신고 관리', icon: Flag, permission: 'can_manage_posts' },
        { href: '/admin/permissions', label: '권한 관리', icon: ShieldAlert, permission: 'can_manage_admins' },
        { href: '/admin/settings', label: '시스템 설정', icon: Settings, permission: 'can_manage_system' },
        { href: '/admin/security', label: '보안 센터', icon: ShieldAlert, permission: 'can_access_security' },
    ];

    // 현재 사용자의 권한으로 필터링
    const visibleNavItems = navItems.filter(item => {
        // 1. Master는 모든 메뉴 접근 가능
        if (isMaster) return true;

        // 2. 권한 필드가 있는 경우, 해당 권한 확인
        if (item.permission) {
            return !!permissions?.[item.permission];
        }

        // 3. 권한 필드가 없는 경우 (대시보드 등), 기본 허용
        return true;
    });

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
                        {profile?.role === 'MASTER' ? '총 관리자' : '관리자'}
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
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'text-slate-300 hover:text-white hover:bg-[#1e293b]'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.href) ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />

                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-bold text-sm whitespace-nowrap"
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
