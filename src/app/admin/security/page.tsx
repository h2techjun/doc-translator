
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Lock, Eye } from 'lucide-react';

export default function AdminSecurityPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
                Security Nexus
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                Audit logs, access control, and threat mitigation.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-rose-400">
                            <Lock className="w-5 h-5" />
                            Access Control (IP Ban)
                        </CardTitle>
                        <CardDescription>Blacklist management for malicious actors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500 font-mono text-sm">
                            FIREWALL MODULE LOADING...
                            <br />
                            (Available in V3.1)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-400">
                            <Eye className="w-5 h-5" />
                            Audit Logs
                        </CardTitle>
                        <CardDescription>Traceability of all administrative actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500 font-mono text-sm">
                            CONNECTING TO BLACKBOX...
                            <br />
                            (Available in V3.1)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
