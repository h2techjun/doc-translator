# 🏗️ DocTranslation 마스터 플랜 (Supreme Master Plan)

> **상태**: 🔄 재계획 및 동기화 중
> **목표**: 회원 등급 시스템 개편, 레거시 코드 제거(쪽지), 보안 및 세션 관리 강화

## 🗺️ 전략 로드맵 (Strategic Roadmap)

이 마스터 플랜은 "큰 계획"을 "작은 계획"으로 나누어 관리합니다. 각 단계는 구체적인 실행 체크리스트를 포함합니다.

### 1️⃣ Phase 1: 동기화 및 클린 상태 (완료)

- **목표**: 로컬/원격 저장소 동기화 및 "유령 파일"(`inbox`) 제거
- **상태**: ✅ 완료 (API Push 완료)

### 2️⃣ Phase 2: 쪽지 기능 제거 (Destructive)

- **목표**: 레거시 메시징 시스템(DB, API, UI)의 영구적 삭제 및 정리
- **계획 파일**: [PLAN_PHASE_2_INBOX_REMOVAL.md](file:///e:/00_Translation/.agent/plans/PLAN_PHASE_2_INBOX_REMOVAL.md)
- **주요 변경**:
  - `messages` 테이블 삭제 (백업 없음)
  - `/inbox` 라우트 및 UI 제거
  - 다국어 사전 정리

### 3️⃣ Phase 3: 회원 등급 시스템 (New Economy)

- **목표**: 6단계 등급 시스템 도입 및 결제 내역 기반 소급 적용
- **계획 파일**: [PLAN_PHASE_3_TIERS.md](file:///e:/00_Translation/.agent/plans/PLAN_PHASE_3_TIERS.md)
- **등급 체계**:
  - **게스트 (GUEST)**: 비회원
  - **브론즈 (BRONZE)**: 회원가입 (기본)
  - **실버 (SILVER)**: 1회 이상 충전
  - **골드 (GOLD)**: 누적 100만원 이상 (해외는 약 2배 적용)
  - **다이아 (DIAMOND)**: 부 관리자
  - **마스터 (MASTER)**: 총 관리자

### 4️⃣ Phase 4: 세션 및 보안 (Auto-Pilot)

- **목표**: 1시간 자동 로그아웃, 작업 자동 저장, 10일 파일 보관 정책
- **계획 파일**: [PLAN_PHASE_4_SESSION.md](file:///e:/00_Translation/.agent/plans/PLAN_PHASE_4_SESSION.md)
- **주요 기능**:
  - 미들웨어 강제 1시간 세션 타임아웃
  - 10일 경과 파일 자동 삭제/만료 표시
  - 작업 중 자동 저장(Auto-save) 훅

---

## 🚦 실행 제어기 (Execution Controller)

| 순서 | 계획               |    상태    | 의존성                |
| :--: | :----------------- | :--------: | :-------------------- |
|  1   | **쪽지 기능 제거** | ⏳ 대기 중 | 없음                  |
|  2   | **회원 등급 개편** | ⏳ 대기 중 | 쪽지 제거 (DB 클린업) |
|  3   | **세션/보안 강화** | ⏳ 대기 중 | 등급 개편 (Role 체크) |

---

**참고**: 각 계획 파일의 "체크리스트"를 확인하고 진행하십시오.
