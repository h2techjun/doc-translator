
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Ticket, TrendingUp } from 'lucide-react';

export default function AdminFinancePage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <DollarSign className="w-10 h-10 text-emerald-500" />
                Treasury & Finance
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                Manage revenue streams, transactions, and promotional assets.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <Ticket className="w-5 h-5" />
                            Coupon Manager
                        </CardTitle>
                        <CardDescription>Issue and revoke promotional codes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500 font-mono text-sm">
                            COUPON ENGINE INITIALIZING...
                            <br />
                            (Module under construction)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-cyan-400">
                            <TrendingUp className="w-5 h-5" />
                            Revenue Ledger
                        </CardTitle>
                        <CardDescription>Real-time transaction monitoring.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500 font-mono text-sm">
                            LEDGER SYNC PENDING...
                            <br />
                            (Module under construction)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
