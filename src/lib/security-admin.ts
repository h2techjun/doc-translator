
/**
 * DocTranslation Admin Security Utility
 * 
 * 이 유틸리티는 DB(Profiles) 조회 실패나 RLS 지연 상황에서도 
 * 핵심 관리자(MASTER/ADMIN)의 접근성을 보장하기 위한 Resilience 로직을 제공합니다.
 */

export const KNOWN_ADMIN_EMAILS = [
    'h2techjun@gmail.com',      // MASTER
    'gagum80@hotmail.com',     // ADMIN
    'subadmin@doctranslation.co' // ADMIN
];

export interface AdminUser {
    id: string;
    email: string | null;
    role?: string | null;
}

/**
 * 사용자가 관리자인지 확인합니다.
 * DB 역할(role)이 없더라도 화이트리스트 이메일에 포함되어 있으면 관리자로 간주합니다.
 */
export function isAuthorizedAdmin(user: AdminUser): boolean {
    // 1. 역할 기반 체크 (가장 기본)
    if (user.role === 'ADMIN' || user.role === 'MASTER') {
        return true;
    }

    // 2. 이메일 기반 Fallback (보안 앵커)
    if (user.email && KNOWN_ADMIN_EMAILS.includes(user.email)) {
        console.log(`[Security] Admin white-list bypass granted for ${user.email}`);
        return true;
    }

    return false;
}

/**
 * MASTER 권한 여부를 확인합니다.
 */
export function isMasterAdmin(user: AdminUser): boolean {
    if (user.role === 'MASTER') return true;
    if (user.email === 'h2techjun@gmail.com') return true;
    return false;
}
