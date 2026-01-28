'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isUnconfirmed, setIsUnconfirmed] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // [CRITICAL] 마스터의 요청: 인증 여부 선제 확인
            const checkRes = await fetch('/api/auth/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!checkRes.ok) throw new Error('계정 확인에 실패했습니다.');
            const status = await checkRes.json();

            if (!status.exists) {
                toast.error('가입되지 않은 이메일입니다.');
                return;
            }

            if (!status.confirmed) {
                setIsUnconfirmed(true);
                toast.warning('아직 이메일 인증이 완료되지 않았습니다. 인증 후 비밀번호 재설정이 가능합니다.');
                return;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            setIsSent(true);
            toast.success('비밀번호 재설정 메일이 발송되었습니다.');

            // 2. 쿨다운 시작 (60초)
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error: any) {
            console.error('Reset Error:', error);
            toast.error(`작업 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendInForgot = async () => {
        if (cooldown > 0) return;
        setIsResending(true);
        try {
            // 1. 서버 사이드 Rate Limit 체크
            const rlRes = await fetch('/api/auth/rate-limit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'signup' })
            });
            const rlData = await rlRes.json();

            if (!rlRes.ok) {
                toast.error(rlData.message || '요청이 너무 많습니다.');
                return;
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
            toast.success('인증 메일이 다시 발송되었습니다. 5분 이내에 확인해주세요.');

            // 2. 쿨다운 시작 (60초)
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error: any) {
            toast.error(`발송 실패: ${error.message}`);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {/* 🎨 Mesh Gradient Background */}
            <div className="absolute top-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <KeyRound className="w-10 h-10 text-indigo-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            DocTranslation
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm font-medium">
                            가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isUnconfirmed ? (
                            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-yellow-500/10 text-yellow-400 p-4 rounded-lg border border-yellow-500/20 text-sm font-medium leading-relaxed">
                                    <span className="font-bold text-white block mb-1">인증이 필요합니다</span>
                                    비밀번호를 재설정하기 전에 이메일 인증을 먼저 완료해야 합니다.<br />
                                    <span className="text-[10px] opacity-80 font-bold block mt-2">
                                        (인증 링크 유효 시간: 5분)
                                    </span>
                                </div>
                                <Button
                                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold h-12"
                                    onClick={handleResendInForgot}
                                    disabled={isResending || cooldown > 0}
                                >
                                    {isResending ? "전송 중..." : (cooldown > 0 ? `${cooldown}초 후 재발송 가능` : "인증 메일 다시 보내기")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white text-xs"
                                    onClick={() => setIsUnconfirmed(false)}
                                >
                                    이메일 다시 입력하기
                                </Button>
                            </div>
                        ) : !isSent ? (
                            <form onSubmit={handleResetPassword} className="grid gap-4">
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-indigo-500/50"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 text-base font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)]" disabled={isLoading || cooldown > 0}>
                                    {isLoading ? "확인 중..." : (cooldown > 0 ? `${cooldown}초 후 요청 가능` : "재설정 링크 받기")}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/20 text-sm font-medium leading-relaxed">
                                    <span className="font-bold text-white block mb-1">메일 발송 완료!</span>
                                    {email} 주소로 발송된 링크를 클릭하여 비밀번호를 새로 설정해주세요.
                                </div>
                                <Button
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white"
                                    onClick={() => setIsSent(false)}
                                >
                                    다른 이메일로 다시 시도
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/signin" className="flex items-center text-sm text-gray-500 hover:text-white transition-colors gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            로그인 페이지로 돌아가기
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
