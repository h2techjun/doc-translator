---
description: 새로운 기능 개발을 위한 체계적인 프로세스
triggers: 새로운 기능 요구사항 발생 시
duration: 2-10일 (기능 복잡도에 따라)
prerequisites:
  - 기능 요구사항 명확화
  - 우선순위 확정
---

# ✨ 기능 개발 워크플로우

## 📋 개요

새로운 기능을 처음부터 끝까지 체계적으로 개발하는 프로세스입니다.
계획 → 설계 → 구현 → 테스트 → 리뷰 → 배포 순서로 진행합니다.

---

## 🔄 실행 단계

### Phase 1: 기획 및 분석 (Planning)

#### Step 1.1: 요구사항 정의

**문서화 양식**:

```markdown
# 기능 요구사항: {기능명}

## 배경 (Background)

왜 이 기능이 필요한가?

## 사용자 스토리 (User Stories)

- As a {사용자 유형}, I want {기능}, so that {목적}

## 수용 기준 (Acceptance Criteria)

- [ ] 기준 1
- [ ] 기준 2

## 제약 조건 (Constraints)

- 성능: 응답 시간 < 2초
- 파일 크기: 최대 50MB

## Out of Scope (이번 버전에서 제외)

- 추후 고려 사항
```

**작성 위치**: GitHub Issue 또는 `.agent/memory/FEATURES/{feature-name}.md`

---

#### Step 1.2: 기술 스파이크 (Technical Spike)

새로운 기술이나 불확실성이 있는 경우, 먼저 작은 PoC(Proof of Concept)를 만듭니다.

**예시**: Gemini 2.0 Flash API 테스트

```bash
# 별도 브랜치 생성
git checkout -b spike/gemini-2.0-test

# 최소한의 코드로 테스트
# apps/web/src/app/api/test-gemini/route.ts
```

**목표**:

- 기술적 실현 가능성 확인
- 성능 측정
- 잠재적 문제점 파악

**시간 제한**: 최대 1-2일

---

### Phase 2: 설계 (Design)

#### Step 2.1: 아키텍처 설계

**@Architect 페르소나 호출**:

```
@Architect
새로운 기능: {기능명}
요구사항: {요약}

다음을 설계해주세요:
1. 데이터 모델 (Supabase 스키마)
2. API 엔드포인트 설계
3. 컴포넌트 구조
4. 상태 관리 방법
```

**산출물**:

- 데이터베이스 스키마 (ERD)
- API 명세 (Request/Response)
- 컴포넌트 트리

---

#### Step 2.2: UI/UX 설계 (필요시)

**Figma 또는 손그림**:

- 주요 화면 와이어프레임
- 사용자 플로우

**또는 AI로 목업 생성**:

```
간단한 텍스트 설명 → generate_image 도구 활용
```

---

### Phase 3: 구현 (Implementation)

#### Step 3.1: 브랜치 생성

```bash
git checkout main
git pull origin main
git checkout -b feature/{feature-name}
```

**브랜치 네이밍 규칙**:

- `feature/user-authentication` - 새 기능
- `enhance/upload-speed` - 기존 기능 개선
- `refactor/api-structure` - 리팩토링

---

#### Step 3.2: 데이터베이스 마이그레이션 (필요시)

**Supabase Studio에서 스키마 수정**:

1. [Supabase Dashboard](https://supabase.com/dashboard) → Table Editor
2. 테이블 생성 또는 수정
3. SQL 스크립트 저장

**마이그레이션 파일 생성**:

```sql
-- packages/database/migrations/20260201_add_translation_history.sql

CREATE TABLE translation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  job_id UUID REFERENCES translation_jobs(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON translation_history FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### Step 3.3: 백엔드 구현

**@The-Builder 페르소나 호출**:

```
@The-Builder
다음 기능을 구현해주세요:

**요구사항**:
- {구체적인 요구사항}

**파일 위치**:
- apps/web/src/app/actions/translation-history.ts

**체크리스트**:
- [ ] TypeScript 타입 정의
- [ ] 에러 핸들링
- [ ] 입력 검증 (Zod)
- [ ] 로깅
```

**코딩 표준 준수**:

- `.agent/rules/CODING_STANDARDS.md` 참조
- ESLint 에러 0개 유지

---

#### Step 3.4: 프론트엔드 구현

**컴포넌트 구조 예시**:

```
apps/web/src/app/
  └── history/
      ├── page.tsx              # 메인 페이지
      ├── components/
      │   ├── HistoryList.tsx   # 기록 목록
      │   └── HistoryItem.tsx   # 개별 항목
      └── actions.ts            # Server Actions
```

**UI 구현 시 체크리스트**:

- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱)
- [ ] 로딩 상태 표시
- [ ] 에러 상태 표시
- [ ] 빈 상태 (Empty State) 처리
- [ ] 접근성 (a11y) - `aria-label`, `role` 등

---

### Phase 4: 테스트 (Testing)

#### Step 4.1: 단위 테스트 (Unit Tests)

```typescript
// apps/web/src/app/actions/__tests__/translation-history.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { getTranslationHistory } from "../translation-history";

describe("getTranslationHistory", () => {
  it("should return user translation history", async () => {
    const history = await getTranslationHistory("user-123");
    expect(history).toBeInstanceOf(Array);
    expect(history.length).toBeGreaterThan(0);
  });

  it("should handle non-existent user", async () => {
    const history = await getTranslationHistory("non-existent");
    expect(history).toEqual([]);
  });
});
```

**실행**:

```bash
npm test -- translation-history
```

---

#### Step 4.2: 통합 테스트 (Integration Tests)

```typescript
// apps/web/src/app/history/__tests__/integration.test.ts

import { render, screen, waitFor } from '@testing-library/react'
import HistoryPage from '../page'

describe('HistoryPage', () => {
  it('should display translation history', async () => {
    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText('번역 기록')).toBeInTheDocument()
    })
  })
})
```

---

#### Step 4.3: 수동 테스트

**로컬 환경에서 확인**:

```bash
npm run dev
# http://localhost:3000/history 접속
```

**테스트 시나리오**:

1. 정상 케이스
   - [ ] 기록이 있는 사용자로 로그인
   - [ ] 기록 목록 표시 확인
   - [ ] 페이지네이션 작동 확인

2. 엣지 케이스
   - [ ] 기록이 없는 사용자
   - [ ] 네트워크 에러 발생 시
   - [ ] 로그인하지 않은 사용자

---

### Phase 5: 코드 리뷰 (Code Review)

#### Step 5.1: 셀프 리뷰

**@The-Reviewer 페르소나 호출**:

```
@The-Reviewer
다음 코드를 리뷰해주세요:

파일: apps/web/src/app/history/page.tsx

리뷰 항목:
- 성능 최적화
- 보안 취약점
- 코드 가독성
- 안티패턴 여부
```

**개선 사항 반영**

---

#### Step 5.2: Pull Request 생성

```bash
git add .
git commit -m "feat: Add translation history feature

- Add translation_history table
- Implement history page UI
- Add Server Actions for history retrieval
- Add unit and integration tests

Closes #123"

git push origin feature/translation-history
```

**PR 템플릿**:

```markdown
## 기능 설명

번역 기록을 확인할 수 있는 페이지 추가

## 변경 사항

- [ ] 데이터베이스: `translation_history` 테이블 추가
- [ ] 백엔드: Server Actions 구현
- [ ] 프론트엔드: History 페이지 및 컴포넌트
- [ ] 테스트: 단위/통합 테스트 추가

## 스크린샷

[스크린샷 첨부]

## 테스트 방법

1. 로그인
2. `/history` 페이지 접속
3. 과거 번역 기록 확인

## 체크리스트

- [ ] 코딩 표준 준수
- [ ] 테스트 통과 (단위/통합)
- [ ] ESLint/Prettier 통과
- [ ] 보안 취약점 없음
- [ ] 문서 업데이트 (필요시)
```

---

#### Step 5.3: 팀원 리뷰 대기

**리뷰어 지정**:

- 최소 1명 이상 Approve 필요
- 보안 관련 기능은 @The-Guardian 역할 리뷰 필수

**피드백 반영**:

```bash
# 리뷰 피드백에 따라 수정
git add .
git commit -m "refactor: Apply review feedback"
git push origin feature/translation-history
```

---

### Phase 6: 배포 및 모니터링 (Deployment)

#### Step 6.1: 머지 및 배포

```bash
# PR이 Approve되면 main에 머지
git checkout main
git pull origin main
```

**자동 배포**:

- Vercel/Railway가 자동으로 감지하여 배포 시작

---

#### Step 6.2: 프로덕션 검증

**Smoke Test**:

- [ ] 프로덕션 URL 접속
- [ ] 새 기능 정상 작동 확인
- [ ] 기존 기능 회귀 테스트

**모니터링** (배포 후 1-2시간):

- [ ] Vercel Analytics - 에러율 확인
- [ ] Sentry (설정된 경우) - 예외 발생 확인
- [ ] User Feedback - 사용자 문의사항 확인

---

#### Step 6.3: 문서 업데이트

**업데이트할 문서**:

1. `README.md` - 새 기능 설명 추가
2. `.agent/memory/CHANGELOG.md` - 변경 이력 기록
3. 사용자 가이드 (있는 경우)

**CHANGELOG 형식**:

```markdown
## v1.3.0 (2026-02-01)

### ✨ New Features

- **번역 기록**: 과거 번역 작업을 확인할 수 있는 기록 페이지 추가 (#123)

### 🐛 Bug Fixes

- (없음)

### 🔒 Security

- (없음)
```

---

## ✅ 완료 확인

기능 개발 완료 시 다음을 모두 달성해야 합니다:

**코드 품질**:

- [ ] 모든 테스트 통과 (단위/통합)
- [ ] ESLint/Prettier 에러 0개
- [ ] TypeScript 타입 에러 0개
- [ ] 코드 리뷰 Approve

**기능 완성도**:

- [ ] 요구사항의 모든 수용 기준 충족
- [ ] 엣지 케이스 처리 완료
- [ ] 에러 핸들링 구현
- [ ] 로딩/빈 상태 UI 구현

**배포 및 문서**:

- [ ] 프로덕션 배포 완료
- [ ] 프로덕션 검증 통과
- [ ] 문서 업데이트 완료
- [ ] 팀에 공지 완료

---

## 🚨 일반적인 실수 및 회피 방법

### 실수 1: 기획 없이 바로 코딩

**문제**: 중간에 요구사항 변경으로 재작업  
**해결**: Phase 1, 2를 건너뛰지 말 것

### 실수 2: 테스트 미작성

**문제**: 배포 후 버그 발생  
**해결**: TDD (Test-Driven Development) 권장

### 실수 3: 너무 큰 PR

**문제**: 리뷰가 어렵고 머지가 늦어짐  
**해결**: 큰 기능은 여러 작은 PR로 분할

### 실수 4: 롤백 계획 부재

**문제**: 배포 후 문제 발생 시 복구 어려움  
**해결**: `.agent/workflows/rollback.md` 숙지

---

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/) - 커밋 메시지 규칙
- [코딩 표준](.agent/rules/CODING_STANDARDS.md)
- [배포 워크플로우](.agent/workflows/deploy.md)
- [디버깅 워크플로우](.agent/workflows/debug.md)

---

**기능 개발을 시작할 준비가 되셨나요? 🚀**
