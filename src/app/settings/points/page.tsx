'use client';

import { useEffect, useState } from 'react';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, ArrowUpRight, ArrowDownLeft, History, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: string;
    amount: number;
    transaction_type: string;
    description: string;
    created_at: string;
}

export default function PointHistoryPage() {
    const { profile, refreshProfile } = useGeoSmart();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        refreshProfile(); // Ensure balance is up to date
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/user/transactions');
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const data = await res.json();
            setTransactions(data.transactions);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Coins className="w-8 h-8 text-amber-500" />
                포인트 관리
            </h1>
            <p className="text-muted-foreground mb-8">
                포인트 충전 내역과 사용 내역을 확인할 수 있습니다.
            </p>

            {/* 상단 요약 카드 */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            현재 보유 포인트
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-baseline gap-1">
                            {profile?.points?.toLocaleString() || 0}
                            <span className="text-sm font-normal text-muted-foreground">P</span>
                        </div>
                    </CardContent>
                </Card>
                
                {/* 추후 충전 기능 등이 추가될 공간 */}
                {/* 
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">이번 달 사용</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                    </CardContent>
                </Card> 
                */}
            </div>

            {/* 트랜잭션 리스트 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" />
                                최근 활동 내역
                            </CardTitle>
                            <CardDescription>최근 50건의 포인트 변동 내역입니다.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-red-500 py-4 justify-center">
                            <AlertCircle className="w-5 h-5" />
                            <span>내역을 불러오는데 실패했습니다. ({error})</span>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            아직 포인트 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full mt-1 ${
                                            tx.amount > 0 
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                                                : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                            {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm sm:text-base">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(tx.created_at), 'PPP a h:mm', { locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${
                                            tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount} P
                                        </div>
                                        <Badge variant="outline" className="text-[10px] mt-1 h-5 text-muted-foreground">
                                            {tx.transaction_type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
