'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const tiers = [
    {
        name: 'GUEST',
        price: 'Free',
        description: 'No login required. Experience the power of AI translation instantly.',
        points: '2 Pages Limit',
        features: [
            'Word/Excel/PPT Translation',
            'Format-preserving technology',
            'Max 2 pages per document',
            'No download history saved',
        ],
        icon: <Globe className="w-6 h-6 text-zinc-400" />,
        buttonText: 'Try Guest Mode',
        active: true,
        highlight: false,
    },
    {
        name: 'BRONZE / SILVER',
        price: 'Free+',
        description: 'Unlimited access powered by interactive ads.',
        points: 'Watch Ads, Earn 5P',
        features: [
            'Premium AI Translation (Docx, Xlsx, Pptx)',
            'Format-preserving technology',
            'Earn 5P per ad interaction',
            'Community-driven support',
        ],
        icon: <Zap className="w-6 h-6 text-emerald-400" />,
        buttonText: 'Start Free with Ads',
        active: true,
        highlight: true,
    },
    {
        name: 'GOLD (Pro)',
        price: 'BETA',
        period: '/waitlist',
        description: 'Ad-free experience with priority queue.',
        points: 'Unlimited Quota',
        features: [
            '100% Ad-Free experience',
            'Priority processing speed',
            'Advanced glossary control',
            'Unlimited page counts',
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
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
                                        asChild
                                        className={`w-full py-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${tier.highlight
                                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                            : 'bg-white text-black hover:bg-slate-200'
                                            }`}
                                    >
                                        <Link href="/">{tier.buttonText}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* 📢 Policy Notice Section (Korean Content) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-10 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="w-8 h-8 text-blue-500" />
                        <h2 className="text-3xl font-black tracking-tight">[공지] 포인트 및 운영 정책 안내</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-zinc-300">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-current" />
                                1. 포인트 정책 (Point Policy)
                            </h3>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                <li>• <b>신규 가입 리워드</b>: 최초 회원가입 시 <b>10P</b>가 즉시 지급됩니다.</li>
                                <li>• <b>기본 번역 비용</b>: 문서당 <b>5P</b>가 기본으로 소모됩니다 (2페이지 이내).</li>
                                <li>• <b>추가 과금</b>: 3페이지부터는 페이지당 <b>2P</b>씩 추가 포인트가 필요합니다.</li>
                                <li>• <b>게스트 모드</b>: 비회원은 2페이지까지만 무료 번역이 가능합니다.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Rocket className="w-5 h-5 text-emerald-500" />
                                2. 광고 및 충전 정책 (Ad Policy)
                            </h3>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                <li>• <b>무료 충전</b>: 포인트가 부족한 경우 광고 시청을 통해 충전이 가능합니다.</li>
                                <li>• <b>리워드 지급</b>: 광고 영역의 [5 포인트 받기] 클릭 시 <b>5P</b>가 지급됩니다.</li>
                                <li>• <b>충전 횟수</b>: 베타 기간 동안 광고 시청 리워드는 횟수 제한 없이 제공됩니다.</li>
                                <li>• <b>서비스 유지</b>: 광고 수익은 서버 유지 및 AI 엔진 이용료로 사용됩니다.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
                        <p className="text-zinc-500 text-xs italic">
                            * 본 정책은 베타 서비스 기간 동안 수시로 변경될 수 있으며, 포인트의 현금 환불은 불가능합니다.
                        </p>
                    </div>
                </motion.div>

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
