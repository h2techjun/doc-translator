
'use client';

import { useGeoSmart } from '@/context/geo-smart-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './_components/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, isLoading } = useGeoSmart();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 1. 전역 로딩이 끝날 때까지 대기
        if (isLoading) return;

        const verifyAdmin = async () => {
            // 2. 로그인 여부 확인
            if (!user) {
                const loginUrl = `/signin?redirect=${encodeURIComponent(pathname)}`;
                router.replace(loginUrl);
                return;
            }

            // 3. 권한 확인 (Profile 또는 Email Whitelist 활용)
            // Profile 로딩이 지연되더라도 이메일이 화이트리스트에 있으면 즉시 통과 (Fail-safe)
            const { isAuthorizedAdmin } = await import('@/lib/security-admin');
            
            const adminUser = {
                id: user.id,
                email: user.email || null,
                role: profile?.role
            };

            if (isAuthorizedAdmin(adminUser)) {
                setIsAuthorized(true);
            } else {
                console.warn('[Admin Access Denied]', adminUser);
                router.replace('/');
            }
            setIsChecking(false);
        };

        verifyAdmin();
    }, [user, profile, isLoading, router, pathname]);

    if (isLoading || isChecking || !isAuthorized) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-slate-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-sm font-bold animate-pulse">관리자 권한 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">
            <AdminSidebar />
            <main className="flex-grow h-screen overflow-y-auto bg-gradient-to-br from-[#020617] via-[#050b1a] to-[#0f172a]">
                {children}
            </main>
        </div>
    );
}
