---
description: 프로덕션 환경 버그를 체계적으로 디버깅
triggers: 사용자 신고, 모니터링 알림, 에러 발생 시
duration: 1-4시간
prerequisites:
  - 프로덕션 환경 접근 권한
  - 로그 조회 권한 (Vercel, Railway, Supabase)
---

# 🐛 프로덕션 버그 디버깅 워크플로우

## 📋 개요

프로덕션 환경에서 발생한 버그를 체계적으로 분석하고 수정합니다.
문제 재현 → 로그 분석 → 원인 파악 → 수정 → 검증 순서로 진행합니다.

---

## 🔄 실행 단계

### Step 1: 문제 정의 및 정보 수집

**목표**: 무엇이 잘못되었는지 명확히 파악

**수집할 정보**:

1. **증상**:
   - 어떤 기능에서 문제가 발생했는가?
   - 에러 메시지는 무엇인가?
   - 사용자가 무엇을 하려고 했는가?

2. **타임스탬프**:
   - 언제 발생했는가? (정확한 시간)
   - 얼마나 자주 발생하는가?

3. **환경**:
   - 브라우저/디바이스는?
   - 사용자 ID는? (프라이버시 준수)

**문서화**:

```markdown
## 버그 리포트

**발생 시간**: 2026-02-01 14:30 KST
**증상**: 파일 업로드 후 "500 Internal Server Error" 발생
**사용자**: user_abc123
**브라우저**: Chrome 120
**재현 빈도**: 10회 중 10회 (100%)
```

---

### Step 2: 로컬에서 재현 시도

**목표**: 로컬 환경에서 동일한 문제를 재현

```bash
# 1. 프로덕션 환경 변수 복사
cp .env.production .env.local

# 2. 개발 서버 실행
npm run dev

# 3. 문제 재현 시도
# - 사용자가 보고한 동일한 작업 수행
# - 동일한 파일/데이터 사용
```

**재현 성공 시**:

- ✅ 재현 단계를 상세히 문서화
- ✅ 에러 메시지 및 스택 트레이스 캡처
- ✅ Step 4 (원인 파악)로 이동

**재현 실패 시**:

- ⚠️ 프로덕션 환경 특정 이슈일 가능성 높음
- ⚠️ Step 3 (로그 분석)으로 이동

---

### Step 3: 프로덕션 로그 분석

**3.1. Vercel Logs (Next.js Web)**

```bash
# Vercel CLI로 실시간 로그 확인
vercel logs --follow

# 또는 Vercel Dashboard
# https://vercel.com/dashboard → 프로젝트 → Logs
```

**찾을 정보**:

- 에러 메시지
- 스택 트레이스
- Request ID
- 호출된 API Route

**필터링**:

```
# 특정 시간대만 확인
vercel logs --since 2h

# 에러만 필터링
vercel logs | grep ERROR
```

---

**3.2. Railway Logs (Python Worker)**

1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. 프로젝트 선택 → Logs 탭
3. 시간대 필터 적용

**또는 CLI**:

```bash
railway logs --follow
```

**찾을 정보**:

- Python 예외 (Exception)
- Traceback
- Gemini API 에러
- Redis 연결 에러

---

**3.3. Supabase Logs**

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Logs
3. 필터 적용:
   - Log Type: `database`, `api`, `realtime`
   - Severity: `error`, `fatal`

**찾을 정보**:

- SQL 에러
- RLS 정책 위반
- 연결 타임아웃

---

**3.4. Upstash Redis Logs**

1. [Upstash Console](https://console.upstash.com/) 접속
2. Database 선택 → Metrics

**확인 사항**:

- Queue 길이 급증
- Connection 에러
- Timeout 발생

---

### Step 4: 원인 파악 (Root Cause Analysis)

**체크리스트**:

**코드 변경 관련**:

- [ ] 최근 배포에서 변경된 코드는?
- [ ] Git diff 확인:
  ```bash
  git log --oneline -10
  git diff HEAD~1 HEAD
  ```

**환경 설정 관련**:

- [ ] 환경 변수 누락 또는 변경?
  - Vercel Dashboard → Settings → Environment Variables
  - Railway Dashboard → Variables
- [ ] 데이터베이스 스키마 변경?
- [ ] API Key 만료?

**외부 의존성 관련**:

- [ ] Gemini API 장애? → [Google Cloud Status](https://status.cloud.google.com/)
- [ ] Supabase 장애? → [Supabase Status](https://status.supabase.com/)
- [ ] Upstash 장애? → [Upstash Status](https://status.upstash.com/)

**데이터 관련**:

- [ ] 특정 파일 형식만 에러?
- [ ] 파일 크기 제한 초과?
- [ ] 잘못된 데이터 형식?

---

### Step 5: 가설 수립 및 검증

**예시**:

```
가설 1: Gemini API Rate Limit 초과
검증 방법: Gemini API 호출 횟수 로그 확인
결과: 분당 60회 제한에 도달 → 가설 확인

가설 2: 환경 변수 누락
검증 방법: Vercel 환경 변수 확인
결과: GEMINI_API_KEY 존재 → 가설 기각
```

---

### Step 6: 수정 코드 작성

**6.1. Hotfix 브랜치 생성**

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-upload-error
```

**6.2. 수정 코드 작성**

**예시**: Gemini API Rate Limiting 추가

```typescript
// apps/web/src/app/actions/translation.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1 m"), // 분당 50회
});

export async function uploadAndTranslate(formData: FormData) {
  // Rate limiting 확인
  const { success } = await ratelimit.limit("gemini-api");

  if (!success) {
    return { error: "Too many requests. Please wait a moment." };
  }

  // 기존 로직...
}
```

**6.3. 로컬 테스트**

```bash
# Unit Tests
npm test -- --watch

# 문제 재현 테스트
npm run dev
# 버그를 발생시켰던 동일한 작업 수행
```

**6.4. 테스트 케이스 추가** (회귀 방지)

```typescript
// apps/web/src/app/actions/__tests__/translation.test.ts

describe("uploadAndTranslate", () => {
  it("should handle rate limit gracefully", async () => {
    // Rate limit 초과 상황 시뮬레이션
    const formData = new FormData();
    // ...

    const result = await uploadAndTranslate(formData);
    expect(result.error).toBe("Too many requests");
  });
});
```

---

### Step 7: Pull Request 생성 (Fast-Track)

```bash
git add .
git commit -m "fix: Add rate limiting to prevent Gemini API overuse

Fixes #123"
git push origin hotfix/fix-upload-error
```

**GitHub에서 PR 생성**:

- **제목**: `[HOTFIX] Fix upload error due to Gemini API rate limit`
- **라벨**: `priority: high`, `type: bugfix`
- **본문**:

  ```markdown
  ## 문제

  사용자가 파일 업로드 시 500 에러 발생

  ## 원인

  Gemini API 분당 60회 제한 초과

  ## 해결

  - Upstash Rate Limiting 추가 (분당 50회)
  - 사용자에게 명확한 에러 메시지 표시

  ## 테스트

  - [x] 로컬에서 재현 및 수정 확인
  - [x] 단위 테스트 추가
  - [x] Rate limit 동작 확인
  ```

**긴급 리뷰 요청**:

- 팀원에게 즉시 리뷰 요청 (Slack, Discord)
- Approve 받으면 즉시 머지

---

### Step 8: 배포 및 검증

**8.1. 배포**

```bash
git checkout main
git merge hotfix/fix-upload-error
git push origin main
```

**8.2. 배포 확인**

- Vercel/Railway에서 자동 배포 진행 확인
- 배포 완료까지 대기 (3-5분)

**8.3. 프로덕션 검증**

- [ ] 동일한 작업으로 버그 재현 시도 → 에러 없어야 함
- [ ] Rate limit 메시지 정상 표시 확인
- [ ] 기존 기능 정상 작동 (회귀 테스트)

**8.4. 사용자에게 공지**

```
[해결] 파일 업로드 오류가 수정되었습니다.
문제 원인: API 호출 한도 초과
해결 방법: Rate Limiting 추가
현재 상태: 정상 작동
```

---

## ✅ 완료 확인

- [ ] 버그 수정 및 배포 완료
- [ ] 프로덕션에서 정상 작동 확인
- [ ] 사용자에게 해결 공지
- [ ] 회귀 테스트 통과
- [ ] 테스트 케이스 추가 (재발 방지)

---

## 📝 사후 분석 (Post-Mortem)

버그 수정 후 `.agent/memory/INCIDENTS_LOG.md`에 기록:

```markdown
## 2026-02-01: 파일 업로드 500 에러

**발견 시간**: 14:30 KST
**해결 시간**: 16:15 KST (1시간 45분)

**문제**:

- 사용자가 파일 업로드 시 500 Internal Server Error 발생

**근본 원인**:

- Gemini API 분당 60회 제한 초과
- Rate Limiting 미구현

**해결**:

- Upstash Rate Limiting 추가 (분당 50회)
- 사용자에게 명확한 에러 메시지 표시

**재발 방지**:

- [ ] 모든 외부 API에 Rate Limiting 적용
- [ ] 모니터링 알림 추가 (API 사용량 80% 도달 시)
- [ ] 문서 업데이트 (.agent/rules/CODING_STANDARDS.md)

**배운 점**:

- 외부 API는 항상 Rate Limit 고려 필요
- 에러 메시지는 사용자에게 명확히 전달
```

---

## 🚨 에스컬레이션 기준

다음 상황에서는 즉시 팀 리더/시니어 개발자에게 에스컬레이션:

- [ ] 1시간 내 원인 파악 불가
- [ ] 데이터 유실 가능성
- [ ] 보안 취약점 발견
- [ ] 외부 서비스 장애 (우리가 통제 불가)
- [ ] 대규모 사용자 영향 (10명 이상)

---

## 📚 참고 자료

- [Vercel Logs 활용법](https://vercel.com/docs/observability/runtime-logs)
- [Railway 디버깅 가이드](https://docs.railway.app/guides/logs)
- [Supabase 로그 분석](https://supabase.com/docs/guides/platform/logs)
- [Post-Mortem 템플릿](.agent/templates/post-mortem-template.md)
