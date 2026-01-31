import { createClient } from '@/lib/supabase/server';
import {
    TransactionType,
    UserProfileInfo,
    POINT_COSTS
} from './types';

/**
 * 🪙 PointManager (포인트 & 등급 관리 핵심 로직)
 * 
 * Why:
 * - 사용자 포인트의 차감, 충전, 등급 보너스를 중앙에서 관리합니다.
 * - `profiles` 테이블과 `point_transactions` 테이블을 동기화합니다.
 */
export class PointManager {

    /**
     * 사용자 프로필 정보 조회
     */
    static async getUserProfile(userId: string): Promise<UserProfileInfo> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('points, tier, total_translations')
            .eq('id', userId)
            .single();

        if (error || !data) {
            // 🚨 Fallback: 프로필이 없는 경우 기본값 반환
            console.warn(`[PointManager] Profile not found for ${userId}. Using defaults.`);
            return {
                userId,
                points: 0,
                tier: 'BRONZE',
                totalTranslations: 0
            };
        }

        return {
            userId,
            points: data.points || 0,
            tier: data.tier || 'BRONZE',
            totalTranslations: data.total_translations || 0
        };
    }

    /**
     * 포인트 차감 (번역 사용 등)
     */
    static async usePoints(
        userId: string,
        amount: number,
        description: string
    ): Promise<boolean> {
        const supabase = await createClient();
        const profile = await this.getUserProfile(userId);

        // 🌟 GOLD 또는 MASTER 등급은 무제한 전용 (포인트 차감 없음)
        if (profile.tier === 'GOLD' || profile.tier === 'MASTER') {
            // 횟수만 기록
            await supabase.from('profiles').update({
                total_translations: (profile.totalTranslations ?? 0) + 1
            }).eq('id', userId);

            await supabase.from('point_transactions').insert({
                user_id: userId,
                amount: 0,
                transaction_type: 'USAGE',
                description: `[UNLIMITED] ${description}`
            });
            return true;
        }

        if ((profile.points || 0) < amount) return false;

        // 1. 트랜잭션 기록
        const { error: txError } = await supabase
            .from('point_transactions')
            .insert({
                user_id: userId,
                amount: -amount,
                transaction_type: 'USAGE',
                description
            });

        if (txError) throw new Error(`트랜잭션 기록 실패: ${txError.message}`);

        // 2. 포인트 업데이트 및 번역 횟수 증가
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                points: (profile.points || 0) - amount,
                total_translations: (profile.totalTranslations || 0) + 1
            })
            .eq('id', userId);

        if (updateError) throw new Error("포인트 업데이트 실패");

        return true;
    }

    /**
     * 포인트 리워드 지급 (광고 시청 등)
     */
    static async rewardPoints(
        userId: string,
        amount: number,
        description: string
    ): Promise<void> {
        const supabase = await createClient();
        const profile = await this.getUserProfile(userId);

        // 1. 트랜잭션 기록
        await supabase
            .from('point_transactions')
            .insert({
                user_id: userId,
                amount: amount,
                transaction_type: 'REWARD',
                description
            });

        // 2. 포인트 업데이트
        await supabase
            .from('profiles')
            .update({ points: (profile.points ?? 0) + amount })
            .eq('id', userId);
    }
}
