'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

import { useState } from 'react';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { CouponRedeemer } from '@/components/payment/CouponRedeemer';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { POINT_COSTS } from "@/lib/payment/types";

// Fallback English Data (for languages missing pricingPage)
const FALLBACK_PRICING = {
    hero: { title: "CHOOSE YOUR", highlight: "POWER TIER", subtitle: "Scale your global communication with our high-fidelity AI translation engine." },
    tiers: {
        guest: { name: "GUEST", price: "Free", desc: "No login required", limit: "Limit: 2 Pages", button: "Try Guest Mode", features: ["Word/Excel/PPT Translation", "Max 2 pages per doc"] },
        bronze: { name: "BRONZE", price: "Free", desc: "Basic Membership", bonus: "SIGNUP BONUS: 50P", button: "Sign Up Free", features: ["Ads Enabled", "Community Support"] },
        silver: { name: "SILVER", priceKRW: "User", priceUSD: "$5.00", desc: "Get 50P & Upgrade", bonus: "INSTANT 50P", button: "Charge 50P", features: ["Verified Badge", "Faster Processing", "Ads Still Visible"] },
        gold: { name: "GOLD", price: "100k+", unit: "KRW", desc: "Cumulative Payment", vip: "VIP STATUS", button: "Automatic Upgrade", features: ["Highest Priority", "Direct Support Line", "Ads Support Us"] }
    },
    policy: {
        title: "Points & Operation Policy",
        pointTitle: "1. Point Policy",
        pointItems: [
            "Signup Reward: 50P is granted immediately upon sign up.",
            "Base Cost: {base}P per document (up to {basePages} pages).",
            "Extra Cost: {extra}P per page starting from page {nextPage}.",
            "Guest Mode: Translation limited to 2 pages for guests."
        ],
        adTitle: "2. Ad & Charge Policy",
        adItems: [
            "Free Charge: You can earn points by watching ads if you run out.",
            "Reward: Get 5P by clicking [Get 5 Points] on ads.",
            "Unlimited: During beta, ad rewards are unlimited.",
            "Service: Ad revenue supports server & AI engine costs."
        ],
        disclaimer: "* This policy may change during the beta period. Points are non-refundable."
    },
    features: {
        support: { title: "Global Support", desc: "Support for 20+ languages with culture-aware AI." },
        security: { title: "Enterprise Security", desc: "Bank-grade encryption for all your documents." },
        fidelity: { title: "High Fidelity", desc: "Preserves all formatting, charts, and diagrams." }
    }
};

export default function PricingPage() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const { currency, t, profile, user } = useGeoSmart();

    const isKRW = currency === 'KRW';
    // Fallback to English if translation is missing
    const pricing = (t as any).pricingPage || FALLBACK_PRICING;

    // Helper: Replace dynamic variables
    const replaceVars = (text: string) => {
        if (!text) return "";
        return text
            .replace('{base}', POINT_COSTS.BASE_COST.toString())
            .replace('{basePages}', POINT_COSTS.BASE_PAGES.toString())
            .replace('{nextPage}', (POINT_COSTS.BASE_PAGES + 1).toString())
            .replace('{extra}', POINT_COSTS.ADDITIONAL_PAGE_COST.toString());
    };

    // Helper: Simple bold formatter for "Key: Value" strings
    const renderPolicyItem = (text: string) => {
        const processedText = replaceVars(text);
        const parts = processedText.split(':');

        if (parts.length > 1 && !processedText.startsWith('•')) {
            // Case: Title: Desc -> Bold Title
            return (
                <span>
                    <b>{parts[0]}</b>:{parts.slice(1).join(':')}
                </span>
            );
        }
        return <span>{processedText}</span>;
    };

    const handlePurchase = (packageId: string) => {
        setSelectedPackageId(packageId);
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-24 px-6 relative overflow-hidden transition-colors duration-300">
            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                packageId={selectedPackageId}
            />
            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter"
                    >
                        {pricing.hero.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{pricing.hero.highlight}</span>
                    </motion.h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        {pricing.hero.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {/* GUEST */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                    >
                        <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Globe className="w-6 h-6 text-zinc-400" /></div>
                                    <CardTitle className="text-xl font-bold tracking-widest">{pricing.tiers.guest.name}</CardTitle>
                                </div>
                                <div className="flex items-end gap-1 mt-4"><span className="text-4xl font-black">{pricing.tiers.guest.price}</span></div>
                                <CardDescription className="text-slate-400 mt-2">{pricing.tiers.guest.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="py-2 px-3 bg-zinc-800 rounded-lg"><p className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 fill-current" />{pricing.tiers.guest.limit}</p></div>
                                <ul className="space-y-3">
                                    {pricing.tiers.guest.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{feature}</li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button asChild className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest ${!user ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-400 cursor-default'}`}>
                                    <Link href="/">{!user ? pricing.tiers.guest.button : 'Completed'}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* BRONZE */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Zap className="w-6 h-6 text-emerald-400" /></div>
                                    <CardTitle className="text-xl font-bold tracking-widest">{pricing.tiers.bronze.name}</CardTitle>
                                </div>
                                <div className="flex items-end gap-1 mt-4"><span className="text-4xl font-black">{pricing.tiers.bronze.price}</span></div>
                                <CardDescription className="text-slate-400 mt-2">{pricing.tiers.bronze.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 fill-current" />{pricing.tiers.bronze.bonus}</p></div>
                                <ul className="space-y-3">
                                    {pricing.tiers.bronze.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{feature}</li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button asChild className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest ${profile?.tier === 'BRONZE' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                    <Link href={user ? "#" : "/signup"}>{profile?.tier === 'BRONZE' ? 'Active Plan' : pricing.tiers.bronze.button}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* SILVER (Starter Pack) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="relative h-full border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] shadow-[0_0_30px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/30">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30"><Crown className="w-6 h-6 text-amber-500" /></div>
                                    <CardTitle className="text-xl font-bold tracking-widest text-amber-500">{pricing.tiers.silver.name}</CardTitle>
                                </div>
                                <div className="flex items-end gap-1 mt-4"><span className="text-4xl font-black">{isKRW ? pricing.tiers.silver.priceKRW : pricing.tiers.silver.priceUSD}</span></div>
                                <CardDescription className="text-amber-200/60 mt-2">{pricing.tiers.silver.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"><p className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 fill-current" />{pricing.tiers.silver.bonus}</p></div>
                                <ul className="space-y-3">
                                    {pricing.tiers.silver.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{feature}</li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    onClick={() => profile?.tier !== 'SILVER' && handlePurchase('starter_pack')}
                                    className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest ${profile?.tier === 'SILVER' ? 'bg-amber-500 text-black' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'}`}
                                >
                                    {profile?.tier === 'SILVER' ? 'Active Plan' : pricing.tiers.silver.button}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* GOLD (VIP) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className={`h-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${profile?.tier === 'GOLD' ? 'ring-2 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : ''}`}>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Shield className="w-6 h-6 text-blue-400" /></div>
                                    <CardTitle className="text-xl font-bold tracking-widest">{pricing.tiers.gold.name}</CardTitle>
                                </div>
                                <div className="flex items-end gap-1 mt-4"><span className="text-2xl font-black">{pricing.tiers.gold.price}</span><span className="text-xs text-slate-500 mb-1 ml-1">{pricing.tiers.gold.unit}</span></div>
                                <CardDescription className="text-slate-400 mt-2">{pricing.tiers.gold.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"><p className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Rocket className="w-3 h-3 fill-current" />{pricing.tiers.gold.vip}</p></div>
                                <ul className="space-y-3">
                                    {pricing.tiers.gold.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />{feature}</li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest cursor-default ${profile?.tier === 'GOLD' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>
                                    {profile?.tier === 'GOLD' ? 'Active Plan' : pricing.tiers.gold.button}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>

                {/* 🧧 Coupon Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-md mx-auto mb-20"
                >
                    <CouponRedeemer onRedeemSuccess={() => window.location.reload()} />
                </motion.div>

                {/* 📢 Policy Notice Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-10 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="w-8 h-8 text-blue-500" />
                        <h2 className="text-3xl font-black tracking-tight">{pricing.policy.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-zinc-300">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-current" />
                                {pricing.policy.pointTitle}
                            </h3>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                {pricing.policy.pointItems.map((item: string, i: number) => (
                                    <li key={i}>• {renderPolicyItem(item)}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Rocket className="w-5 h-5 text-emerald-500" />
                                {pricing.policy.adTitle}
                            </h3>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                {pricing.policy.adItems.map((item: string, i: number) => (
                                    <li key={i}>• {renderPolicyItem(item)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
                        <p className="text-zinc-500 text-xs italic">
                            {pricing.policy.disclaimer}
                        </p>
                    </div>
                </motion.div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureBox icon={<Globe />} title={pricing.features.support.title} desc={pricing.features.support.desc} />
                    <FeatureBox icon={<Shield />} title={pricing.features.security.title} desc={pricing.features.security.desc} />
                    <FeatureBox icon={<Rocket />} title={pricing.features.fidelity.title} desc={pricing.features.fidelity.desc} />
                </div>
            </div>

        </div>
    );
}

function FeatureBox({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                {icon}
            </div>
            <div>
                <h4 className="font-bold">{title}</h4>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
        </div>
    );
}
