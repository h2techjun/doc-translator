
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign, Ticket, TrendingUp, Plus, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFinancePage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Coupon State
    const [newCode, setNewCode] = useState('');
    const [discountType, setDiscountType] = useState('FIXED');
    const [discountValue, setDiscountValue] = useState(0);
    const [usageLimit, setUsageLimit] = useState(100);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) setCoupons(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const createCoupon = async () => {
        if (!newCode || discountValue <= 0) {
            toast.error('Please check your inputs');
            return;
        }

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCode,
                    discount_type: discountType,
                    discount_value: discountValue,
                    usage_limit: usageLimit,
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days default
                })
            });

            if (res.ok) {
                toast.success('Coupon Created');
                setIsCreating(false);
                setNewCode('');
                fetchCoupons();
            } else {
                toast.error('Creation failed');
            }
        } catch (e) {
            toast.error('System error');
        }
    };

    const deleteCoupon = async (code: string) => {
        if (!confirm('Revoke this coupon?')) return;
        try {
            await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
            toast.success('Coupon Revoked');
            fetchCoupons();
        } catch (e) {
            toast.error('Deletion failed');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <DollarSign className="w-10 h-10 text-emerald-500" />
                Treasury & Finance
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                Manage revenue streams, transactions, and promotional assets.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Coupon Manager */}
                <Card className="lg:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-emerald-400">
                                <Ticket className="w-5 h-5" />
                                Coupon Manager
                            </CardTitle>
                            <CardDescription>Issue and revoke promotional codes.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
                            {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Issue New</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isCreating && (
                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Code</Label>
                                        <Input placeholder="SUMMER_SALE" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="font-mono uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Discount Type</Label>
                                        <Select onValueChange={setDiscountType} defaultValue={discountType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">Points (Fixed Amount)</SelectItem>
                                                <SelectItem value="PERCENT">Percent (%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Value</Label>
                                        <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Limit</Label>
                                        <Input type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} />
                                    </div>
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={createCoupon}>Issue Coupon</Button>
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.map((coupon) => (
                                    <TableRow key={coupon.code}>
                                        <TableCell className="font-mono font-bold text-emerald-400">{coupon.code}</TableCell>
                                        <TableCell>
                                            {coupon.discount_type === 'FIXED' ? `${coupon.discount_value} P` : `${coupon.discount_value}% OFF`}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.used_count} / {coupon.usage_limit}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : 'No Expiry'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    toast.success('Copied to clipboard');
                                                }}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteCoupon(coupon.code)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. Revenue Ledger Placeholder */}
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-cyan-400">
                            <TrendingUp className="w-5 h-5" />
                            Revenue Statistics
                        </CardTitle>
                        <CardDescription>Estimated earnings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-muted-foreground">Today</span>
                                <span className="text-2xl font-black text-white">$124.50</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-muted-foreground">This Month</span>
                                <span className="text-2xl font-black text-emerald-400">$3,492.00</span>
                            </div>
                            <div className="h-32 flex items-end justify-between gap-1 mt-6">
                                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                    <div key={i} className="bg-cyan-500/20 w-full rounded-t hover:bg-cyan-500/50 transition-all" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
