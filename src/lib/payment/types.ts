
/**
 * 💰 포인트 시스템 타입 정의 (Point System Types)
 * 
 * Why:
 * - 결제 및 포인트 차감 로직에서 사용할 데이터 구조를 정의합니다.
 */

// 사용자 등급 (Tier)
export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER';

// 트랜잭션 유형
export type TransactionType = 'CHARGE' | 'USAGE' | 'REWARD' | 'REFUND';

// 트랜잭션 상태
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// 포인트 비용 정의
export const POINT_COSTS = {
    TRANSLATION_BASE: 5,        // 번역당 기본 5포인트
    TRANSLATION_EXTRA: 1,      // 대용량 추가 포인트
} as const;

// 사용자 포인트 정보 인터페이스
export interface UserProfileInfo {
    userId: string;
    points: number;
    tier: UserTier;
    totalTranslations: number;
}

// 트랜잭션 레코드 인터페이스
export interface PointTransactionRecord {
    id: string;
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    status: TransactionStatus;
    createdAt: Date;
    metadata?: Record<string, any>;
}
