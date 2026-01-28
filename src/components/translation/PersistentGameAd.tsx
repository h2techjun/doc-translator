'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Gift, Timer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';

export function PersistentGameAd() {
    const [timeLeft, setTimeLeft] = useState(15);
    const [isCounting, setIsCounting] = useState(false);
    const [isRewarded, setIsRewarded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCounting && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isRewarded) {
            setIsRewarded(true);
            setIsCounting(false);
            handleGrantReward();
        }
        return () => clearInterval(interval);
    }, [isCounting, timeLeft, isRewarded]);

    const handleGrantReward = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            // 포인트 지급 API 호출 (또는 직결 로직 - 보안상 API 권장)
            const response = await fetch('/api/user/reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 2, type: 'AD_REWARD' })
            });

            if (response.ok) {
                toast.success('2포인트가 적립되었습니다! 🎁');
            }
        } catch (error) {
            console.error('Reward error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative aspect-[21/9] md:aspect-[32/9] bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 group">

                {/* Status Overlay */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    {!isCounting && !isRewarded && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] h-7 px-3 rounded-full font-black animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                            onClick={() => setIsCounting(true)}
                        >
                            <Gift className="w-3 h-3 mr-1" />
                            REWARD MISSION: 2P
                        </Button>
                    )}
                    {isCounting && (
                        <div className="bg-black/60 backdrop-blur-md border border-blue-500/50 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xl">
                            <Timer className="w-3 h-3 animate-spin" />
                            REWARD IN {timeLeft}S
                        </div>
                    )}
                    {isRewarded && (
                        <div className="bg-emerald-500 text-black px-4 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-bounce">
                            <CheckCircle2 className="w-3 h-3" />
                            REWARD COMPLETED (+2P)
                        </div>
                    )}
                </div>

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 tracking-wider flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" />
                    PLAYABLE AD
                </div>

                {/* Iframe */}
                <iframe
                    src="https://snake.googlemaps.com"
                    className={`w-full h-full border-none transition-all duration-1000 ${isCounting ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] grayscale'}`}
                    title="Playable Ad"
                />

                {!isCounting && !isRewarded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
                        <p className="text-white text-sm font-bold tracking-widest uppercase opacity-60">
                            Play to earn points
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
