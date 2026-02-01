
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
            toast.error('입력 정보를 확인해주세요');
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
                toast.success('쿠폰이 생성되었습니다');
                setIsCreating(false);
                setNewCode('');
                fetchCoupons();
            } else {
                toast.error('생성 실패');
            }
        } catch (e) {
            toast.error('시스템 오류');
        }
    };

    const deleteCoupon = async (code: string) => {
        if (!confirm('이 쿠폰을 폐기하시겠습니까?')) return;
        try {
            await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
            toast.success('쿠폰이 폐기되었습니다');
            fetchCoupons();
        } catch (e) {
            toast.error('폐기 실패');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <DollarSign className="w-10 h-10 text-emerald-500" />
                자금 및 재무 (Treasury & Finance)
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                수익 흐름, 거래 내역 및 프로모션 자산을 관리합니다.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Coupon Manager */}
                <Card className="lg:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-emerald-400">
                                <Ticket className="w-5 h-5" />
                                쿠폰 관리자 (Coupon Manager)
                            </CardTitle>
                            <CardDescription>프로모션 코드를 발급하거나 폐기합니다.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
                            {isCreating ? '취소' : <><Plus className="w-4 h-4 mr-2" /> 새 쿠폰 발급</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isCreating && (
                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>코드명</Label>
                                        <Input placeholder="SUMMER_SALE" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="font-mono uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>할인 유형</Label>
                                        <Select onValueChange={setDiscountType} defaultValue={discountType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">포인트 (고정액)</SelectItem>
                                                <SelectItem value="PERCENT">퍼센트 (%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>값</Label>
                                        <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>사용 제한</Label>
                                        <Input type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} />
                                    </div>
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={createCoupon}>쿠폰 발급</Button>
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>코드</TableHead>
                                    <TableHead>혜택</TableHead>
                                    <TableHead>사용량</TableHead>
                                    <TableHead>만료일</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
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
                                            {coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : '무제한'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    toast.success('클립보드에 복사됨');
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
                            수익 통계 (Revenue)
                        </CardTitle>
                        <CardDescription>예상 수익 현황입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-muted-foreground">오늘</span>
                                <span className="text-2xl font-black text-white">$124.50</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-muted-foreground">이번 달</span>
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
