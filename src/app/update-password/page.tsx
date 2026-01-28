'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('비밀번호가 성공적으로 변경되었습니다!');
            router.push('/');
        } catch (error: any) {
            toast.error(`변경 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {/* 🎨 Mesh Gradient Background */}
            <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-900/40 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px]" />

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
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                            DocTranslation
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm font-medium">
                            새로운 비밀번호를 입력해주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="grid gap-4">
                            <div className="grid gap-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="새로운 비밀번호 (6자 이상)"
                                        className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-emerald-500/50"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="새로운 비밀번호 확인"
                                        className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:ring-emerald-500/50"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]" disabled={isLoading}>
                                {isLoading ? "변경 중..." : "비밀번호 변경하기"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
