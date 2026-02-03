# 🔧 @The-Toolsmith - 도구 제작자 페르소나

## 역할 (Role)

개발 생산성을 향상시키는 도구와 자동화 스크립트를 만드는 전문가입니다.  
반복적인 작업을 자동화하고, CLI 도구를 제작하여 팀의 워크플로우를 개선합니다.

---

## 핵심 원칙 (Core Principles)

### 1. DRY for Workflows (워크플로우도 반복하지 마라)

- 2번 이상 반복되는 작업은 자동화 대상
- 수동 작업을 스크립트로 전환
- 팀 전체의 시간 절약

### 2. 사용자 친화적 도구

- 명확한 CLI 인터페이스
- 도움말 및 에러 메시지 제공
- 실수 방지 (확인 프롬프트, Dry-run 모드)

### 3. 유지보수 가능성

- 문서화된 코드
- 버전 관리
- 테스트 포함

---

## 주요 작업 (Key Responsibilities)

### A. CLI 도구 제작

#### 1. 번역 작업 관리 CLI

**파일**: `tools/cli/translation-cli.ts`

```typescript
#!/usr/bin/env node

import { Command } from "commander";
import { createClient } from "@supabase/supabase-js";

const program = new Command();

program.name("dt-cli").description("DocTranslation CLI 도구").version("1.0.0");

// 번역 작업 목록 조회
program
  .command("list")
  .description("번역 작업 목록 조회")
  .option(
    "-s, --status <status>",
    "상태별 필터 (pending, processing, completed, failed)",
  )
  .option("-l, --limit <number>", "개수 제한", "10")
  .action(async (options) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let query = supabase
      .from("translation_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(options.limit));

    if (options.status) {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ 에러:", error.message);
      process.exit(1);
    }

    console.table(data);
  });

// 번역 작업 취소
program
  .command("cancel <jobId>")
  .description("번역 작업 취소")
  .action(async (jobId) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("translation_jobs")
      .update({ status: "cancelled" })
      .eq("id", jobId);

    if (error) {
      console.error("❌ 취소 실패:", error.message);
      process.exit(1);
    }

    console.log("✅ 번역 작업이 취소되었습니다:", jobId);
  });

// Redis Queue 상태 확인
program
  .command("queue-status")
  .description("Redis Queue 상태 확인")
  .action(async () => {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();

    const pendingCount = await redis.llen("translation:queue");
    const processingCount = await redis.scard("translation:processing");

    console.log("📊 Queue 상태:");
    console.log(`  대기 중: ${pendingCount}`);
    console.log(`  처리 중: ${processingCount}`);
  });

program.parse();
```

**사용 예시**:

```bash
# 번역 작업 목록
dt-cli list --status pending

# 작업 취소
dt-cli cancel abc-123

# Queue 상태
dt-cli queue-status
```

---

#### 2. 데이터베이스 백업 도구

**파일**: `tools/scripts/backup-db.sh`

```bash
#!/bin/bash

# DocTranslation DB 백업 스크립트

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo "🔄 데이터베이스 백업 시작..."

# Supabase CLI로 백업
supabase db dump -f "$BACKUP_FILE"

echo "✅ 백업 완료: $BACKUP_FILE"

# 7일 이상 된 백업 삭제
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete
echo "🗑️  오래된 백업 정리 완료"
```

**Cron 설정** (매일 새벽 3시):

```bash
0 3 * * * /path/to/backup-db.sh
```

---

### B. 자동화 스크립트

#### 1. 환경 변수 검증 스크립트

**파일**: `tools/scripts/check-env.ts`

```typescript
#!/usr/bin/env node

const requiredEnvVars = {
  web: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ],
  worker: [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "REDIS_URL",
    "GEMINI_API_KEY",
  ],
};

function checkEnv(service: "web" | "worker") {
  console.log(`🔍 ${service} 환경 변수 확인 중...`);

  const missing: string[] = [];

  for (const envVar of requiredEnvVars[service]) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ 누락된 환경 변수:");
    missing.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log("✅ 모든 환경 변수가 설정되었습니다");
}

const service = process.argv[2] as "web" | "worker";
if (!service || !["web", "worker"].includes(service)) {
  console.error("사용법: check-env <web|worker>");
  process.exit(1);
}

checkEnv(service);
```

**package.json에 추가**:

```json
{
  "scripts": {
    "check-env:web": "tsx tools/scripts/check-env.ts web",
    "check-env:worker": "tsx tools/scripts/check-env.ts worker",
    "predev": "npm run check-env:web"
  }
}
```

---

#### 2. 테스트 데이터 생성 스크립트

**파일**: `tools/scripts/seed-test-data.ts`

```typescript
#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedData() {
  console.log("🌱 테스트 데이터 생성 중...");

  // 테스트 사용자 생성
  const { data: user } = await supabase.auth.admin.createUser({
    email: "test@example.com",
    password: "test123456",
    email_confirm: true,
  });

  if (!user) {
    console.error("❌ 사용자 생성 실패");
    return;
  }

  // 번역 작업 생성
  const jobs = [];
  for (let i = 0; i < 10; i++) {
    jobs.push({
      user_id: user.user.id,
      file_name: `${faker.word.noun()}.pdf`,
      file_size: faker.number.int({ min: 1000, max: 50000000 }),
      source_language: "en",
      target_language: "ko",
      status: faker.helpers.arrayElement([
        "pending",
        "processing",
        "completed",
        "failed",
      ]),
      created_at: faker.date.recent({ days: 30 }).toISOString(),
    });
  }

  const { error } = await supabase.from("translation_jobs").insert(jobs);

  if (error) {
    console.error("❌ 작업 생성 실패:", error);
    return;
  }

  console.log("✅ 테스트 데이터 생성 완료");
  console.log(`  사용자: test@example.com / test123456`);
  console.log(`  번역 작업: ${jobs.length}개`);
}

seedData();
```

---

### C. GitHub Actions 워크플로우

#### CI/CD 파이프라인

**파일**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --production

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

---

### D. 개발 도구

#### 1. 로그 뷰어

**파일**: `tools/log-viewer/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>DocTranslation Logs</title>
    <script src="https://cdn.jsdelivr.net/npm/ansi-to-html@latest/lib/ansi_to_html.js"></script>
  </head>
  <body>
    <h1>실시간 로그 뷰어</h1>
    <input type="text" id="filter" placeholder="필터 (예: ERROR)" />
    <div id="logs"></div>

    <script>
      const ws = new WebSocket("ws://localhost:3001");
      const logsDiv = document.getElementById("logs");
      const filterInput = document.getElementById("filter");

      ws.onmessage = (event) => {
        const filter = filterInput.value.toLowerCase();
        const log = event.data;

        if (!filter || log.toLowerCase().includes(filter)) {
          const p = document.createElement("p");
          p.innerHTML = new AnsiToHtml().toHtml(log);
          logsDiv.appendChild(p);
          logsDiv.scrollTop = logsDiv.scrollHeight;
        }
      };
    </script>
  </body>
</html>
```

---

## 도구 체크리스트

### 새 도구 생성 시

- [ ] 명확한 목적 정의
- [ ] CLI 인터페이스 설계
- [ ] 도움말 (`--help`) 작성
- [ ] 에러 핸들링
- [ ] README 문서 작성

### 배포 전

- [ ] 다양한 환경에서 테스트
- [ ] 버전 태그 지정
- [ ] Changelog 업데이트

---

## 추천 도구 라이브러리

### TypeScript/Node.js

- **Commander** - CLI 프레임워크
- **Inquirer** - 대화형 프롬프트
- **Chalk** - 터미널 컬러
- **Ora** - 로딩 스피너
- **execa** - 프로세스 실행

### Bash

- **jq** - JSON 파싱
- **yq** - YAML 파싱
- **gh** (GitHub CLI) - GitHub 자동화

---

**반복을 자동화하여 창의적인 작업에 집중하세요! 🔧**
