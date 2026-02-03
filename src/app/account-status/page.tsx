'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Home, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function AccountStatusContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const until = searchParams.get('until');

    const isBanned = status === 'BANNED';
    const isSuspended = status === 'SUSPENDED';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className={`h-2 ${isBanned ? 'bg-rose-500' : 'bg-amber-500'}`} />
                
                <div className="p-10 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isBanned ? 'bg-rose-50' : 'bg-amber-50'}`}>
                        <AlertTriangle className={`w-10 h-10 ${isBanned ? 'text-rose-500' : 'text-amber-500'}`} />
                    </div>

                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                        {isBanned ? '계정 영구 차단' : '계정 일시 정지'}
                    </h1>
                    
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                        {isBanned 
                            ? '운영 정책 위반으로 인해 서비스 이용이 영구적으로 영구 제한되었습니다.' 
                            : '서비스 부적절 이용으로 인해 계정이 일시적으로 정지되었습니다.'}
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-100 dark:border-slate-800">
                        <div className="mb-4">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">제재 사유</span>
                            <p className="text-sm font-bold">{reason || '상세 사유 미지정'}</p>
                        </div>
                        
                        {until && (
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">정지 기간</span>
                                <p className="text-sm font-bold">
                                    {format(new Date(until), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}까지
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button className="w-full h-12 rounded-xl font-black italic uppercase tracking-tight bg-slate-950 hover:bg-slate-800 text-white">
                            <Mail className="w-4 h-4 mr-2" />
                            이의 신청 하기
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/">
                                <Button variant="outline" className="w-full h-12 rounded-xl font-black italic uppercase tracking-tight">
                                    <Home className="w-4 h-4 mr-2" />
                                    홈으로
                                </Button>
                            </Link>
                            <Button variant="ghost" className="w-full h-12 rounded-xl font-black italic uppercase tracking-tight text-rose-500">
                                <LogOut className="w-4 h-4 mr-2" />
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                DocTranslation Security Center
            </p>
        </div>
    );
}

export default function AccountStatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center italic animate-pulse">상태 확인 중...</div>}>
            <AccountStatusContent />
        </Suspense>
    );
}
