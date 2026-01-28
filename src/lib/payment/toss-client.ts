
/**
 * 💳 Toss Payments 클라이언트 래퍼 (Scaffolding)
 * 
 * Why:
 * - 결제 생성, 승인, 취소 요청을 중앙에서 관리합니다.
 * - 시크릿 키 노출을 방지하고 타입 안정성을 확보합니다.
 */

export class TossPaymentsClient {
    private secretKey: string;
    private baseUrl = 'https://api.tosspayments.com/v1';

    constructor() {
        this.secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('⚠️ TOSS_PAYMENTS_SECRET_KEY가 설정되지 않았습니다.');
        }
    }

    private getHeaders() {
        return {
            Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * 결제 승인 요청 (Payment Confirm)
     * 클라이언트에서 인증 완료 후 서버로 전달된 paymentKey, orderId, amount를 검증하고 최종 승인합니다.
     */
    async confirmPayment(paymentKey: string, orderId: string, amount: number) {
        console.log(`[Toss] 결제 승인 요청: ${orderId}, ${amount}원`);

        try {
            const response = await fetch(`${this.baseUrl}/payments/confirm`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ paymentKey, orderId, amount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[Toss] 승인 실패:', errorData);
                throw new Error(errorData.message || '결제 승인 실패');
            }

            return await response.json();
        } catch (error: any) {
            console.error('[Toss] API 호출 중 오류:', error);
            throw error;
        }
    }

    /**
     * 결제 취소 (Payment Cancel)
     */
    async cancelPayment(paymentKey: string, cancelReason: string) {
        console.log(`[Toss] 결제 취소 요청: ${paymentKey}, 사유: ${cancelReason}`);
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentKey}/cancel`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ cancelReason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '결제 취소 실패');
            }
            return await response.json();
        } catch (error: any) {
            console.error('[Toss] 취소 API 오류:', error);
            throw error;
        }
    }
}
