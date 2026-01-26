'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/config';
import { Zap, X, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
    interface Window {
        adsbygoogle: any[];
        googfc?: any;
    }
}

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReward: () => void; // 포인트 지급 후 콜백
}

export function RewardModal({ isOpen, onClose, onReward }: RewardModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // AdSense Script Lazy Load
        if (isOpen && typeof window !== 'undefined' && !window.googfc) {
            // 실제 구현 시에는 _document.tsx나 layout.tsx에서 미리 로드하는 것이 좋음
            console.log("Initialize AdSense logic here");
        }
    }, [isOpen]);

    const handleWatchAd = async () => {
        setLoading(true);

        // Development Mode Mock
        if (process.env.NODE_ENV === 'development') {
            setTimeout(async () => {
                // Mock Reward Trigger
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.rpc('increment_credit', { user_id: user.id, amount: 100 });
                }
                setLoading(false);
                onReward();
                onClose();
                alert("개발 모드: 광고 시청 완료! 포인트가 지급되었습니다."); // Toast로 대체 예정
            }, 2000);
            return;
        }

        // Production: Trigger Google Rewarded Ad
        // window.googfc.requestnet(...)
        // onGranted: () => { givePoints(); }
        console.log("Requesting Real Ad...");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                            <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">포인트가 부족해요!</h2>
                        <p className="text-gray-400 mb-8">
                            짧은 게임 광고를 시청하면 <span className="text-yellow-400 font-bold">+100 포인트</span>를<br />
                            무료로 충전해드립니다.
                        </p>

                        <button
                            onClick={handleWatchAd}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <span>광고 불러오는 중...</span>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-black" />
                                    <span>광고 보고 충전하기</span>
                                </>
                            )}
                        </button>
                        <p className="text-xs text-zinc-600 mt-4">
                            Google AdSense Rewarded Video
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
