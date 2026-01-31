
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGeoSmart } from '@/hooks/use-geo-smart';

export function CouponRedeemer({ onRedeemSuccess }: { onRedeemSuccess?: () => void }) {
    const { t } = useGeoSmart();
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
                toast.success(t.coupons.success.replace('{points}', data.points_added), {
                    description: t.coupons.successDesc
                });
                setCode('');
                if (onRedeemSuccess) onRedeemSuccess();
            } else {
                toast.error(t.coupons.failedTitle, {
                    description: data.error // API error messages should ideally be translated or use codes
                });
            }
        } catch (e) {
            toast.error(t.coupons.errorSystem, { description: t.coupons.errorSystemDesc });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Ticket className="w-5 h-5" />
                    <CardTitle className="text-base font-bold uppercase tracking-wider">{t.coupons.title}</CardTitle>
                </div>
                <CardDescription className="text-xs text-indigo-200/60">
                    {t.coupons.desc}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input
                        placeholder={t.coupons.placeholder}
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
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.coupons.button}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
