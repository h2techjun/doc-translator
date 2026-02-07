# 📋 프로젝트 로드맵: 문서 번역 서비스 (Phase 3)

## 🚨 Phase 3.1: 즉각적인 안정화 (최우선 순위)

핵심 목표: 핵심 흐름(업로드 -> 번역 -> 다운로드)의 정상 작동을 방해하는 치명적인 버그 수정.

- [x] **업로드 인프라 진단 (Upload Diagnostic)**
  - [x] "Failed to get upload URL" 에러 원인 규명 (S3/MinIO 및 DB 연결 확인 로직 추가).
  - [x] `src/lib/storage.ts` 로직 및 환경 변수 검증 (Health Check API 추가).
  - [x] Docker 컨테이너(MinIO/LocalStack) 상태 확인 (현재 꺼져있음, 실행 필요).
- [x] **엔드 투 엔드 핵심 흐름 검증 (E2E Verification)**
  - [x] **.docx** (Word) 문서 전체 수명주기 테스트 (업로드 -> Queue -> Mock Worker -> 다운로드).
  - [x] **.xlsx** (Excel) 문서 전체 수명주기 테스트.
  - [x] **.pdf** (PDF) 문서 전체 수명주기 테스트.
  - [x] "개발자 테스트 로그인" 신뢰성 검증 (`x-test-user-id` 헤더 지원).
  - [x] **Google Drive 통합 및 다운로드 (Drive Integration)**
    - [x] 다운로드 프록시 및 CORS 이슈 해결.
    - [x] 파일명 인코딩 이슈 해결.

## ⏸️ Phase 3.2: 번역 품질 및 견고성 강화 (Post-Deployment Test 예정)

- [x] **배포 후 검증 항목**
  - [ ] Gemini 모델 과부하/Rate Limit 실제 환경 테스트.
  - [ ] 대용량 Excel 파일 처리 안정성 검증.
  - [ ] 복잡한 PDF 레이아웃 보존 확인.
  - [x] 이메일 발송 제한 (Rate Limiting) 구현
    - [x] 하루 5회 제한 및 1분 쿨다운 타이머
    - [x] IP 기반 자동 차단 (Anti-Abuse)
    - [x] 어드민 차단 관리 대시보드
- [x] GitHub 연동 및 외부 테스트 배포
  - [x] 로컬 Git 초기화 및 커밋 완료
  - [x] GitHub Remote 연결 및 Push
  - [x] 환경 변수(Env) 설정 및 빌드 트리거
  - [x] Vercel 클라우드 배포 완료 확인 (https://doc-translator-2026.vercel.app)
- [ ] Supabase Redirect URL 최종 설정 및 실서버 테스트

## 💻 Phase 3.3: 사용자 대시보드 및 경험 개선

핵심 목표: 사용자에게 작업 제어권과 가시성 제공.

- [x] **"내 번역" 페이지 (My Translations)**
  - [x] 과거 작업 목록 및 상태/다운로드 링크 제공.
  - [x] 실시간 상태 업데이트 (Polling).
- [x] **상세 진행 상태 UI**
  - [x] 세분화된 단계 표시 ("업로드 중", "분석 중", "번역 중", "재조립 중").

## 👮 Phase 3.4: 관리자 대시보드 & 운영 도구 (Complete)

핵심 목표: 시스템 전반의 모니터링 및 통제 권한 확보.

- [x] **관리자 보안 및 권한 (Admin Security)**
  - [x] `middleware.ts`에 관리자(Admin) 권한 체크 로직 추가 (Role-based).
  - [x] `profiles` 테이블에 `role` 컬럼 추가 (SQL Executed).
  - [x] `h2techjun@gmail.com` 계정에 ADMIN 권한 부여 완료.
- [x] **관리자 대시보드 UI (Admin Dashboard)**
  - [x] **Dashboard Home**: 핵심 지표 (가입자 수, 오늘 번역 요청 수, 성공률) 및 차트 구현.
  - [x] **Users Table**: 전체 사용자 목록 및 상세 정보 조회/차단 기능.
  - [x] **Jobs Inspector**: 전체 번역 작업 로그 확인 및 강제 재시도/취소 기능.
- [x] **시스템 모니터링 (System Health)**
  - [x] 회원 등급별 색상 및 프리미엄 스타일 적용 (DIAMOND, MASTER 대응).
  - [x] RLS 보안 정책 강화 (Zero-Trust).
  - [x] `profiles` 테이블 데이터 정규화 및 제약 조건 확립.

## 🛡️ Phase 3.6: 모든 관리자 API 보안 표준화 (Complete)

핵심 목표: 일관된 세션 복구(The Hammer Fix) 및 이메일 화이트리스트 기반 권한 체크 적용.

- [x] **인증 복구 로직 모듈화**
  - [x] `src/lib/supabase/auth-recovery.ts` 생성 (중복된 쿠키 파싱 로직 통합).
- [x] **관리자 API 보안 패턴 전수 적용**
  - [x] `stats/route.ts`, `audit-logs/route.ts`, `reports/route.ts`, `settings/route.ts` 적용 완료.
  - [x] `jobs/route.ts`, `users/route.ts`, `permissions/route.ts` 적용 완료.
  - [x] `api/admin/**/*` (dynamic routes 포함) 전수 조사 및 적용 완료.
- [x] **최종 보안 감사**
  - [x] 로컬 환경에서의 MASTER/ADMIN 권한 분리 및 접근 테스트 완료.

## 🔍 Phase 3.7: Proactive Monitoring 활성화 (Active)

핵심 목표: 시스템 상태를 자동으로 감시하고 문제를 선제적으로 해결.

- [x] **모니터링 워크플로우 활성화**
  - [x] `.agent/workflows/proactive-monitoring.md` 기반 자동 체크 시작.
  - [x] `USER_PROFILE.md`에 모니터링 설정 반영.
- [ ] **정기 보안 및 품질 스캔**
  - [x] .env 관리 및 API 키 노출 여부 점검 (Pass).
  - [ ] 주기적인 `npm audit` 및 의존성 업데이트 제안.
- [/] **문서 및 작업 관리 최적화**
  - [x] `task.md` 최신화 및 정체된 작업 리마인드.
  - [ ] `README.md` 및 상위 레벨 문서 업데이트.
