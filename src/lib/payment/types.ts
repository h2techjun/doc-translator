
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
    BASE_PAGES: 2,              // 기본 제공 페이지
    BASE_COST: 5,               // 기본 5포인트
    ADDITIONAL_PAGE_COST: 2,   // 3페이지부터 페이지당 2포인트
} as const;

// 포인트 충전 패키지
export const POINT_PACKAGES = [
    {
        id: 'starter_pack',
        points: 50,
        name: 'Starter Point Pack',
        desc: '가볍게 시작하는 50포인트',
        priceKRW: 3000,
        priceUSD: 5.00
    }
] as const;

// 사용자 포인트 정보 인터페이스
export interface UserProfileInfo {
    userId: string;
    balance?: number;           // CreditManager use
    subscriptionTier?: UserTier; // CreditManager use
    points?: number;            // PointManager use
    tier?: UserTier;            // PointManager use
    totalTranslations?: number;
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
