---
description: 프로덕션 환경에 애플리케이션 배포
triggers: 모든 테스트 통과 및 코드 리뷰 완료 후
duration: 30분
prerequisites:
  - CI/CD 파이프라인 통과 (모든 테스트 성공)
  - 최소 1명의 코드 리뷰 완료
  - 환경 변수 검증 완료
---

# 🚀 프로덕션 배포 워크플로우

## 📋 개요

main 브랜치의 최신 코드를 프로덕션 환경(Vercel, Railway)에 배포합니다.
Next.js 웹 앱과 Python Worker를 순차적으로 배포합니다.

---

## ✅ 배포 전 체크리스트

- [ ] 로컬에서 모든 테스트 통과 (`npm test`)
- [ ] TypeScript 타입 체크 통과 (`npm run type-check`)
- [ ] ESLint 에러 0개 (`npm run lint`)
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 보안 취약점 없음 (`npm audit --production`)
- [ ] 환경 변수 최신화 확인 (Vercel, Railway Dashboard)
- [ ] 데이터베이스 마이그레이션 준비 완료 (필요 시)

---

## 🔄 실행 단계

### Step 1: 최종 로컬 검증

로컬에서 프로덕션 모드로 실행하여 정상 작동 확인

```bash
cd apps/web
npm run build
npm run start
```

**예상 결과**:

- 빌드 에러 없음
- `http://localhost:3000` 정상 접속
- 콘솔 에러 없음

**문제 발생 시**:

- 빌드 에러 → 에러 메시지 확인 후 수정
- 런타임 에러 → `console.log` 확인 및 디버깅

---

### Step 2: main 브랜치에 머지

```bash
# feature 브랜치에서 최신 main 가져오기
git checkout main
git pull origin main

# feature 브랜치 머지
git merge feature/your-branch-name

# 충돌 해결 (필요 시)
# git mergetool

# main에 푸시
git push origin main
```

**예상 결과**:

- 머지 충돌 없음 또는 해결 완료
- GitHub에서 main 브랜치 업데이트 확인

---

### Step 3: Vercel 자동 배포 대기 (Next.js)

Vercel이 main 브랜치 푸시를 자동 감지하여 배포를 시작합니다.

**확인 방법**:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Deployments 탭에서 진행 상황 확인
   - `Building` → `Deploying` → `Ready`

**예상 소요 시간**: 2-4분

**문제 발생 시**:

- Build Failed → Vercel Logs 확인
- 일반적인 원인:
  - 환경 변수 누락
  - 의존성 설치 실패
  - TypeScript 에러

---

### Step 4: Python Worker 배포 (Railway)

**방법 1: Git Push를 통한 자동 배포** (권장)

```bash
# Railway는 main 브랜치 푸시를 자동 감지
# 별도 작업 불필요
```

**방법 2: Railway CLI를 통한 수동 배포**

```bash
# Railway CLI 설치 (최초 1회)
npm i -g @railway/cli

# 로그인
railway login

# 배포
cd apps/worker
railway up
```

**확인 방법**:

1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. 프로젝트 선택
3. Deployments 탭에서 상태 확인

**예상 소요 시간**: 3-5분

---

### Step 5: 배포 검증 (Smoke Test)

프로덕션 환경에서 핵심 기능이 정상 작동하는지 확인합니다.

**Next.js 웹 앱 검증**:

- [ ] 프로덕션 URL 접속 가능
- [ ] 로그인 기능 정상 작동
- [ ] 파일 업로드 정상 작동
- [ ] 대시보드 렌더링 정상
- [ ] 브라우저 콘솔 에러 없음

**Python Worker 검증**:

```bash
# Railway Logs 확인
railway logs --follow

# 예상 로그:
# "🎧 Worker started. Listening for jobs..."
```

- [ ] Worker 프로세스 실행 중
- [ ] Redis 연결 성공
- [ ] Supabase 연결 성공

**통합 테스트**:

1. 프로덕션 웹에서 샘플 파일 업로드
2. 번역 작업이 큐에 추가되는지 확인
3. Worker가 작업을 처리하는지 확인
4. 번역 완료 후 다운로드 가능한지 확인

---

### Step 6: 모니터링 확인

배포 후 30분간 모니터링

**확인 항목**:

- [ ] Vercel Analytics: 에러율 < 1%
- [ ] Railway Logs: Worker 에러 없음
- [ ] Supabase Logs: 비정상 쿼리 없음
- [ ] Upstash Dashboard: Queue 처리 정상

---

## ✅ 완료 확인

- [ ] 웹 앱 정상 작동
- [ ] Worker 정상 작동
- [ ] 통합 테스트 통과
- [ ] 모니터링 정상
- [ ] 팀에 배포 완료 공지 (Slack, Discord 등)
- [ ] 릴리스 노트 작성 (선택)

---

## 🚨 롤백 절차

문제 발생 시 즉시 이전 버전으로 롤백합니다.

### Vercel 롤백

1. [Vercel Dashboard](https://vercel.com/dashboard) → Deployments
2. 이전 정상 배포 선택
3. **Promote to Production** 버튼 클릭
4. 1-2분 내 롤백 완료

### Railway 롤백

1. [Railway Dashboard](https://railway.app/dashboard) → Deployments
2. 이전 배포 선택
3. **Rollback to this deployment** 클릭

### Git 롤백 (긴급)

```bash
# 최신 커밋 되돌리기
git checkout main
git revert HEAD
git push origin main
```

### 롤백 후 조치

1. **원인 분석**:
   - Vercel Logs 확인
   - Railway Logs 확인
   - Sentry (설정된 경우) 에러 트래킹

2. **핫픽스 브랜치 생성**:

   ```bash
   git checkout -b hotfix/issue-description
   ```

3. **수정 후 재배포**:
   - 수정 코드 작성
   - 테스트 통과 확인
   - Fast-track PR (긴급 리뷰)
   - 재배포

---

## 📊 배포 히스토리 기록

`.agent/memory/DEPLOYMENT_LOG.md`에 배포 내역 기록:

```markdown
## 2026-02-01 18:30 - v1.2.0 배포

**배포자**: {이름}
**커밋**: abc1234
**변경 사항**:

- Gemini 2.0 Flash 통합
- 파일 크기 제한 50MB로 증가

**배포 소요 시간**: 12분
**이슈**: 없음
**롤백 여부**: 아니오
```

---

## 📚 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)
- [Railway 배포 가이드](https://docs.railway.app/deploy/deployments)
- [프로젝트 모니터링 대시보드](링크)
- [롤백 상세 절차](.agent/workflows/rollback.md)
