'use client';

import { motion } from 'framer-motion';
import { Zap, Gamepad2, Download, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GamifiedLoadingProps {
    t: {
        uploading: { title: string; desc: string };
        processing: { title: string; desc: string };
        completed: { title: string; desc: string };
        failed: { title: string; desc: string };
        success: { title: string; desc: string };
        download: string;
    };
    progress: number; // 0 ~ 100
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    errorMessage?: string; // Optional error message
    onDownload?: () => void;
}

export function GamifiedLoading({ t, progress, status, errorMessage, onDownload }: GamifiedLoadingProps) {
    const [showGame, setShowGame] = useState(false);

    useEffect(() => {
        // 로딩이 20% 넘어가면 게임 패널 활성화 (너무 빠르면 정신없으므로)
        if (progress > 10 && status === 'processing') {
            setShowGame(true);
        }
    }, [progress, status]);

    return (
        <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col justify-center p-8 lg:p-12 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/50">

                {/* Status Header */}
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {status === 'uploading' && t.uploading.title}
                        {status === 'processing' && t.processing.title}
                        {status === 'completed' && t.completed.title}
                        {status === 'failed' && t.failed.title}
                    </h2>
                    <p className="text-muted-foreground">
                        {status === 'uploading' && t.uploading.desc}
                        {status === 'processing' && t.processing.desc}
                        {status === 'completed' && t.completed.desc}
                        {status === 'failed' && t.failed.desc}
                    </p>
                </div>

                {/* Progress Bar or Result */}
                {status === 'completed' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-green-800 dark:text-green-300">{t.success.title}</p>
                                <p className="text-sm text-green-700 dark:text-green-400">{t.success.desc}</p>
                            </div>
                        </div>

                        <button
                            onClick={onDownload}
                            className="w-full py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Download className="w-5 h-5" />
                            {t.download}
                        </button>
                    </div>
                ) : status === 'failed' ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400">
                        <p className="font-bold mb-1">{t.failed.title}</p>
                        <p className="text-sm break-all">{errorMessage || "Unknown error occurred."}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Progress</span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Tip or Quote */}
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm text-muted-foreground flex items-start gap-3">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p>
                                Using <strong>Gemini 2.0 Flash</strong> for lightning fast speed.
                                Large files might take a moment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
