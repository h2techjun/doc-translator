# 📄 Implementation Plan: 회원 등급 시스템 고도화 및 보안 강화

이 계획서는 발견된 데이터 불일치, UI 미비, 보안 취약점을 해결하기 위한 종합적인 개선 방안을 담고 있습니다.

## 📢 에이전트 할당표 (Agent Allocation)

- **🏗️ @Architect**: DB 데이터 정규화 및 제약 조건 재설계
- **🛡️ @Guardian**: RLS(Row-Level Security) 보안 정책 강화 (개인정보 보호)
- **🔨 @Builder**: 관리자 페이지 UI 보완 및 등급별 로직 동기화
- **👮 @Reviewer**: 코드 품질 및 보안 준수 여부 최종 감사

## 🎯 작업 목표

1. **데이터 정규화**: `tier` 값을 대문자(`BRONZE`, `SILVER`, 등)로 통일하고 DB 제약 조건을 이를 준수하도록 복구.
2. **보안 강화**: `profiles` 테이블의 RLS 정책을 수정하여 타인 정보 노출 원천 차단.
3. **관리자 UI 완성**: 모든 등급 선택 가능하도록 수정 및 일관된 등급 뱃지 스타일 적용.

---

## 📋 세부 단계별 계획 (Execution Steps)

### Phase 1: Database & Security (@Architect, @Guardian)

- [x] **DB 마이그레이션 파일 작성**:
  - [x] `tier` 값을 모두 대문자로 업데이트 (`Bronze` -> `BRONZE`).
  - [x] `profiles_tier_check` 제약 조건 복구 (`BRONZE`, `SILVER`, `GOLD`, `DIAMOND`, `MASTER` 구성).
  - [x] RLS 정책 수정: `FOR SELECT` 정책을 `auth.uid() = id OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER')))` 로 변경.

### Phase 2: UI & UX Refinement (@Builder, @Designer)

- [x] **Admin Users Page 수정** (`src/app/admin/users/page.tsx`):
  - [x] 사용자 수정 다이얼로그의 등급 선택지에 `DIAMOND`, `MASTER` 추가.
  - [x] 관리자 목록의 등급 뱃지에 `UserMenu`와 동일한 프리미엄 색상 스타일 적용.
  - [x] `User` 타입 정의에 누락된 티어 추가.
- [x] **Dashboard Page 수정** (`src/app/dashboard/page.tsx`):
  - [x] `DIAMOND`, `MASTER` 등급 뱃지 스타일 적용.
  - [x] MASTER 권한자 대시보드 접근성 개선.

### Phase 3: Verification (@Reviewer, @Tester)

- [ ] **동작 검증**:
  - [ ] 관리자 계정으로 등급 변경 시 즉시 UI 반영 확인.
  - [ ] 일반 계정으로 API 직접 호출 시 타인 정보 접근 차단 여부 확인 (Postman/Curl 테스트 시뮬레이션).

---

## ⚠️ 주의 사항 및 위험 관리

- **가용성**: DB 제약 조건 변경 시 기존에 잘못 들어간 데이터(소문자 등)가 있으면 실패하므로, 반드시 `UPDATE`를 먼저 수행한 후 제약 조건을 추가합니다.
- **보안**: RLS 정책 변경 중 실수로 관리자의 접근권한까지 막히지 않도록 정책 순서를 관리합니다.

---

**사용자님, 이 계획에 따라 작업을 시작할까요? [승인] 후 즉시 실행하겠습니다.**
