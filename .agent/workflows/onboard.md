---
description: 신규 개발자를 위한 프로젝트 온보딩 절차
triggers: 새로운 팀원 합류 시
duration: 4-8시간
prerequisites:
  - GitHub 계정
  - Vercel 계정
  - Railway 계정 (선택)
---

# 👋 신규 개발자 온보딩 워크플로우

## 📋 개요

새로운 팀원이 DocTranslation 프로젝트에 빠르게 적응하고 첫 기여를 할 수 있도록 안내합니다.

---

## ✅ Day 1: 환경 설정 및 프로젝트 이해

### Step 1: 프로젝트 구조 파악

**읽어야 할 문서** (순서대로):

1. `README.md` - 프로젝트 개요
2. `NewPlan.md` - 아키텍처 및 기술 스택
3. `.agent/brain/implementation_plan.md` - 상세 구현 계획
4. `.agent/rules/GLOBAL_RULES.md` - 협업 규칙
5. `.agent/rules/CODING_STANDARDS.md` - 코딩 표준

**예상 소요 시간**: 1-2시간

**체크리스트**:

- [ ] 프로젝트의 핵심 목표 이해
- [ ] 기술 스택 파악 (Next.js, Python, Supabase 등)
- [ ] Monorepo 구조 이해 (apps, packages)

---

### Step 2: 개발 환경 세팅

**2.1. 필수 도구 설치**

// turbo

```bash
# Node.js (v18 이상)
node --version

# Python (3.11 이상)
python --version

# Git
git --version
```

**2.2. 저장소 클론**

```bash
git clone https://github.com/your-org/DocTranslation.git
cd DocTranslation
```

**2.3. 의존성 설치**

// turbo

```bash
# Node.js 의존성
npm install

# Python 가상환경 생성
cd apps/worker
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

**2.4. 환경 변수 설정**

**Next.js (`apps/web/.env.local`)**:

```env
# 팀 리더에게 요청하여 값 입력
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Python Worker (`apps/worker/.env`)**:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
GEMINI_API_KEY=
```

**보안 주의**:

- ⚠️ 절대 `.env` 파일을 Git에 커밋하지 마세요
- ⚠️ API Key를 팀 채팅에 평문으로 공유하지 마세요 (1Password 등 사용)

---

### Step 3: 로컬 실행 테스트

**3.1. Next.js 웹 앱 실행**

// turbo

```bash
cd apps/web
npm run dev
```

**예상 결과**:

- `http://localhost:3000` 접속 가능
- 로그인 페이지 또는 대시보드 표시

**문제 발생 시**:

- 환경 변수 누락 → `.env.local` 확인
- 포트 충돌 → `PORT=3001 npm run dev`

**3.2. Python Worker 실행** (선택)

```bash
cd apps/worker
source venv/bin/activate
python queue_worker.py
```

**예상 결과**:

```
🎧 Worker started. Listening for jobs...
```

---

### Step 4: 첫 커밋 만들기 (Hello World)

**4.1. 브랜치 생성**

```bash
git checkout -b onboarding/add-your-name
```

**4.2. CONTRIBUTORS.md에 이름 추가**

파일이 없다면 생성:

```markdown
# Contributors

- **홍길동** - Full Stack Developer (2026-02-01)
- **[당신의 이름]** - [역할] (2026-02-XX)
```

**4.3. 커밋 및 푸시**

```bash
git add CONTRIBUTORS.md
git commit -m "docs: Add [Your Name] to contributors"
git push origin onboarding/add-your-name
```

**4.4. Pull Request 생성**

1. GitHub 저장소 → Pull Requests → New Pull Request
2. 제목: `[Onboarding] Add [Your Name] to contributors`
3. 설명: 간단한 자기소개
4. 팀원에게 리뷰 요청

**목표**: PR 프로세스 이해 및 첫 기여 완료

---

## ✅ Day 2: 코드베이스 탐색 및 작은 기여

### Step 5: 코드 탐색 (Code Reading)

**권장 순서**:

1. **Next.js 라우팅**: `apps/web/src/app/`
   - `page.tsx` 파일들 확인
   - Server Actions (`actions/`) 살펴보기

2. **Python Worker**: `apps/worker/`
   - `queue_worker.py` - 메인 루프
   - `core/translator.py` - 번역 로직
   - `core/parsers/` - 문서 파서

3. **공통 타입**: `packages/database/`
   - Supabase 타입 정의

**코드 리딩 팁**:

- IDE에서 "Go to Definition" (F12) 활용
- 함수 호출 체인 따라가기
- 주석 및 JSDoc 읽기

---

### Step 6: 첫 번째 실제 기여 (Good First Issue)

팀 리더가 지정한 "Good First Issue"를 해결합니다.

**예시 작업**:

- UI 텍스트 수정
- 에러 메시지 개선
- 테스트 케이스 추가
- 문서 오타 수정

**절차**:

1. GitHub Issues → `label:good-first-issue` 필터
2. 이슈 선택 및 Assign
3. 브랜치 생성: `git checkout -b fix/issue-123`
4. 코드 수정
5. 테스트 실행: `npm test`
6. 커밋 및 PR 생성
7. 리뷰 받고 머지

---

## ✅ Day 3-5: 독립적인 작업 시작

### Step 7: 워크플로우 학습

실제 작업 시 사용할 워크플로우 숙지:

**필수**:

- [ ] `.agent/workflows/debug.md` - 버그 디버깅 방법
- [ ] `.agent/workflows/deploy.md` - 배포 절차
- [ ] `.agent/workflows/feature.md` - 기능 개발 프로세스

**권장**:

- [ ] `.agent/rules/CODING_STANDARDS.md` 재확인
- [ ] `.agent/personas/@The-Reviewer.md` - 코드 리뷰 기준

---

### Step 8: 첫 FeaturePull Request

팀 리더와 협의하여 작은 기능을 직접 구현합니다.

**예시**:

- 업로드 파일 확장자 표시
- 번역 진행률 퍼센트 표시
- 다크 모드 토글 추가

**체크리스트**:

- [ ] 구현 계획 작성 (간단한 메모)
- [ ] 코드 작성
- [ ] 단위 테스트 작성
- [ ] ESLint/Prettier 통과
- [ ] PR 생성 및 리뷰 요청
- [ ] 피드백 반영
- [ ] 머지 완료

---

## ✅ 완료 확인

온보딩 완료 시 다음을 달성해야 합니다:

**기술적 역량**:

- [ ] 로컬 개발 환경 구축 완료
- [ ] 프로젝트 구조 이해
- [ ] Git 워크플로우 숙지 (브랜치, PR, 리뷰)
- [ ] 최소 2개 이상의 PR 머지

**문화적 이해**:

- [ ] 코딩 표준 숙지
- [ ] 협업 규칙 이해 (한국어 우선, 보고 양식 등)
- [ ] 팀원들과 소통 채널 파악

**자율성**:

- [ ] 막힐 때 어디서 답을 찾을지 알고 있음
- [ ] 독립적으로 작은 이슈 해결 가능
- [ ] 도움 요청 방법 숙지

---

## 🆘 도움 요청 방법

### 막힐 때 순서

1. **문서 확인**: `.agent/` 폴더에 관련 가이드가 있는지 확인
2. **코드 검색**: 유사한 구현이 있는지 `grep` 또는 IDE 검색
3. **팀원 질문**: Slack/Discord에 질문 (30분 이상 막혔을 때)
4. **페어 프로그래밍**: 복잡한 문제는 팀원과 함께 해결

### 질문하는 방법

**좋은 질문 예시**:

```
[질문] Next.js Server Action에서 Supabase 호출 시 타입 에러

**상황**:
- apps/web/src/app/actions/translation.ts 파일 수정 중
- Supabase의 translation_jobs 테이블에 INSERT 시도

**에러 메시지**:
```

Type 'unknown' is not assignable to type 'TranslationJob'

```

**시도한 것**:
- Supabase 타입 재생성 (`npm run generate-types`)
- TypeScript 재시작

**코드**:
[링크 또는 스니펫]
```

---

## 📚 추천 학습 자료

### 기술 스택

- [Next.js 15 App Router 가이드](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [FastAPI 튜토리얼](https://fastapi.tiangolo.com/)
- [Turborepo 가이드](https://turbo.build/repo/docs)

### 협업 도구

- [Conventional Commits](https://www.conventionalcommits.org/)
- [코드 리뷰 Best Practices](링크)

---

## 🎓 온보딩 후 다음 단계

1주일 후:

- [ ] 팀 회고 참여
- [ ] 첫 번째 중간 크기 기능 개발 (3-5일 소요)

1개월 후:

- [ ] 독립적으로 기능 설계 및 구현
- [ ] 다른 팀원 PR 리뷰 시작

3개월 후:

- [ ] 아키텍처 결정에 참여
- [ ] 신규 팀원 온보딩 지원

---

**온보딩 완료를 축하합니다! 🎉**
궁금한 점은 언제든 팀에 질문하세요.
