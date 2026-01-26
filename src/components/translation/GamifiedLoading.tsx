'use client';

import { motion } from 'framer-motion';
import { Zap, Gamepad2, Download, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GamifiedLoadingProps {
    progress: number; // 0 ~ 100
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    onDownload?: () => void;
}

export function GamifiedLoading({ progress, status, onDownload }: GamifiedLoadingProps) {
    const [showGame, setShowGame] = useState(false);

    useEffect(() => {
        // 로딩이 20% 넘어가면 게임 패널 활성화 (너무 빠르면 정신없으므로)
        if (progress > 10 && status === 'processing') {
            setShowGame(true);
        }
    }, [progress, status]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-8 relative">

            {/* 1. Header Area with Progress */}
            <div className="mb-8 text-center space-y-4">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    {status === 'uploading' && 'Uploading Document...'}
                    {status === 'processing' && (showGame ? 'Playing while Working...' : 'Analyzing Layout...')}
                    {status === 'completed' && 'Translation Ready!'}
                    {status === 'failed' && 'Oops, something went wrong.'}
                </h2>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        {progress.toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area (Game Ad or Status Icon) */}
            <div className="aspect-video bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden group">

                {status === 'completed' ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-4 p-10"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">Document Translated Successfully</h3>
                        <button
                            onClick={onDownload}
                            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition flex items-center gap-2 mx-auto"
                        >
                            <Download className="w-5 h-5" />
                            Download Result
                        </button>
                    </motion.div>
                ) : showGame ? (
                    // Playable Ad Container
                    <div className="w-full h-full relative">
                        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                            AD · Playable
                        </div>

                        {/* 실제 AdSense/AdMob 태그가 들어갈 곳. 여기서는 Mock Game Iframe */}
                        <iframe
                            src="https://snake.googlemaps.com"
                            className="w-full h-full border-none"
                            title="Playable Ad"
                        />

                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                            <span className="bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full text-sm">
                                잠시 게임을 즐겨보세요! 변환이 완료되면 알려드릴게요.
                            </span>
                        </div>
                    </div>
                ) : (
                    // Initial Loading State
                    <div className="text-center text-zinc-400 space-y-4">
                        <Zap className="w-12 h-12 animate-pulse mx-auto" />
                        <p>Connecting to Translation Engine...</p>
                    </div>
                )}
            </div>

        </div>
    );
}
