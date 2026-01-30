"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export const GameAd = () => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto my-4 p-4 rounded-xl bg-background/50 border border-border backdrop-blur-sm overflow-hidden"
        >
            <div className="text-[10px] text-muted-foreground mb-2 text-right tracking-widest uppercase opacity-50">
                Advertisement
            </div>
            {/* Real Google AdSense Unit */}
            <ins className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-8134930906845147"
                data-ad-slot="4477457432"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </motion.div>
    );
};
