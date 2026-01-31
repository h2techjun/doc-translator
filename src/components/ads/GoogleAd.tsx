"use client";

import { motion } from "framer-motion";

export const GoogleAd = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl mx-auto my-6"
        >
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="h-[90px] w-full bg-gradient-to-br from-gray-800/10 to-gray-900/10 dark:from-gray-800/50 dark:to-gray-900/50 rounded flex flex-col items-center justify-center border border-dashed border-gray-700/50 hover:bg-gray-800/20 transition-colors cursor-pointer gap-2">
                    <img src="/adsense_logo.jpg" alt="Google AdSense" className="h-6 object-contain opacity-30 grayscale" />
                    <span className="text-gray-500 text-[10px] font-mono tracking-tighter uppercase">
                        Google AdSense Slot
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
