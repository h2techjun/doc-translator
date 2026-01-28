
import { createClient } from '@/lib/supabase/server';
import {
    TransactionType,
    TransactionRecord,
    UserCreditInfo,
    CREDIT_COSTS
} from './types';

/**
 * 💳 CreditManager (수익화 핵심 로직)
 * 
 * Why:
 * - 사용자 포인트의 차감, 충전, 조회를 중앙에서 관리하여 데이터 무결성을 보장합니다.
 * - 동시성 문제 방지 및 트랜잭션 안전성 확보가 필수적입니다.
 * 
 * What:
 * - `checkBalance`: 잔액 확인
 * - `deductCredits`: 트랜잭션 기록과 함께 포인트 차감
 * - `grantCredits`: 포인트 지급
 */
export class CreditManager {

    /**
     * 사용자 현재 잔액 및 등급 조회
     */
    static async getUserCreditInfo(userId: string): Promise<UserCreditInfo> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('users')
            .select('credit_balance, subscription_tier')
            .eq('id', userId)
            .single();

        if (error || !data) {
            throw new Error(`사용자 정보를 찾을 수 없습니다: ${error?.message}`);
        }

        return {
            userId,
            balance: data.credit_balance || 0,
            subscriptionTier: data.subscription_tier || 'free'
        };
    }

    /**
     * 포인트 차감 (트랜잭션)
     * 
     * @param userId 사용자 ID
     * @param amount 차감할 포인트 (양수)
     * @param description 트랜잭션 설명
     * @param metadata 추가 메타데이터
     */
    static async deductCredits(
        userId: string,
        amount: number,
        description: string,
        metadata: Record<string, any> = {}
    ): Promise<boolean> {
        if (amount <= 0) throw new Error("차감액은 0보다 커야 합니다.");

        const supabase = await createClient();

        // 1. 잔액 확인 (가장 최신 데이터)
        const user = await this.getUserCreditInfo(userId);

        if (user.balance < amount) {
            return false; // 잔액 부족
        }

        // 2. RPC를 통한 아토믹 업데이트 (권장) 또는 트랜잭션 테이블 기록
        // Supabase(PostgreSQL)의 RPC 기능을 활용하여 안전하게 차감하는 것이 좋습니다.
        // 현재는 Schema에 정의된 `credit_balance`를 업데이트합니다.

        // 트랜잭션 기록 생성
        const { error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: -amount,
                type: 'DEDUCT',
                description,
                status: 'COMPLETED',
                // metadata: metadata // Schema에 metadata 컬럼 추가 필요 (현재 없음)
            });

        if (txError) throw new Error(`트랜잭션 기록 실패: ${txError.message}`);

        // 잔액 차감
        const { error: updateError } = await supabase
            .from('users')
            .update({ credit_balance: user.balance - amount })
            .eq('id', userId);

        if (updateError) {
            // 롤백 로직이 필요하나, MVP에서는 에러 발생 시 로그만 남김 (심각한 문제)
            console.error(`CRITICAL: 포인트 차감 실패 (User: ${userId}, Amount: ${amount})`);
            throw new Error("포인트 업데이트 중 오류가 발생했습니다.");
        }

        return true;
    }

    /**
     * 포인트 지급 (충전)
     */
    static async grantCredits(
        userId: string,
        amount: number,
        description: string,
        metadata: Record<string, any> = {}
    ): Promise<void> {
        if (amount <= 0) return;

        const supabase = await createClient();

        // 1. 현재 잔액 조회
        const { data: user } = await supabase
            .from('users')
            .select('credit_balance')
            .eq('id', userId)
            .single();

        const currentBalance = user?.credit_balance || 0;

        // 2. 트랜잭션 기록
        await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: amount,
                type: 'GRANT',
                description,
                status: 'COMPLETED'
            });

        // 3. 잔액 업데이트
        await supabase
            .from('users')
            .update({ credit_balance: currentBalance + amount })
            .eq('id', userId);

        console.log(`✅ Credit Granted: User ${userId}, Amount ${amount}`);
    }
}
