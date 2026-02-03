---
description: Smart Commit Protocol
triggers: 코드 변경 사항을 커밋할 때마다
duration: 2-5분
prerequisites:
  - Git 설치 및 설정 완료
  - 작업 브랜치 생성 완료
---

# 💾 스마트 커밋 프로토콜

## 📋 개요

명확하고 추적 가능한 Git 커밋을 작성하기 위한 가이드입니다.
Conventional Commits 표준을 따르며, 자동화 도구와 연동 가능합니다.

---

## 🎯 커밋 메시지 형식

### 기본 구조

```
<type>(<scope>): <subject>

<body>

<footer>
```

**예시**:

```
feat(auth): Add Google OAuth login

Implement Google OAuth 2.0 authentication flow:
- Add @supabase/auth-helpers-nextjs
- Create /auth/callback route
- Add Google provider button to login page

Closes #42
```

---

## 📝 Type (커밋 유형)

| Type       | 설명                         | 예시                                          |
| ---------- | ---------------------------- | --------------------------------------------- |
| `feat`     | 새로운 기능 추가             | `feat(upload): Add drag-and-drop file upload` |
| `fix`      | 버그 수정                    | `fix(translation): Handle empty file error`   |
| `docs`     | 문서 변경                    | `docs(readme): Update installation guide`     |
| `style`    | 코드 포맷팅 (기능 변경 없음) | `style(components): Run prettier`             |
| `refactor` | 코드 리팩토링                | `refactor(api): Extract validation logic`     |
| `perf`     | 성능 개선                    | `perf(worker): Cache Gemini API responses`    |
| `test`     | 테스트 추가/수정             | `test(auth): Add login integration tests`     |
| `build`    | 빌드 시스템 변경             | `build(deps): Upgrade Next.js to 15.1`        |
| `ci`       | CI/CD 설정 변경              | `ci(github): Add security scan workflow`      |
| `chore`    | 기타 작업                    | `chore(git): Update .gitignore`               |
| `revert`   | 이전 커밋 되돌리기           | `revert: Revert "feat: Add feature X"`        |

---

## 🎯 Scope (영향 범위)

**선택 사항**이지만 권장합니다.

**프로젝트별 Scope 예시**:

- `auth` - 인증 관련
- `upload` - 파일 업로드
- `translation` - 번역 기능
- `ui` - UI 컴포넌트
- `api` - API 라우트
- `worker` - Python Worker
- `db` - 데이터베이스 스키마

**예시**:

```
feat(translation): Add language detection
fix(auth): Prevent duplicate user creation
docs(api): Update translation endpoint spec
```

---

## ✍️ Subject (제목)

**규칙**:

1. **명령형 현재 시제** 사용
   - ✅ "Add feature" (명령형)
   - ❌ "Added feature" (과거형)
   - ❌ "Adds feature" (3인칭)

2. **첫 글자 소문자** (type 다음)
   - ✅ `feat: add new button`
   - ❌ `feat: Add new button`

3. **50자 이하**
   - 길면 본문에 상세 설명 추가

4. **마침표 없음**
   - ✅ `fix: resolve login issue`
   - ❌ `fix: resolve login issue.`

5. **한국어도 가능** (팀 규칙에 따라)
   - `feat(auth): 구글 OAuth 로그인 추가`

---

## 📄 Body (본문)

**선택 사항**이지만, 복잡한 변경 사항은 본문 작성 권장

**내용**:

- **무엇을** 변경했는지
- **왜** 변경했는지
- **어떻게** 변경했는지

**규칙**:

- 제목과 한 줄 띄우기
- 72자마다 줄바꿈
- 불릿 포인트 사용 가능 (`-`, `*`)

**예시**:

```
feat(upload): Add file type validation

Prevent users from uploading unsupported file types:
- Check file extension against whitelist
- Validate MIME type
- Verify magic bytes to prevent spoofing

This prevents errors in the translation worker and
improves user experience by providing immediate feedback.
```

---

## 🔗 Footer (꼬리말)

**용도**:

1. **이슈 연결**
2. **Breaking Changes 표시**
3. **Co-authored 표시**

### 1. 이슈 연결

```
Closes #123
Fixes #456
Resolves #789
Refs #101
```

**여러 이슈**:

```
Closes #123, #456
```

---

### 2. Breaking Changes

**형식**:

```
BREAKING CHANGE: <설명>
```

**예시**:

```
feat(api): Change translation endpoint response format

BREAKING CHANGE: Response now returns `translatedText` instead of `result`.
Migration guide: https://docs.example.com/migration-v2
```

**또는 제목에 `!` 추가**:

```
feat(api)!: Change translation API response format
```

---

### 3. Co-authored

```
Co-authored-by: Name <email@example.com>
```

---

## 🔄 실행 단계

### Step 1: 변경 사항 스테이징

```bash
# 특정 파일만
git add src/components/Button.tsx

# 모든 변경 사항
git add .

# 인터랙티브 모드 (부분 스테이징)
git add -p
```

---

### Step 2: 커밋 메시지 작성

**방법 1: 한 줄 커밋**

```bash
git commit -m "feat(ui): Add loading spinner"
```

**방법 2: 에디터에서 작성** (본문 포함 시)

```bash
git commit

# 에디터가 열리면 다음과 같이 작성:
```

```
feat(upload): Add file size validation

Prevent uploads larger than 50MB:
- Add MAX_FILE_SIZE constant
- Check file size before upload
- Display error message to user

This prevents server timeouts and improves UX.

Closes #234
```

**방법 3: AI 도움 받기**

```bash
# GitHub Copilot CLI (설치 시)
git add .
gh copilot suggest "git commit"

# 또는 직접 요청
# "다음 변경 사항에 대한 커밋 메시지를 작성해주세요: [변경 내용]"
```

---

### Step 3: 커밋 검증

**커밋 전 체크리스트**:

- [ ] Type이 올바른가?
- [ ] Subject가 명령형 현재 시제인가?
- [ ] 50자 이하인가?
- [ ] 이슈 번호가 포함되었는가? (있다면)

**commitlint 사용** (자동 검증):

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"]
}

# package.json
{
  "scripts": {
    "commit": "git-cz"
  }
}
```

---

### Step 4: 커밋 수정 (필요시)

**마지막 커밋 메시지 수정**:

```bash
git commit --amend

# 또는 메시지만 수정
git commit --amend -m "fix(auth): Correct login validation"
```

**⚠️ 주의**: 이미 푸시한 커밋은 amend 지양 (force push 필요)

---

## 💡 커밋 Best Practices

### DO ✅

1. **작은 단위로 자주 커밋**

   ```bash
   # ✅ 좋음
   git commit -m "feat(ui): Add login button"
   git commit -m "feat(ui): Add login form validation"

   # ❌ 나쁨 (너무 큼)
   git commit -m "feat: Implement entire login system"
   ```

2. **원자적 커밋 (Atomic Commits)**
   - 하나의 커밋은 하나의 논리적 변경만 포함
   - 테스트가 실패하는 커밋은 피함

3. **의미 있는 제목**

   ```bash
   # ✅ 좋음
   git commit -m "fix(auth): Prevent duplicate session creation"

   # ❌ 나쁨
   git commit -m "fix: bug fix"
   git commit -m "chore: update code"
   ```

4. **관련 파일만 커밋**

   ```bash
   # 관련 없는 변경은 별도 커밋
   git add src/components/LoginForm.tsx
   git commit -m "feat(auth): Add login form"

   git add src/components/Button.tsx
   git commit -m "refactor(ui): Extract Button component"
   ```

---

### DON'T ❌

1. **"WIP" 커밋 남기지 않기**

   ```bash
   # ❌ 나쁨
   git commit -m "WIP"
   git commit -m "fix stuff"

   # ✅ 완료 후 커밋
   git commit -m "feat(upload): Complete file upload feature"
   ```

2. **너무 많은 파일 한 번에 커밋**
   - 리뷰가 어려움
   - 문제 발생 시 원인 찾기 어려움

3. **민감한 정보 커밋**
   ```bash
   # ❌ 절대 금지
   git add .env
   git commit -m "chore: add env file"
   ```

---

## 🤖 자동화 도구

### Commitizen (대화형 커밋)

**설치**:

```bash
npm install --save-dev commitizen cz-conventional-changelog

# package.json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

**사용**:

```bash
git add .
npm run commit

# 대화형 프롬프트:
# ? Select the type of change: (Use arrow keys)
# ❯ feat:     A new feature
#   fix:      A bug fix
#   docs:     Documentation only changes
# ...
```

---

### Husky (Git Hooks)

**커밋 전 자동 검증**:

```bash
npm install --save-dev husky

# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit $1
```

**효과**:

```bash
git commit -m "bad message"
# ✗ commit message does not follow conventional commits format
# ✗ type must be one of [feat, fix, docs, ...]
```

---

## 📊 커밋 히스토리 예시

**좋은 커밋 히스토리**:

```
* feat(upload): Add progress bar for file uploads
* test(upload): Add integration tests for upload flow
* refactor(upload): Extract file validation logic
* fix(auth): Resolve token expiration bug
* docs(readme): Update API documentation
```

**나쁜 커밋 히스토리**:

```
* fix
* update
* WIP
* asdf
* final version
* final version 2
```

---

## 🔍 커밋 탐색

**특정 타입의 커밋만 보기**:

```bash
git log --oneline --grep="^feat"
git log --oneline --grep="^fix"
```

**특정 파일의 커밋 히스토리**:

```bash
git log --follow -- src/components/Button.tsx
```

**커밋 통계**:

```bash
git shortlog -sn --no-merges
# 커밋 개수를 기여자별로 표시
```

---

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

---

**명확한 커밋 메시지로 미래의 자신과 팀원들을 도와주세요! 💾**
