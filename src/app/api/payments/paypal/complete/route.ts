
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { POINT_PACKAGES } from '@/lib/payment/types';

export async function POST(req: NextRequest) {
    try {
        const { orderId, packageId, userId } = await req.json();
        const supabase = await createClient();

        // 1. 유효성 검사
        if (!orderId || !packageId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const selectedPackage = POINT_PACKAGES.find(p => p.id === packageId);
        if (!selectedPackage) {
            return NextResponse.json({ error: 'Invalid Package ID' }, { status: 400 });
        }

        // 2. (옵션) PayPal API로 OrderID 검증 로직 추가 가능
        // 실제 프로덕션에서는 PayPal Access Token을 발급받아 Order Details를 조회하여
        // status가 'COMPLETED'인지, 금액이 맞는지 확인해야 함.
        // 여기서는 MVP를 위해 클라이언트를 신뢰하고 진행하지만, 보안상 취약할 수 있음.

        // 3. 트랜잭션 기록 (CHARGE)
        const { error: txError } = await supabase.from('point_transactions').insert({
            user_id: userId,
            amount: selectedPackage.points,
            transaction_type: 'CHARGE',
            description: `PayPal Payment: ${selectedPackage.name} (${orderId})`,
            metadata: {
                provider: 'paypal',
                orderId,
                packageId,
                price: selectedPackage.price,
                currency: selectedPackage.currency
            }
        });

        if (txError) {
            console.error('Transaction Error:', txError);
            return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
        }

        // 4. 프로필 포인트 및 등급 업데이트
        // 현재 정보 조회
        const { data: profile } = await supabase
            .from('profiles')
            .select('points, tier, total_payment_amount')
            .eq('id', userId)
            .single();

        const currentPoints = profile?.points || 0;
        const currentTier = profile?.tier || 'BRONZE';
        const currentTotal = profile?.total_payment_amount || 0;
        const paymentAmount = selectedPackage.price; // KRW
        const newTotal = currentTotal + paymentAmount;

        // 등급 계산 로직 (MASTER는 유지)
        let newTier = currentTier;
        if (currentTier !== 'MASTER') {
            if (newTotal >= 100000) {
                newTier = 'GOLD';
            } else if (newTotal > 0 && currentTier === 'BRONZE') {
                newTier = 'SILVER';
            }
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                points: currentPoints + selectedPackage.points,
                total_payment_amount: newTotal,
                tier: newTier,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Profile Update Error:', updateError);
            return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            points: selectedPackage.points,
            tier: newTier,
            upgraded: newTier !== currentTier
        });

    } catch (error: any) {
        console.error('Payment Handler Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
