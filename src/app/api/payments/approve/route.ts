
import { NextRequest, NextResponse } from 'next/server';
import { TossPaymentsClient } from '@/lib/payment/toss-client';
import { CreditManager } from '@/lib/payment/credit-manager';

import { createClient } from '@/lib/supabase/server';

/**
 * 💳 결제 승인 API (Payment Approve)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { paymentKey, orderId, amount } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }

        const tossClient = new TossPaymentsClient();

        // 1. Toss에 결제 승인 요청
        const paymentData = await tossClient.confirmPayment(paymentKey, orderId, amount);

        // 2. 크레딧 지급 (성공 시)
        // paymentData.status === 'DONE' 확인
        await CreditManager.grantCredits(user.id, amount, '크레딧 충전', {
            paymentKey,
            orderId,
            provider: 'TOSS'
        });

        return NextResponse.json({ success: true, data: paymentData });

    } catch (error: any) {
        console.error('결제 승인 오류:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
