---
description: 프로덕션 애플리케이션 보안 감사 절차
triggers: 월 1회 정기 감사 또는 중요 기능 배포 전
duration: 2-4시간
prerequisites:
  - 보안 스캔 도구 설치
  - 프로덕션 환경 접근 권한
---

# 🛡️ 보안 감사 워크플로우

## 📋 개요

애플리케이션의 보안 취약점을 체계적으로 점검하고 개선하는 프로세스입니다.
OWASP Top 10 기준을 따르며, 자동화 도구와 수동 점검을 병행합니다.

---

## 🔄 실행 단계

### Phase 1: 자동화 보안 스캔

#### Step 1.1: 의존성 취약점 스캔

**npm audit (Node.js)**:

```bash
cd apps/web
npm audit --production

# 취약점 발견 시 자동 수정 시도
npm audit fix

# 수동 확인이 필요한 경우
npm audit fix --force  # ⚠️ Breaking change 가능성 있음
```

**예상 결과**:

```
found 0 vulnerabilities
```

**문제 발견 시**:

1. 취약점 상세 내용 확인
2. 대체 패키지 검색 또는 버전 업그레이드
3. `.agent/memory/SECURITY_LOG.md`에 기록

---

**pip-audit (Python)**:

```bash
cd apps/worker
source venv/bin/activate
pip install pip-audit
pip-audit
```

**취약점 발견 시**:

```bash
# requirements.txt 업데이트
pip install --upgrade [패키지명]
pip freeze > requirements.txt
```

---

#### Step 1.2: Secret 누출 스캔

**TruffleHog (Git History 전체 스캔)**:

```bash
# 전역 설치
brew install trufflehog  # Mac
# 또는
docker run --rm -it -v "$PWD:/pwd" trufflesecurity/trufflehog:latest git file:///pwd

# 실행
trufflehog git file://. --only-verified
```

**발견되면 안 되는 것들**:

- API Keys (Gemini, Supabase, Upstash)
- Database Credentials
- JWT Secret
- Private Keys

**⚠️ Secret 발견 시 즉각 조치**:

1. 해당 Secret 즉시 회전 (Rotate)
2. GitHub에서 커밋 히스토리 정리 (`git filter-branch` 또는 BFG Repo-Cleaner)
3. 사고 보고서 작성

---

#### Step 1.3: 코드 정적 분석 (SAST)

**ESLint Security Plugin**:

```bash
cd apps/web
npm install --save-dev eslint-plugin-security

# .eslintrc.json에 추가
# "plugins": ["security"],
# "extends": ["plugin:security/recommended"]

npm run lint
```

**점검 항목**:

- SQL Injection 가능성
- XSS (Cross-Site Scripting)
- 안전하지 않은 정규식
- `eval()` 사용

---

**Bandit (Python)**:

```bash
cd apps/worker
pip install bandit
bandit -r . -f json -o security-report.json
```

**High/Medium Severity 발견 시 수정**

---

### Phase 2: 인증 및 인가 점검

#### Step 2.1: Supabase RLS 정책 검증

**Supabase Dashboard → Authentication → Policies**

**체크리스트**:

- [ ] 모든 테이블에 RLS 활성화
- [ ] 사용자는 자신의 데이터만 조회 가능
- [ ] 민감한 테이블(users, api_keys)은 적절히 보호됨
- [ ] Anonymous 사용자 접근 제한

**예시 - 잘못된 정책**:

```sql
-- ❌ 모든 사용자가 모든 데이터 조회 가능
CREATE POLICY "Public read access"
  ON translation_jobs FOR SELECT
  USING (true);

-- ✅ 올바른 정책
CREATE POLICY "Users can view their own jobs"
  ON translation_jobs FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### Step 2.2: JWT 토큰 검증

**Next.js Middleware 확인**:

```typescript
// apps/web/src/middleware.ts

import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

**체크리스트**:

- [ ] 보호된 라우트에 인증 미들웨어 적용
- [ ] JWT 만료 시간 적절 (1시간 권장)
- [ ] Refresh Token 구현

---

### Phase 3: 데이터 보호 점검

#### Step 3.1: 환경 변수 검증

**체크리스트**:

- [ ] `.env.local`, `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프로덕션 환경 변수가 Vercel/Railway에만 저장됨
- [ ] API Key가 코드에 하드코딩되지 않음

**검증 명령어**:

```bash
# Git에 커밋된 .env 파일 확인
git log --all --full-history -- "*.env*"

# 결과가 비어있어야 정상
```

---

#### Step 3.2: 파일 업로드 보안

**검증 항목**:

```typescript
// apps/web/src/app/actions/upload.ts

// ✅ 파일 크기 제한
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
if (file.size > MAX_FILE_SIZE) {
  throw new Error("File too large");
}

// ✅ 파일 확장자 검증 (Whitelist)
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const ext = path.extname(file.name).toLowerCase();
if (!ALLOWED_EXTENSIONS.includes(ext)) {
  throw new Error("Invalid file type");
}

// ✅ MIME Type 검증
const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
if (!allowedMimeTypes.includes(file.type)) {
  throw new Error("Invalid MIME type");
}

// ✅ 파일 내용 검증 (Magic Bytes)
import { fileTypeFromBuffer } from "file-type";
const buffer = await file.arrayBuffer();
const fileType = await fileTypeFromBuffer(buffer);
if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
  throw new Error("File content does not match extension");
}
```

---

#### Step 3.3: SQL Injection 방지 확인

**Supabase Client는 기본적으로 SQL Injection 방지**:

```typescript
// ✅ 안전 (Parameterized Query)
const { data } = await supabase
  .from("translation_jobs")
  .select("*")
  .eq("user_id", userId);

// ❌ 위험 (Raw SQL은 사용하지 말 것)
const { data } = await supabase.rpc("execute_raw_sql", {
  query: `SELECT * FROM users WHERE id = '${userId}'`,
});
```

---

### Phase 4: API 보안 점검

#### Step 4.1: Rate Limiting 검증

**Upstash Rate Limit 확인**:

```typescript
// apps/web/src/app/api/translate/route.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 분당 10회
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // 실제 로직...
}
```

**체크리스트**:

- [ ] 모든 Public API에 Rate Limiting 적용
- [ ] 인증된 사용자와 익명 사용자 별도 제한
- [ ] DDoS 공격 대비

---

#### Step 4.2: CORS 설정 확인

**Next.js API Route**:

```typescript
// apps/web/src/middleware.ts

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ✅ 특정 도메인만 허용
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ];

  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // ❌ 모든 도메인 허용 (위험)
  // response.headers.set('Access-Control-Allow-Origin', '*')

  return response;
}
```

---

### Phase 5: 프론트엔드 보안

#### Step 5.1: XSS 방지 확인

**React는 기본적으로 XSS 방지**:

```tsx
// ✅ 안전 (자동 이스케이프)
<div>{userInput}</div>

// ❌ 위험 (dangerouslySetInnerHTML 사용 금지)
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sanitize 후 사용 (필요한 경우)
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

#### Step 5.2: HTTPS 강제 확인

**Vercel은 자동으로 HTTPS 적용**

**추가 보안 헤더**:

```typescript
// next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Clickjacking 방지
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // MIME Sniffing 방지
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains", // HSTS
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

### Phase 6: 수동 침투 테스트 (선택)

#### Step 6.1: 일반적인 공격 시나리오 테스트

**시나리오 1: 권한 상승 (Privilege Escalation)**

```
1. 일반 사용자로 로그인
2. 관리자 전용 API 호출 시도
3. 403 Forbidden이 반환되는지 확인
```

**시나리오 2: IDOR (Insecure Direct Object Reference)**

```
1. 사용자 A로 로그인
2. 사용자 B의 번역 작업 ID로 접근 시도
3. 접근 거부되는지 확인
```

---

## ✅ 완료 확인

보안 감사 완료 시 다음을 모두 확인해야 합니다:

**자동화 스캔**:

- [ ] npm audit: 0 vulnerabilities
- [ ] Secret 스캔: 검출 없음
- [ ] 정적 분석: High/Medium 이슈 0개

**인증 및 인가**:

- [ ] 모든 테이블 RLS 활성화
- [ ] JWT 만료 시간 설정
- [ ] 보호된 라우트 인증 확인

**데이터 보호**:

- [ ] 환경 변수 안전하게 관리
- [ ] 파일 업로드 검증 구현
- [ ] SQL Injection 방지 확인

**API 보안**:

- [ ] Rate Limiting 적용
- [ ] CORS 적절히 설정

**프론트엔드**:

- [ ] XSS 방지 확인
- [ ] 보안 헤더 설정

---

## 📝 감사 보고서 작성

`.agent/memory/SECURITY_AUDIT_{날짜}.md`:

```markdown
# 보안 감사 보고서 - 2026-02-01

## 요약

- 감사 일시: 2026-02-01 15:00 - 17:30
- 감사자: {이름/에이전트}
- 심각도: Low

## 발견 사항

### 🔴 High Severity (긴급 조치 필요)

- 없음

### 🟡 Medium Severity (1주 내 수정)

1. **파일 업로드 MIME Type 검증 누락**
   - 파일: `apps/web/src/app/actions/upload.ts`
   - 조치: Magic Bytes 검증 추가
   - 담당자: @The-Builder
   - 기한: 2026-02-03

### 🟢 Low Severity (1개월 내 개선)

1. **CSP 헤더 미적용**
   - 파일: `next.config.js`
   - 조치: Content-Security-Policy 추가
   - 담당자: @Architect
   - 기한: 2026-03-01

## 조치 완료

- [x] npm audit 취약점 수정 (lodash 4.17.20 → 4.17.21)

## 다음 감사 일정

- 2026-03-01
```

---

## 🚨 High Severity 발견 시 즉각 조치

**즉시 에스컬레이션**:

1. 팀 리더에게 Slack/Discord 긴급 알림
2. 프로덕션 배포 중단 (필요시)
3. 긴급 핫픽스 배포

**예시**:

```
🚨 HIGH SEVERITY: API Key가 GitHub에 노출됨

현황:
- 발견 시간: 2026-02-01 15:30
- 파일: apps/web/.env (커밋 abc123)
- 노출된 Key: GEMINI_API_KEY

즉각 조치:
1. [x] Gemini API Key 회전 완료 (15:32)
2. [x] Vercel 환경 변수 업데이트 (15:35)
3. [ ] Git 히스토리 정리 진행 중
4. [ ] 사고 보고서 작성 예정
```

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [보안 정책](.agent/rules/SECURITY_POLICY.md)

---

**정기적인 보안 감사로 안전한 서비스를 유지하세요! 🛡️**
