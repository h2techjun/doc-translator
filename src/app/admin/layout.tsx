
'use client';

import { useGeoSmart } from '@/context/geo-smart-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './_components/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useGeoSmart();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!profile) {
                // Not logged in
                const loginUrl = `/signin?redirect=${encodeURIComponent(pathname)}`;
                router.replace(loginUrl);
            } else if (profile.role !== 'ADMIN' && profile.role !== 'MASTER') {
                // Logged in but not admin
                router.replace('/');
            } else {
                // Authorized
                setIsAuthorized(true);
            }
        }
    }, [profile, isLoading, router, pathname]);

    if (isLoading || !isAuthorized) {
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
