# 🚀 DocTranslation 기술 스택 (Tech Stack)

## 아키텍처 개요 (Architecture Overview)

```
┌─────────────────────┐
│   User (Browser)    │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Next.js 15 │ (Vercel 배포)
    │  App Router │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────┐
    │  Supabase Platform         │
    │  ┌──────┬────────┬────────┐ │
    │  │  DB  │Storage│ Auth   │ │
    │  └──────┴────────┴────────┘ │
    └──────┬──────────────────────┘
           │
    ┌──────▼──────┐
    │ Redis Queue │ (Upstash)
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │ Python Worker   │ (Railway/Fly.io)
    │ FastAPI + Gemini│
    └─────────────────┘
```

## 기술 선정 근거 (Technology Justification)

### 1. Frontend: Next.js 15 (App Router)

#### 선정 이유

- **Server Components**: 데이터 페칭을 서버에서 처리하여 클라이언트 번들 크기 감소
- **Server Actions**: API Routes 없이도 서버 로직 직접 호출 가능
- **Turbopack**: Webpack 대비 5배 빠른 빌드 속도
- **Edge Runtime**: Vercel Edge에서 전 세계적으로 낮은 지연시간

#### 대안 분석

| 기술         | 장점                      | 단점          | 선택 여부   |
| ------------ | ------------------------- | ------------- | ----------- |
| Next.js 15   | 올인원 솔루션, SEO 최적화 | 학습 곡선     | ✅ **채택** |
| Vite + React | 빠른 개발 환경            | SSR 설정 복잡 | ❌          |
| Remix        | 훌륭한 DX                 | 생태계 작음   | ❌          |

#### 설치 및 설정

```bash
# Monorepo 내에서
cd apps
npx create-next-app@latest web --typescript --tailwind --app --src-dir
```

**핵심 패키지**:

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "@supabase/ssr": "^0.5.0",
    "zod": "^3.22.0",
    "@upstash/redis": "^1.28.0",
    "framer-motion": "^11.0.0"
  }
}
```

---

### 2. Language: TypeScript (Strict Mode)

#### 선정 이유

- **Type Safety**: 컴파일 타임에 에러 90% 사전 차단
- **IntelliSense**: VS Code에서 자동 완성 지원
- **Refactoring**: 대규모 코드 변경 시 안전성 보장

#### 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 3. Worker: FastAPI (Python 3.11+)

#### 선정 이유

- **Async Native**: `async/await`로 I/O 병목 없이 동시 처리
- **Type Hints**: Pydantic으로 런타임 검증
- **성능**: Node.js 대비 CPU-intensive 작업(파싱, 압축)에서 우수
- **라이브러리**: `python-docx`, `openpyxl`, `python-pptx` 등 성숙한 문서 처리 도구

#### 대안 분석

| 기술           | 장점                   | 단점                      | 선택 여부   |
| -------------- | ---------------------- | ------------------------- | ----------- |
| FastAPI        | 비동기 지원, 빠른 속도 | 배포 복잡도 약간 높음     | ✅ **채택** |
| Node.js Worker | 기존 JS 생태계 활용    | 문서 파싱 라이브러리 부족 | ❌          |
| Django         | 안정적                 | 동기 중심, 오버킬         | ❌          |

#### 설치 및 설정

```bash
cd apps/worker
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-docx openpyxl python-pptx google-generativeai redis supabase
```

**requirements.txt**:

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-docx==1.1.0
openpyxl==3.1.2
python-pptx==0.6.23
google-generativeai==0.3.2
redis==5.0.1
supabase==2.3.4
python-magic==0.4.27
```

---

### 4. Database & Storage: Supabase

#### 선정 이유

- **올인원**: Postgres + Storage + Auth + Realtime을 단일 플랫폼에서 제공
- **Row-Level Security (RLS)**: SQL 레벨에서 사용자별 데이터 격리
- **Realtime Subscriptions**: WebSocket으로 작업 진행률 자동 업데이트
- **무료 티어**: 500MB 스토리지 + 50,000 월간 활성 사용자

#### 대안 분석

| 기술           | 장점                | 단점                       | 선택 여부   |
| -------------- | ------------------- | -------------------------- | ----------- |
| Supabase       | 빠른 개발, RLS 강력 | 커스터마이징 제한          | ✅ **채택** |
| Firebase       | Google 생태계 통합  | NoSQL (복잡한 쿼리 어려움) | ❌          |
| AWS (RDS + S3) | 최고 성능           | 설정 복잡, 비용 높음       | ❌          |

#### 스키마 설계

```sql
-- translation_jobs 테이블
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file_url TEXT NOT NULL,
  target_file_url TEXT,
  source_lang VARCHAR(10) DEFAULT 'auto',
  target_lang VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
ON translation_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
ON translation_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

### 5. Queue: Redis (Upstash)

#### 선정 이유

- **속도**: 메모리 기반, 초당 100만 건 처리 가능
- **BullMQ 통합**: Node.js와 Python 모두 지원
- **Managed Service (Upstash)**: 서버리스 Redis, 사용량만큼 과금

#### 대안 분석

| 기술            | 장점                | 단점                        | 선택 여부   |
| --------------- | ------------------- | --------------------------- | ----------- |
| Redis (Upstash) | 저지연, 관리 불필요 | 메모리 제한 (장시간 보관 X) | ✅ **채택** |
| AWS SQS         | 무제한 확장         | 지연시간 높음 (초 단위)     | ❌          |
| RabbitMQ        | 복잡한 라우팅 가능  | 직접 관리 필요              | ❌          |

#### 설정

```typescript
// apps/web/src/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

// 작업 푸시
await redis.lpush("translation:queue", JSON.stringify({ job_id, file_path }));
```

```python
# apps/worker/queue.py
from redis import Redis
import os

redis_client = Redis.from_url(os.getenv('REDIS_URL'))

# 작업 대기 (Blocking)
while True:
    result = redis_client.brpop('translation:queue', timeout=5)
    if result:
        _, job_json = result
        process_job(json.loads(job_json))
```

---

### 6. AI Engine: Google Gemini 2.0 Flash

#### 선정 이유

- **Long Context Window**: 최대 100만 토큰 (문서 전체를 한 번에 전송 가능)
- **빠른 속도**: GPT-4 Turbo 대비 2배 빠름
- **비용 효율**: 1M 토큰당 $0.075 (GPT-4 Turbo는 $10)
- **JSON 모드**: 구조화된 출력 강제 가능

#### 대안 분석

| 모델              | 속도   | 비용   | 품질   | 선택 여부          |
| ----------------- | ------ | ------ | ------ | ------------------ |
| Gemini 2.0 Flash  | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ **채택**        |
| GPT-4 Turbo       | ⭐⭐   | ⭐     | ⭐⭐⭐ | ❌ (비용)          |
| Claude 3.5 Sonnet | ⭐⭐   | ⭐⭐   | ⭐⭐⭐ | ❌ (컨텍스트 제한) |

#### 사용 예시

```python
import google.generativeai as genai

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash-exp')

response = model.generate_content(
    prompt,
    generation_config={
        "response_mime_type": "application/json",
        "temperature": 0.3  # 일관성 중시
    }
)
```

---

### 7. UI Components: Shadcn UI + Tailwind CSS

#### 선정 이유

- **Zero Runtime**: 컴포넌트를 복사해서 사용 (번들 크기 증가 없음)
- **커스터마이징**: 소스 코드를 직접 수정 가능
- **Accessibility**: ARIA 속성 기본 적용
- **Tailwind 통합**: 유틸리티 클래스로 빠른 스타일링

#### 설치

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog
```

---

### 8. Monorepo: Turborepo

#### 선정 이유

- **빌드 캐싱**: 변경된 패키지만 재빌드
- **병렬 실행**: 여러 앱/패키지 동시 빌드
- **공유 설정**: ESLint, TypeScript 설정 중앙 관리

#### 설정

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

## 배포 전략 (Deployment Strategy)

| 레이어              | 플랫폼   | 이유                                  |
| ------------------- | -------- | ------------------------------------- |
| **Web (Next.js)**   | Vercel   | Edge Network, Zero Config, 자동 HTTPS |
| **Worker (Python)** | Railway  | Docker 지원, 간단한 배포, 합리적 가격 |
| **Database**        | Supabase | Managed Service, 백업 자동화          |
| **Redis**           | Upstash  | 서버리스, 사용량 기반 과금            |

---

## 개발 도구 (Development Tools)

- **VS Code Extensions**:
  - Prettier
  - ESLint
  - Python (Pylance)
  - Tailwind CSS IntelliSense

- **Linting**:

  ```bash
  npm run lint          # Next.js
  ruff check apps/worker  # Python
  ```

- **Testing**:
  ```bash
  npm test              # Vitest (Unit Tests)
  npx playwright test   # E2E Tests
  pytest apps/worker    # Python Tests
  ```
