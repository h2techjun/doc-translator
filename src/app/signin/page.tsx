'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Mail, Lock, Languages, Chrome, ArrowRight, Shield, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';
import Link from 'next/link';
import { useGeoSmart } from '@/hooks/use-geo-smart';

/**
 * 🔐 프리미엄 로그인 페이지 (Premium Sign-in Page)
 * 
 * 디자인 테마: Glassmorphism + Mesh Gradient
 * 배경: 깊은 퍼플 & 에메랄드 그린 그라데이션
 */
export default function SignInPage() {
    const { t } = useGeoSmart();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isUnconfirmed, setIsUnconfirmed] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const supabase = createClient();

    const handleGuestLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            toast.success('Guest login successful (10P granted)'); // Localized toasts can be added later if critical
            window.location.href = '/';
        } catch (error: any) {
            toast.error(`Guest login failed: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'kakao' | 'google') => { // Naver requires specific setup, starting with Kakao/Google
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

    const handleResendConfirmation = async () => {
        if (cooldown > 0) return;
        setIsLoading(true);
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

            console.log('Signin: Resending confirmation to:', email);
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) {
                console.error('Signin: Resend error:', error);
                throw error;
            }
            toast.success(t.auth.checkEmailTitle || 'Email sent!');

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
            console.error('Signin: Full Resend Error:', error);
            toast.error(`Failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Unconfirmed State handling (Resend logic is handled by button click)
        if (isUnconfirmed) return;

        setIsLoading(true);
        try {
            // 1. Check User Status
            const checkRes = await fetch('/api/auth/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!checkRes.ok) {
                // If API fails (e.g. 500), try to parse error or default to generic
                const errData = await checkRes.json().catch(() => ({}));
                throw new Error(errData.error || 'Check failed.');
            }

            const status = await checkRes.json();

            if (!status.exists) {
                toast.error(t.auth.alertUnconfirmed || 'User not found.');
                // Redirect to Signup with email pre-filled
                window.location.href = `/signup?email=${encodeURIComponent(email)}`;
                return;
            }

            if (!status.confirmed) {
                setIsUnconfirmed(true);
                toast.warning(t.auth.alertUnconfirmed);
                setIsLoading(false);
                return;
            }

            // 2. Try Login
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // [CRITICAL] 마스터의 요청: 비밀번호가 틀려도 미인증이면 안내
                const isInvalidCreds = signInError.message.includes("Invalid login credentials");

                if (isInvalidCreds && !status.confirmed) {
                    setIsUnconfirmed(true);
                    toast.warning(t.auth.alertUnconfirmed || "비밀번호가 일치하지 않으며, 아직 이메일 인증이 완료되지 않았습니다.");
                    setIsLoading(false);
                    return;
                }

                if (isInvalidCreds) {
                    throw new Error(t.auth.signinDesc ? "Password incorrect" : "비밀번호가 일치하지 않습니다.");
                }
                throw signInError;
            }

            toast.success(t.auth.submitLogin);
            window.location.href = '/';
        } catch (error: any) {
            // Expected User Erros (Don't spam console.error)
            if (error.message === "비밀번호가 일치하지 않습니다." || error.message.includes("이메일")) {
                console.warn("Login Attempt Failed:", error.message);
            } else {
                console.error("Login System Error:", error);
            }

            toast.error(error.message || "Login failed.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {/* 🎨 Mesh Gradient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/40 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/30 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-white">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <Languages className="w-10 h-10 text-emerald-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                            {t.nav.brandName}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm font-medium px-6 leading-relaxed">
                            {t.auth.signinDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
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



                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin('kakao')} disabled={isLoading} className="border-yellow-400/20 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-500">
                                <span className="font-bold">Kakao</span>
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} disabled={isLoading} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
                                <span className="font-bold">Google</span>
                            </Button>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-[#141414] px-3 text-gray-500 italic">{t.nav.memberLogin}</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="grid gap-3">
                            <div className="grid gap-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder={t.auth.emailPlaceholder}
                                        className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-emerald-500/50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isUnconfirmed}
                                    />
                                </div>
                            </div>

                            {isUnconfirmed ? (
                                <div className="animate-in fade-in zoom-in duration-300 space-y-3">
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">
                                        {t.auth.alertUnconfirmed}<br />
                                        <span className="text-[10px] opacity-80 font-medium">
                                            (인증 링크는 보안상 발송 후 5분 동안만 유효합니다. 기간 만료 시 다시 인증이 필요합니다.)
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                                        onClick={handleResendConfirmation}
                                        disabled={isLoading || cooldown > 0}
                                    >
                                        {isLoading ? t.auth.btnSending : (cooldown > 0 ? `${cooldown}초 후 재발송 가능` : t.auth.btnResend)}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-gray-400 hover:text-white text-xs"
                                        onClick={() => setIsUnconfirmed(false)}
                                    >
                                        {t.auth.btnLoginOther}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                type="password"
                                                placeholder={t.auth.passwordPlaceholder}
                                                className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-emerald-500/50"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember-me"
                                                checked={rememberMe}
                                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                                className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">
                                                {t.auth?.rememberMe || "로그인 상태 유지"}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                                        >
                                            {t.auth.forgotPassword}
                                        </Link>
                                    </div>
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-2 h-12 text-base font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" disabled={isLoading}>
                                        {isLoading ? "..." : t.auth.submitLogin}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center">
                        <p className="text-sm text-gray-400">
                            <Link href="/signup" className="text-emerald-400 hover:underline font-medium">
                                {t.auth.toSignup}
                            </Link>
                        </p>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                            <Shield className="w-3 h-3" />
                            {t.auth.social}
                        </div>
                    </CardFooter>
                </Card>
            </motion.div >
        </div >
    );
}
