# 👑 Phase 3: 회원 등급 시스템 개편 계획 (User Tiers)

> **목표**: 6단계 등급 시스템을 도입하고, 결제 내역을 기반으로 기존 사용자에게 소급 적용합니다.

## 📊 등급 정의 (Tier Definitions)

| 등급 (Tier)          | 조건 (Condition)                                         | 혜택 (Benefits)              |
| :------------------- | :------------------------------------------------------- | :--------------------------- |
| **게스트 (GUEST)**   | 비회원 (계정 없음)                                       | 2페이지 제한                 |
| **브론즈 (BRONZE)**  | 회원가입 (기본)                                          | 가입 축하 포인트 (50-100P)   |
| **실버 (SILVER)**    | 1회 이상 충전 (금액 무관)                                | 인증 배지 부여               |
| **골드 (GOLD)**      | 누적 결제액 100만원 이상<br>(해외: 약 $1,500 ~ 2배 적용) | VIP 지원, 최우선 처리        |
| **다이아 (DIAMOND)** | 역할 = `ADMIN`                                           | 부 관리자 권한               |
| **마스터 (MASTER)**  | 역할 = `MASTER`                                          | 총 관리자 권한 (시스템 제어) |

## 📋 체크리스트

### 1. 데이터베이스 스키마

- [x] **마이그레이션**: `supabase/migrations/20260204_user_tiers.sql`
  - `profiles` 테이블 수정:
    - `tier` ENUM 추가: `(GUEST, BRONZE, SILVER, GOLD, DIAMOND, MASTER)`
    - `total_payment_amount` (numeric, default 0) 컬럼 추가
  - `payment_history` 테이블 생성 (결제 트랜잭션 추적용)

### 2. 백엔드 로직 (Edge Functions / Triggers)

- [x] **트리거 (Trigger)**: `on_payment_complete`
  - 결제 완료 시 `total_payment_amount` 업데이트
  - 등급 재산정 로직 실행:
    - `ADMIN/MASTER`는 변경 없음
    - `total_payment_amount >= 1,000,000` (또는 해당 통화 기준) -> `GOLD`
    - `total_payment_amount > 0` -> `SILVER`
    - 그 외 -> `BRONZE`
- [x] **소급 적용 스크립트 (Retroactive Script)**:
  - 기존 `payments` 테이블의 합계를 계산하여 `profiles.total_payment_amount` 업데이트 및 등급 일괄 적용 SQL 작성

### 3. 프론트엔드 & UI

- [x] `types/supabase.ts`에 새로운 ENUM 반영 (마이그레이션 파일 기반)
- [x] `Badge` 컴포넌트 업데이트 (골드/실버 색상 적용)
- [x] `Profile` 페이지 업데이트: 다음 등급까지 남은 금액 표시 (예: "골드까지 50,000원 남음")

## 🧪 검증 (Verification)

- [ ] 1,000원 결제 시뮬레이션 -> **실버** 등급 상승 확인
- [ ] 1,000,000원 결제 시뮬레이션 -> **골드** 등급 상승 확인
- [ ] 기존 사용자들이 올바른 등급으로 마이그레이션 되었는지 확인
