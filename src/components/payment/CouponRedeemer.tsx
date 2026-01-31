
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CouponRedeemer({ onRedeemSuccess }: { onRedeemSuccess?: () => void }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setLoading(true);

        try {
            const res = await fetch('/api/coupons/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`${data.points_added}P 적립 완료!`, {
                    description: '쿠폰이 성공적으로 등록되었습니다.'
                });
                setCode('');
                if (onRedeemSuccess) onRedeemSuccess();
            } else {
                toast.error('등록 실패', {
                    description: data.error
                });
            }
        } catch (e) {
            toast.error('시스템 오류', { description: '잠시 후 다시 시도해주세요.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Ticket className="w-5 h-5" />
                    <CardTitle className="text-base font-bold uppercase tracking-wider">Redeem Coupon</CardTitle>
                </div>
                <CardDescription className="text-xs text-indigo-200/60">
                    보유하신 프로모션 코드를 입력하고 포인트를 받으세요.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input
                        placeholder="ENTER-CODE-HERE"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="bg-black/20 border-white/10 font-mono text-sm placeholder:text-white/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleRedeem}
                        disabled={loading || !code.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[80px]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
