
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ShieldAlert, Lock, Eye, XOctagon, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSecurityPage() {
    const [blacklist, setBlacklist] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Ban State
    const [newIp, setNewIp] = useState('');
    const [banReason, setBanReason] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                fetch('/api/admin/blacklist'),
                fetch('/api/admin/audit')
            ]);

            if (res1.ok) setBlacklist(await res1.json());
            if (res2.ok) setAuditLogs(await res2.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const banIp = async () => {
        if (!newIp) return toast.error('IP Address required');

        try {
            const res = await fetch('/api/admin/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip_address: newIp, reason: banReason || 'Manual Ban' })
            });

            if (res.ok) {
                toast.success(`IP ${newIp} Banned`);
                setNewIp('');
                setBanReason('');
                fetchData();
            } else {
                toast.error('Failed to ban IP');
            }
        } catch (e) {
            toast.error('Error banning IP');
        }
    };

    const unbanIp = async (ip: string) => {
        if (!confirm(`Unban ${ip}?`)) return;
        try {
            await fetch(`/api/admin/blacklist?ip=${ip}`, { method: 'DELETE' });
            toast.success('IP Unbanned');
            fetchData();
        } catch (e) {
            toast.error('Failed to unban');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
                Security Nexus
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                Audit logs, access control, and threat mitigation.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. IP Blacklist Manager */}
                <Card className="bg-red-950/20 border-red-900/30 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-rose-400">
                            <Lock className="w-5 h-5" />
                            Access Control (IP Ban)
                        </CardTitle>
                        <CardDescription>Blacklist IP addresses to prevent access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-6">
                            <Input placeholder="192.168.1.1" value={newIp} onChange={e => setNewIp(e.target.value)} className="bg-black/20 font-mono" />
                            <Input placeholder="Reason (Optional)" value={banReason} onChange={e => setBanReason(e.target.value)} className="bg-black/20" />
                            <Button onClick={banIp} variant="destructive">
                                <Ban className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {blacklist.length === 0 && <p className="text-center text-muted-foreground text-sm italic">No active bans.</p>}
                            {blacklist.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div>
                                        <p className="font-mono font-bold text-rose-200">{item.ip_address}</p>
                                        <p className="text-[10px] text-rose-400/70">{item.reason}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-rose-400 hover:text-rose-200 hover:bg-rose-500/20" onClick={() => unbanIp(item.ip_address)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Audit Logs */}
                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-400">
                            <Eye className="w-5 h-5" />
                            Audit Trail
                        </CardTitle>
                        <CardDescription>Recent administrative actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Action</TableHead>
                                        <TableHead className="text-slate-400">Resource</TableHead>
                                        <TableHead className="text-right text-slate-400">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.map((log) => (
                                        <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-200">
                                                <Badge variant="outline" className="border-slate-700 text-xs">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-400">
                                                {log.target_resource}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">
                                                {format(new Date(log.timestamp), 'MM-dd HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
