
import { NextRequest, NextResponse } from 'next/server';
import { TossPaymentsClient } from '@/lib/payment/toss-client';
import { CreditManager } from '@/lib/payment/credit-manager';

/**
 * 💳 결제 승인 API (Payment Approve)
 * 
 * Why:
 * - 프론트엔드 Toss 결제창(Widget)에서 '성공' 시 호출되는 리다이렉트/콜백 URL이 아닙니다.
 * - 클라이언트가 `paymentKey`, `orderId`, `amount`를 받아 이 서버 API로 전달하면,
 * - 서버가 Toss API에 '승인 요청'을 보내 최종 결제를 확정합니다.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { paymentKey, orderId, amount, userId } = body; // userId는 세션에서 가져오는 것이 안전

        const tossClient = new TossPaymentsClient();

        // 1. Toss에 결제 승인 요청
        const paymentData = await tossClient.confirmPayment(paymentKey, orderId, amount);

        // 2. 크레딧 지급 (성공 시)
        // paymentData.status === 'DONE' 확인
        // TODO: 실제 userId 매핑 필요
        // 임시: body로 받은 userId 신뢰 (보안 취약점 - 추후 Auth 연동 시 수정)
        if (userId) {
            await CreditManager.grantCredits(userId, amount, '크레딧 충전', {
                paymentKey,
                orderId,
                provider: 'TOSS'
            });
        }

        return NextResponse.json({ success: true, data: paymentData });

    } catch (error: any) {
        console.error('결제 승인 오류:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
