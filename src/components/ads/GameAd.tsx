"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const GameAd = () => {
    const [view, setView] = useState<'ad' | 'game'>('ad');

    useEffect(() => {
        if (view === 'ad') {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense error:", err);
            }
        }
    }, [view]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto my-6 p-1 rounded-2xl bg-gradient-to-br from-border/50 to-background border border-border shadow-2xl overflow-hidden"
        >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('ad')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${view === 'ad' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                    >
                        ADS REVENUE
                    </button>
                    <button
                        onClick={() => setView('game')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${view === 'game' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                    >
                        🎮 PLAY GAME WHILE WAITING
                    </button>
                </div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase opacity-50">
                    Sponsor Space
                </div>
            </div>

            <div className="relative min-h-[300px] bg-black/40">
                <AnimatePresence mode="wait">
                    {view === 'ad' ? (
                        <motion.div
                            key="ad-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="p-6 flex flex-col items-center"
                        >
                            <ins className="adsbygoogle"
                                style={{ display: "block" }}
                                data-ad-client="ca-pub-8134930906845147"
                                data-ad-slot="4477457432"
                                data-ad-format="auto"
                                data-full-width-responsive="true"></ins>

                            {/* ✨ Reward Button */}
                            <div className="mt-8 pt-6 border-t border-white/10 w-full flex flex-col items-center gap-4">
                                <p className="text-sm text-zinc-400 font-medium">광고를 보셨나요? 리워드를 받으세요!</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/user/reward', {
                                                method: 'POST',
                                                body: JSON.stringify({ amount: 5, type: 'AD_WATCH' })
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                alert(`축하합니다! ${data.pointsClaimed}P가 충전되었습니다.`);
                                                window.location.reload();
                                            }
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    5 포인트 받기 (+5P)
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full aspect-video"
                        >
                            <iframe
                                src="https://html5.gamedistribution.com/53ad84c4f3b440f2b65d5382fadf731f/?gd_sdk_referrer_url=https://doctranslation.co"
                                width="100%"
                                height="100%"
                                scrolling="none"
                                frameBorder="0"
                                className="w-full h-full min-h-[500px]"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
