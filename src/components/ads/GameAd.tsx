"use client";

import { motion } from "framer-motion";

export const GameAd = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto my-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-24 bg-black/40 rounded-lg border-2 border-dashed border-purple-400/20 flex items-center justify-center relative overflow-hidden group hover:border-purple-400/50 transition-colors cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="text-purple-200 font-mono text-sm tracking-wider">
                            🎮 PREMIUM GAME AD SPACE
                        </span>
                    </div>
                </div>
                <div className="ml-4 text-xs text-purple-300/50 font-mono rotate-90">
                    SPONSORED
                </div>
            </div>
        </motion.div>
    );
};
