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
                <div className="h-[90px] w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded flex items-center justify-center border border-dashed border-gray-700/50 hover:bg-gray-800/80 transition-colors cursor-pointer">
                    <span className="text-gray-500 text-xs font-mono">
                        [GOOGLE AD SENSE SLOT: 728x90]
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
