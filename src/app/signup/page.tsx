'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Languages, UserPlus, ArrowRight, Shield, Check, Chrome, Apple, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGeoSmart } from '@/hooks/use-geo-smart';

import { Suspense } from 'react';

function SignUpContent() {
    const { uiLang, t } = useGeoSmart();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get('email') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    // const [otp, setOtp] = useState(''); // Unused
    const [showOtpInput, setShowOtpInput] = useState(false); // Used to toggle Success Message
    const [cooldown, setCooldown] = useState(0); // [NEW] 쿨다운 타이머 (초)
    const supabase = createClient();

    const handleGuestLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            toast.success('Guest login successful (10P granted)');
            window.location.href = '/';
        } catch (error: any) {
            toast.error(`Guest login failed: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(`Social login failed: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // [SECURITY] 최초 가입 시에도 이메일 발송이 발생하므로 Rate Limit 체크
            const rlRes = await fetch('/api/auth/rate-limit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'signup' })
            });
            const rlData = await rlRes.json();


            // [DEBUG] Rate Limit Response
            console.log(`[Signup] Rate Limit Response: ${rlRes.status}`, rlData);

            if (!rlRes.ok) {
                console.error('[Signup] Rate Limit Blocked:', rlData);
                toast.error(rlData.message || '요청이 너무 많습니다.');
                return;
            }

            console.log('[Signup] Calling Supabase signUp...');
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        locale: uiLang // Pass global locale to Supabase
                    }
                }
            });
            if (error) throw error;
            setShowOtpInput(true); // Shows "Check Email" UI
            toast.success('인증 메일이 발송되었습니다. 스팸함도 꼭 확인해주세요!');

            // 쿨다운 시작 (가입 직후 재발송 방지)
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
            toast.error(`Signup failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
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

            console.log('Resending verification to:', email);
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) {
                console.error('Supabase resend error:', error);
                throw error;
            }
            toast.success(t.auth.checkEmailTitle || 'Email resent!');

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
            console.error('Full Resend Error:', error);
            toast.error(`Resend failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsResending(false);
        }
    };

    // handleVerifyOtp removed as we use Magic Link


    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {/* 🎨 Mesh Gradient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/30 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <UserPlus className="w-10 h-10 text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            {t.auth.signupTitle}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm font-medium px-6 leading-relaxed">
                            {showOtpInput ? t.auth.checkEmailDesc : t.auth.signupDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        {!showOtpInput && (
                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 h-12 justify-center px-6 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    onClick={handleGuestLogin}
                                    disabled={isLoading}
                                >
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                    {t.auth.guestLogin}
                                </Button>
                            </div>
                        )}



                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin('kakao')} disabled={isLoading} className="border-yellow-400/20 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-500">
                                <span className="font-bold">Kakao</span>
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} disabled={isLoading} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
                                <span className="font-bold">Google</span>
                            </Button>
                        </div>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-[#141414] px-3 text-gray-500">
                                    {showOtpInput ? "Verification" : "Create Account"}
                                </span>
                            </div>
                        </div>

                        {!showOtpInput ? (
                            <form onSubmit={handleSignUp} className="grid gap-3">
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="email"
                                            placeholder={t.auth.emailPlaceholder}
                                            className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="password"
                                            placeholder={t.auth.passwordPlaceholder}
                                            className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-2 h-12 text-base font-black shadow-[0_0_20px_rgba(37,99,235,0.3)]" disabled={isLoading}>
                                    {isLoading ? "..." : t.auth.submitSignup}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                    <Check className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">{t.auth.checkEmailTitle}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                                        {t.auth.sentTo} <span className="text-blue-400 font-medium">{email}</span><br />
                                        {t.auth.checkEmailDesc}<br />
                                        <span className="text-[10px] text-yellow-500/80 font-bold block mt-1">
                                            ⚠️ 메일이 오지 않는다면 스팸함을 확인해 보세요.
                                        </span>
                                        <span className="text-[10px] text-yellow-500/80 font-bold">
                                            ⚠️ 보안을 위해 인증 링크는 5분 이내에 클릭해야 합니다.
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleResendEmail}
                                    disabled={isResending || cooldown > 0}
                                    className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                                    {isResending ? t.auth.btnSending : (cooldown > 0 ? `${cooldown}초 후 재발송 가능` : t.auth.btnResend)}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowOtpInput(false)}
                                    className="mt-2 border-white/10 hover:bg-white/5 text-gray-400 text-xs w-full"
                                >
                                    {t.auth.backWithEmail}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center">
                        <p className="text-sm text-gray-400">
                            {t.auth.alreadyHaveAccount}{" "}
                            <Link href="/signin" className="text-blue-400 hover:underline font-medium">
                                {t.auth.toSignin}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div >
        </div >
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
            <SignUpContent />
        </Suspense>
    );
}
