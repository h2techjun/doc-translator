'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const tiers = [
    {
        name: 'BRONZE',
        price: 'Free',
        description: 'Unlimited access powered by interactive ads.',
        points: 'Watch Ads, Earn Points',
        features: [
            'Premium AI Translation (Docx, Xlsx, Pptx)',
            'Format-preserving technology',
            'Earn 2P per ad interaction',
            'Community-driven support',
        ],
        icon: <Zap className="w-6 h-6 text-emerald-400" />,
        buttonText: 'Start Free with Ads',
        active: true,
        highlight: true,
    },
    {
        name: 'PRO (Coming Soon)',
        price: 'TBD',
        period: '/month',
        description: 'Ad-free experience with priority queue.',
        points: 'Monthly Quota System',
        features: [
            '100% Ad-Free experience',
            'Priority processing speed',
            'Advanced glossary control',
            'API integration support',
        ],
        icon: <Rocket className="w-6 h-6 text-blue-400" />,
        buttonText: 'Join Waitlist',
        active: false,
        highlight: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-24 px-6 relative overflow-hidden transition-colors duration-300">
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
                        CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">POWER TIER</span>
                    </motion.h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        Scale your global communication with our high-fidelity AI translation engine.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`relative h-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${tier.highlight ? 'ring-2 ring-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : ''}`}>
                                {tier.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                            {tier.icon}
                                        </div>
                                        <CardTitle className="text-xl font-bold tracking-widest">{tier.name}</CardTitle>
                                    </div>
                                    <div className="flex items-end gap-1 mt-4">
                                        <span className="text-4xl font-black">{tier.price}</span>
                                        {tier.period && <span className="text-slate-500 mb-1">{tier.period}</span>}
                                    </div>
                                    <CardDescription className="text-slate-400 mt-2">{tier.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <Zap className="w-3 h-3 fill-current" />
                                            Benefit: {tier.points}
                                        </p>
                                    </div>
                                    <ul className="space-y-3">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button
                                        className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${tier.highlight
                                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                            : 'bg-white text-black hover:bg-slate-200'
                                            }`}
                                    >
                                        {tier.buttonText}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureBox icon={<Globe />} title="Global Support" desc="Support for 20+ languages with culture-aware AI." />
                    <FeatureBox icon={<Shield />} title="Enterprise Security" desc="Bank-grade encryption for all your documents." />
                    <FeatureBox icon={<Rocket />} title="High Fidelity" desc="Preserves all formatting, charts, and diagrams." />
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
