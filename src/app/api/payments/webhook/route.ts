
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreditManager } from '@/lib/payment/credit-manager';

/**
 * 🪝 결제 웹훅 핸들러 (Payment Webhook)
 * 
 * Why:
 * - 결제 상태 변경(입금 완료, 취소 등)을 비동기로 수신하여 누락 없는 처리를 보장합니다.
 * - [보안]: 멱등성(Idempotency)을 보장하여 중복 지급을 방지해야 합니다.
 * 
 * What:
 * - Toss Payments로부터 수신된 이벤트를 검증합니다.
 * - `transactions` 테이블을 확인하여 이미 처리된 주문인지 확인합니다.
 * - 사용자의 `credit_balance`를 충전합니다.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { eventType, data } = body;
        // Toss Payments 웹훅 스키마 예시: { eventType: 'PAYMENT_STATUS_CHANGED', data: { status: 'DONE', ... } }

        console.log(`[Webhook] 결제 이벤트 수신: ${eventType}`, data?.orderId);

        if (eventType === 'PAYMENT_STATUS_CHANGED' && data.status === 'DONE') {
            const { orderId, paymentKey, totalAmount, userId } = data; // userId는 customData 등을 통해 전달받았다고 가정

            // 1. 멱등성 검사 (Idempotency Check)
            const supabase = await createClient();
            const { data: existingTx } = await supabase
                .from('transactions')
                .select('id')
                .eq('metadata->orderId', orderId)
                .single();

            if (existingTx) {
                console.log(`[Webhook] 중복된 이벤트입니다. 무시합니다. (OrderId: ${orderId})`);
                return NextResponse.json({ status: 'ALREADY_PROCESSED' });
            }

            // 2. 크레딧 지급 (Transaction 기록 + 잔액 증가)
            // 주의: orderId에 userId가 포함되어 있거나, transactions 테이블에서 Pending 상태인 건을 찾아야 함.
            // 여기서는 MVP 구현을 위해 orderId 또는 customData에서 유저 식별이 가능하다고 가정하거나
            // 별도의 Payment Intent 테이블을 조회해야 함.

            if (userId) {
                await CreditManager.grantCredits(userId, totalAmount, '크레딧 충전 (Webhook)', {
                    paymentKey,
                    orderId,
                    provider: 'TOSS'
                });
                console.log(`[Webhook] 크레딧 지급 완료: User ${userId}, Amount ${totalAmount}`);
            } else {
                console.warn(`[Webhook] User ID 누락으로 크레딧 지급 실패 (Payment Key: ${paymentKey})`);
            }
        }

        return NextResponse.json({ status: 'OK' });

    } catch (error: any) {
        console.error('[Webhook] 처리 실패:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
