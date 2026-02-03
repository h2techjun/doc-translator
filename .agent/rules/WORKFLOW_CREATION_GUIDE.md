# 🔄 워크플로우 생성 가이드 (Workflow Creation Guide)

> **목적**: 반복 가능한 프로세스를 표준화된 워크플로우로 작성하기 위한 가이드  
> **적용 대상**: 배포, 디버깅, 테스트, 리팩토링 등 반복적인 작업 프로세스  
> **업데이트**: 2026-02-01

---

## 🎯 워크플로우란?

**워크플로우**는 특정 목표를 달성하기 위한 **단계별 실행 절차**를 문서화한 것입니다.

### 워크플로우 vs 계획 vs 규칙

| 구분       | 워크플로우             | 계획 (Plan)            | 규칙 (Rules)         |
| ---------- | ---------------------- | ---------------------- | -------------------- |
| **목적**   | 반복 작업 표준화       | 일회성 프로젝트 실행   | 지속적 행동 규범     |
| **반복성** | 높음 (매번 동일)       | 낮음 (프로젝트별 다름) | 중간 (항상 준수)     |
| **추상화** | 구체적 절차            | 단계별 계획            | 원칙과 기준          |
| **예시**   | 배포 절차, 디버깅 방법 | Phase 0~5 실행 계획    | 코딩 표준, 보안 정책 |

---

## 📐 워크플로우 표준 구조

모든 워크플로우는 다음 YAML Frontmatter + Markdown 형식을 따릅니다:

````markdown
---
description: { 한 줄 설명, 예: "프로덕션 배포 절차" }
triggers: { 언제 실행하는지, 예: "새로운 기능 완성 후" }
duration: { 예상 소요 시간, 예: "30분" }
prerequisites: { 사전 조건, 예시: ["모든 테스트 통과", "코드 리뷰 완료"] }
---

# {워크플로우 제목}

## 📋 개요 (Overview)

{이 워크플로우가 무엇을 하는지 2-3문장 설명}

## ✅ 사전 체크리스트 (Pre-flight Checklist)

- [ ] 사전 조건 1
- [ ] 사전 조건 2

## 🔄 실행 단계 (Steps)

### Step 1: {단계명}

{무엇을 하는지 설명}

**실행 명령어**:

```bash
# 명령어
```
````

**예상 결과**:

- {성공 시 나타나는 결과}

**문제 발생 시**:

- {흔한 에러와 해결 방법}

### Step 2: {단계명}

{동일한 구조 반복}

## ✅ 완료 확인 (Verification)

- [ ] 확인 항목 1
- [ ] 확인 항목 2

## 🚨 롤백 절차 (Rollback)

{문제 발생 시 원상 복구 방법}

## 📚 참고 자료 (References)

- [관련 문서](링크)

````

---

## 🔑 워크플로우 작성 7대 원칙

### 1. 원자성 (Atomicity)
- 하나의 워크플로우는 **하나의 명확한 목표**만 달성
- ❌ "개발 환경 구축 및 배포" (2개 목표)
- ✅ "개발 환경 구축", "프로덕션 배포" (분리)

### 2. 순차성 (Sequential)
- 단계는 반드시 **순서대로** 실행 가능해야 함
- Step 2는 Step 1 완료 후에만 실행 가능

### 3. 재현성 (Reproducibility)
- 누가 실행하든 **동일한 결과** 보장
- 환경 변수, 권한 등 사전 조건 명시

### 4. 복구 가능성 (Recoverability)
- 모든 워크플로우는 **롤백 절차** 포함
- 실패 시 원상 복구 방법 제시

### 5. 자동화 가능성 (Automation-Ready)
- 가능한 한 **스크립트화** 가능하게 작성
- 수동 작업은 최소화

### 6. 에러 핸들링 (Error Handling)
- 각 단계에서 발생 가능한 **흔한 에러** 명시
- 해결 방법 포함

### 7. 측정 가능성 (Measurability)
- 완료 여부를 **명확히 확인** 가능
- 체크리스트로 검증

---

## 🎨 워크플로우 유형별 템플릿

### A. 배포 워크플로우 (Deployment Workflow)

**파일명**: `deploy-production.md`

**필수 포함 내용**:
- 배포 전 체크리스트
- 배포 명령어
- 배포 후 검증
- 롤백 절차

**템플릿**:
```markdown
---
description: 프로덕션 환경에 애플리케이션 배포
triggers: 모든 테스트 통과 및 코드 리뷰 완료 후
duration: 30분
prerequisites:
  - CI/CD 파이프라인 녹색 (모든 테스트 통과)
  - 최소 2명의 Approve 받은 Pull Request
  - 배포 권한 보유
---

# 🚀 프로덕션 배포 워크플로우

## 📋 개요
main 브랜치의 최신 코드를 프로덕션 환경(Vercel, Railway)에 배포합니다.

## ✅ 배포 전 체크리스트
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] Lighthouse Score > 90점
- [ ] 보안 스캔 통과 (`npm audit`)
- [ ] 환경 변수 검증 완료
- [ ] 데이터베이스 마이그레이션 준비 완료

## 🔄 실행 단계

### Step 1: 최종 빌드 테스트
로컬에서 프로덕션 빌드가 정상 작동하는지 확인합니다.

```bash
npm run build
npm run start
````

**예상 결과**:

- 빌드 에러 없음
- localhost:3000 정상 접속

**문제 발생 시**:

- 빌드 에러 → 에러 메시지 확인 후 수정
- 런타임 에러 → 로그 확인 및 디버깅

### Step 2: main 브랜치에 머지

```bash
git checkout main
git pull origin main
git merge feature/your-branch
git push origin main
```

### Step 3: Vercel 자동 배포 대기

Vercel이 main 브랜치 푸시를 감지하고 자동 배포를 시작합니다.

**확인 방법**:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 배포 상태 확인 (Building → Ready)
3. 예상 소요 시간: 2-3분

### Step 4: 배포 검증

프로덕션 URL에서 정상 동작 확인

**체크리스트**:

- [ ] 프로덕션 URL 접속 가능
- [ ] 새 기능 정상 작동
- [ ] 기존 기능 정상 작동 (회귀 테스트)
- [ ] 콘솔 에러 없음

## ✅ 완료 확인

- [ ] 프로덕션 환경 정상 작동
- [ ] 모니터링 대시보드 정상 (에러율 < 1%)
- [ ] Slack/Discord에 배포 완료 공지

## 🚨 롤백 절차

문제 발생 시:

1. **즉시 이전 버전으로 롤백**:

   ```bash
   # Vercel에서 이전 배포로 Rollback
   ```

   Vercel Dashboard → Deployments → 이전 버전 → Promote to Production

2. **원인 분석**:
   - Vercel Logs 확인
   - Sentry 에러 트래킹 확인

3. **핫픽스 배포** (필요 시):
   ```bash
   git checkout main
   git revert HEAD
   git push origin main
   ```

## 📚 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [롤백 절차 상세](링크)

````

---

### B. 디버깅 워크플로우 (Debugging Workflow)

**파일명**: `debug-production-issue.md`

**필수 포함 내용**:
- 문제 재현 방법
- 로그 확인 절차
- 원인 파악 단계
- 수정 및 검증

**템플릿**:
```markdown
---
description: 프로덕션 환경 버그 디버깅 절차
triggers: 사용자 신고 또는 모니터링 알림 발생 시
duration: 1-4시간
prerequisites:
  - 프로덕션 환경 접근 권한
  - 로그 조회 권한
---

# 🐛 프로덕션 버그 디버깅 워크플로우

## 📋 개요
프로덕션 환경에서 발생한 버그를 체계적으로 분석하고 수정합니다.

## 🔄 실행 단계

### Step 1: 문제 정의 및 재현
**목표**: 무엇이 잘못되었는지 명확히 파악

1. 사용자 신고 내용 수집:
   - 어떤 기능에서 문제 발생?
   - 에러 메시지는?
   - 언제 발생? (타임스탬프)

2. 로컬에서 재현 시도:
   ```bash
   # 프로덕션과 동일한 환경 변수 사용
   cp .env.production .env.local
   npm run dev
````

**재현 성공 시**:

- 재현 단계를 문서화
- 다음 단계로 진행

**재현 실패 시**:

- 프로덕션 환경 특정 이슈일 가능성
- Step 2로 이동 (로그 분석)

### Step 2: 로그 분석

프로덕션 로그에서 에러 추적

1. **Vercel Logs** (Next.js):

   ```bash
   vercel logs --follow
   ```

2. **Railway Logs** (Python Worker):
   - Railway Dashboard → 해당 서비스 → Logs

3. **Supabase Logs**:
   - Supabase Dashboard → Logs → Filter by 에러 타입

**찾을 정보**:

- 에러 메시지
- 스택 트레이스
- 발생 빈도
- 관련 사용자 ID

### Step 3: 원인 파악

**체크리스트**:

- [ ] 최근 배포에서 변경된 코드는?
- [ ] 데이터베이스 스키마 변경은?
- [ ] 환경 변수 누락은?
- [ ] 외부 API 장애는?

### Step 4: 수정 및 테스트

1. 브랜치 생성:

   ```bash
   git checkout -b hotfix/issue-description
   ```

2. 수정 코드 작성

3. 로컬 테스트:

   ```bash
   npm test
   npm run build
   ```

4. Pull Request 생성 (Fast-track):
   - 제목: `[HOTFIX] {이슈 설명}`
   - 라벨: `priority: high`, `type: bugfix`

### Step 5: 긴급 배포

- Step 1~4 완료 후 즉시 배포
- 배포 워크플로우 참조

## ✅ 완료 확인

- [ ] 버그 수정 확인
- [ ] 회귀 테스트 통과
- [ ] 사용자에게 해결 공지

## 📝 사후 분석 (Post-Mortem)

- 근본 원인 분석 (Root Cause Analysis)
- 재발 방지 대책 수립
- `.agent/memory/INCIDENTS_LOG.md`에 기록

````

---

### C. 테스트 워크플로우 (Testing Workflow)

**파일명**: `run-comprehensive-tests.md`

```markdown
---
description: 전체 테스트 스위트 실행
triggers: Pull Request 생성 또는 배포 전
duration: 10-15분
prerequisites:
  - 의존성 설치 완료 (npm install)
  - 환경 변수 설정 완료
---

# 🧪 전체 테스트 실행 워크플로우

## 🔄 실행 단계

### Step 1: Unit Tests
```bash
npm test -- --coverage
````

**통과 기준**:

- 모든 테스트 통과
- 커버리지 > 80%

### Step 2: Integration Tests

```bash
npm run test:integration
```

### Step 3: E2E Tests

```bash
npx playwright test
```

### Step 4: Lint & Type Check

```bash
npm run lint
npm run type-check
```

## ✅ 완료 확인

- [ ] 모든 테스트 통과
- [ ] 커버리지 기준 충족
- [ ] Lint 에러 0개

````

---

## 🚀 워크플로우 자동화 (Turbo Mode)

### `// turbo` 어노테이션

특정 단계를 자동 실행 가능하도록 표시:

```markdown
## 🔄 실행 단계

### Step 1: 수동 확인 필요
사용자가 배포 준비되었는지 확인합니다.

// turbo
### Step 2: 빌드 실행
자동으로 실행 가능한 단계입니다.
```bash
npm run build
````

````

**의미**: Step 2는 AI가 자동으로 명령어를 실행할 수 있음

### `// turbo-all` 어노테이션

전체 워크플로우를 자동 실행:

```markdown
---
description: 자동화 가능한 배포
---

// turbo-all

# 자동 배포 워크플로우

모든 단계가 자동으로 실행됩니다.
````

---

## 📊 워크플로우 품질 평가

### 자가 평가 체크리스트 (100점 만점)

#### 구조 및 형식 (20점)

- [ ] (5점) YAML Frontmatter 포함
- [ ] (5점) 표준 섹션 모두 포함
- [ ] (5점) 마크다운 문법 정확
- [ ] (5점) 코드 블록 언어 명시

#### 명확성 (30점)

- [ ] (10점) 각 단계가 명확하고 구체적
- [ ] (10점) 명령어가 복사-붙여넣기 가능
- [ ] (10점) 예상 결과가 명시됨

#### 실행 가능성 (30점)

- [ ] (10점) 순서대로 실행 시 성공 보장
- [ ] (10점) 사전 조건이 명확히 명시됨
- [ ] (10점) 에러 핸들링 포함

#### 복구 가능성 (20점)

- [ ] (10점) 롤백 절차 포함
- [ ] (10점) 검증 체크리스트 포함

**합계**: \_\_/100점  
**통과 기준**: 80점 이상

---

## 💡 워크플로우 작성 Best Practices

### DO ✅

1. **명령어 완전성**: 모든 명령어는 절대 경로 또는 상대 경로 포함
2. **에러 시나리오**: 흔한 에러와 해결 방법 명시
3. **예상 소요 시간**: 각 단계별 시간 명시
4. **Idempotency**: 여러 번 실행해도 안전한지 확인
5. **버전 관리**: 워크플로우도 Git으로 관리

### DON'T ❌

1. **모호한 지시**: "적절히 수정" (X) → "line 42의 값을 'production'으로 변경" (O)
2. **수동 작업 과다**: 자동화 가능한 부분은 스크립트화
3. **롤백 절차 누락**: 모든 워크플로우는 복구 방법 포함
4. **환경 가정**: "npm이 설치되어 있다고 가정" (X) → 사전 조건에 명시 (O)

---

## 🔄 워크플로우 생명주기

### 1. 생성 (Creation)

```bash
# 새 워크플로우 생성
touch .agent/workflows/new-workflow.md
```

### 2. 테스트 (Testing)

- 실제로 처음부터 끝까지 실행해보기
- 다른 팀원에게 실행 요청 (재현성 검증)

### 3. 개선 (Improvement)

- 실행 중 발견된 문제점 반영
- 소요 시간 측정 및 업데이트

### 4. 자동화 (Automation)

- 가능한 부분을 스크립트로 변환
- CI/CD 파이프라인에 통합

### 5. 폐기 (Deprecation)

- 더 이상 사용하지 않는 워크플로우는 `@deprecated` 태그
- 3개월 후 삭제

---

## 📚 추천 워크플로우 목록

### 필수 (모든 프로젝트)

- [ ] `/deploy` - 프로덕션 배포
- [ ] `/debug` - 버그 디버깅
- [ ] `/test` - 전체 테스트 실행
- [ ] `/rollback` - 배포 롤백

### 권장 (성숙한 프로젝트)

- [ ] `/onboard` - 신규 개발자 온보딩
- [ ] `/release` - 릴리스 노트 작성
- [ ] `/security-audit` - 보안 감사
- [ ] `/performance-check` - 성능 측정
- [ ] `/backup` - 데이터 백업

### 고급 (엔터프라이즈)

- [ ] `/disaster-recovery` - 재해 복구
- [ ] `/scale-up` - 인프라 스케일 업
- [ ] `/migration` - 데이터 마이그레이션
- [ ] `/compliance-check` - 규정 준수 확인

---

**이 가이드를 따라 작성된 워크플로우는 반복 가능하고, 자동화 가능하며, 복구 가능합니다.** 🔄
