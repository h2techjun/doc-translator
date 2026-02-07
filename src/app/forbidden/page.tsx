'use client';

import { useGeoSmart } from '@/context/geo-smart-context';
import { ShieldAlert, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
    const { user, profile, isLoading } = useGeoSmart();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 font-sans select-none">
            <div className="w-full max-w-lg space-y-8 text-center">
                <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-rose-700 tracking-tighter drop-shadow-2xl">
                    403
                </h1>
                
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                    Unauthorized Access
                </h2>

                <p className="text-slate-400 font-medium leading-relaxed px-6">
                    현재 계정으로는 관리자 대시보드에 접근할 수 없습니다.<br />
                    아래 정보를 확인하여 관리자에게 문의하세요.
                </p>

                {/* Debug Info Card */}
                {!isLoading && user && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left space-y-3 backdrop-blur-sm mx-4">
                        <div className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 border-b border-slate-800 pb-2">
                            Current Session Info
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Email</span>
                            <span className="font-mono text-indigo-400 font-bold break-all ml-4 text-right">{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Role</span>
                            <span className={`font-mono font-black uppercase ${profile?.role === 'ADMIN' || profile?.role === 'MASTER' ? 'text-green-500' : 'text-red-500'}`}>
                                {profile?.role || 'USER'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Tier</span>
                            <span className={`font-mono font-black uppercase ${profile?.tier === 'DIAMOND' ? 'text-cyan-400' : 'text-slate-300'}`}>
                                {profile?.tier || 'FREE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800 mt-2">
                            <span className="text-slate-500 text-xs">User ID</span>
                            <span className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]">{user.id}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 justify-center pt-8">
                    <Button 
                        onClick={() => router.push('/signin')}
                        variant="outline"
                        className="h-12 px-8 border-slate-700 hover:bg-slate-800 text-slate-300 font-bold gap-2 rounded-xl"
                    >
                        <LogIn className="w-4 h-4" />
                        로그인
                    </Button>
                    <Button 
                        onClick={() => router.push('/')}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20 rounded-xl"
                    >
                        <Home className="w-4 h-4" />
                        홈으로
                    </Button>
                </div>
            </div>
        </div>
    );
}
