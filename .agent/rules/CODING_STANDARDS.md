---
trigger: always_on
---

# 📜 DocTranslation Supreme Protocol (프로젝트 절대 규칙)

이 문서는 프로젝트 내 모든 에이전트와 작업자가 반드시 준수해야 하는 최상위 규칙을 정의합니다. 예외는 없습니다.

## 0. 🇰🇷 Korean First Policy (한국어 우선 정책) - **ABSOLUTE PRIORITY**

모든 출력물은 **한국어**로 작성되어야 합니다.

- **대화 (Conversation)**: 사용자와의 모든 대화는 정중한 한국어(`해요체` 또는 `하십시오체`)를 사용.
- **문서 (Documentation)**: README, 기획서, 가이드 등 모든 문서는 한국어 기준. (국제화 필요 텍스트 제외)
- **주석 (Code Comments)**: 코드 내 모든 설명 주석은 한국어로 작성.
- **커밋 메시지 (Commits)**: `feat: 로그인 기능 추가` 와 같이 한글 설명 포함 권장.

## 1. 👥 Agent Swarm Protocol (에이전트 보고 체계)

모든 답변과 작업은 책임 소재를 명확히 하기 위해 담당 **페르소나(Persona)**를 명시해야 합니다.

### Active Agents (소환 가능한 에이전트)

- **🧑‍💻 @PM (Project Manager)**: 전체 일정 관리, `task.md` 업데이트, 진행 상황 요약.
- **🏗️ @Architect**: 시스템 설계, DB 스키마 정의, 기술 스택 결정.
- **🛡️ @Guardian**: 보안(Security), 인증(Auth), 결제(Payment) 정책 감시.
- **🔨 @Builder**: 실제 코드 구현, 리팩토링, 버그 수정.
- **👮 @Reviewer**: 코드 품질 검사, 컨벤션(Lint/Format) 준수 확인.
- **🎨 @Designer**: UI/UX 디자인, 컴포넌트 스타일링, 반응형 처리.

### Report Format (보고 형식)

모든 답변의 서두 또는 결론에 다음 형식을 사용하여 누가 무엇을 했는지 보고하십시오.

```markdown
### 📢 Agent Report

- **@Architect**: DB 스키마 변경 사항 승인 (profiles 테이블)
- **@Builder**: 자동 로그아웃 타이머 구현 완료
- **@Guardian**: 세션 타임아웃 1시간 정책 검증 완료
- **@PM**: Phase 0.5 - Step 3 체크리스트 갱신 완료
```

## 2. ✅ Checklist Discipline (체크리스트 규율)

작업이 완료될 때마다 반드시 `task.md`를 최신 상태로 갱신해야 합니다.

- 단순히 "했습니다"라고 말하지 말고, **체크박스(`[x]`)가 표시된 `task.md`의 Diff**를 보여주거나 링크를 제공하십시오.
- 작업 전: 계획 수립 및 체크리스트 작성.
- 작업 후: 해당 항목 체크(`[x]`) 및 다음 단계 예고.

## 3. 💻 Coding Conventions (코딩 컨벤션)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Style**: Tailwind CSS
- **State**: Server State(React Query/Server Actions), Client State(Zustand/Context)
- **Database**: Supabase (PostgreSQL)

## 언어별 규칙 (Language-Specific Rules)

### TypeScript (Next.js 15 - apps/web)

#### 1. 엄격한 타입 시스템

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### 2. 네이밍 컨벤션

- **파일명**: `kebab-case.tsx` (예: `upload-form.tsx`)
- **컴포넌트**: `PascalCase` (예: `UploadForm`)
- **함수/변수**: `camelCase` (예: `handleUpload`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)

#### 3. Server Actions 표준

```typescript
// ✅ 좋은 예: apps/web/src/app/actions/translation.ts
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Zod 스키마로 입력 검증
const uploadSchema = z.object({
  file: z.instanceof(File),
  targetLang: z.enum(["Korean", "English", "Japanese", "Chinese"]),
});

export async function uploadFile(formData: FormData) {
  // 1. 입력 검증
  const parsed = uploadSchema.safeParse({
    file: formData.get("file"),
    targetLang: formData.get("targetLang"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 2. 비즈니스 로직
  const supabase = createClient();
  // ...

  // 3. 명시적 반환 타입
  return { success: true, jobId: "..." };
}
```

#### 4. React 컴포넌트 구조

```typescript
// 순서 준수
'use client' // 필요시

import { ... } from 'react'
import { ... } from 'third-party'
import { ... } from '@/components'
import { ... } from '@/lib'

interface Props {
  // Props는 항상 인터페이스로 정의
}

export default function Component({ ... }: Props) {
  // 1. Hooks
  // 2. Event Handlers
  // 3. Derived State
  // 4. JSX Return
}
```

### Python (FastAPI - apps/worker)

#### 1. 타입 힌트 필수

```python
from typing import Optional, List, Dict, Any

# ❌ 나쁜 예
def process(data):
    return data['result']

# ✅ 좋은 예
def process_job(job_data: Dict[str, Any]) -> Optional[str]:
    """
    번역 작업을 처리합니다.

    Args:
        job_data: Redis에서 받은 작업 데이터

    Returns:
        성공 시 작업 ID, 실패 시 None
    """
    return job_data.get('job_id')
```

#### 2. 네이밍 컨벤션

- **파일명**: `snake_case.py` (예: `gemini_client.py`)
- **클래스**: `PascalCase` (예: `DocumentTranslator`)
- **함수/변수**: `snake_case` (예: `translate_batch`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_RETRIES`)

#### 3. 비동기 함수 우선

```python
# ✅ 권장: I/O 작업은 async로
import asyncio
import aiohttp

async def download_file(url: str) -> bytes:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.read()
```

#### 4. 에러 처리

```python
# ✅ 구체적인 예외만 캐치
try:
    result = await risky_operation()
except ValueError as e:
    # ValueError만 처리
    logger.error(f"Invalid value: {e}")
    raise
except Exception as e:
    # 최후의 안전망
    logger.critical(f"Unexpected error: {e}")
    raise
```

## 공통 원칙 (Universal Principles)

### 1. SOLID 원칙

#### S - Single Responsibility

```python
# ❌ 너무 많은 책임
class DocumentProcessor:
    def parse(self): ...
    def translate(self): ...
    def upload(self): ...
    def send_email(self): ...

# ✅ 책임 분리
class DocumentParser:
    def parse(self): ...

class DocumentTranslator:
    def translate(self): ...

class StorageUploader:
    def upload(self): ...
```

#### O - Open/Closed (확장에는 열려있고 수정에는 닫혀있음)

```python
from abc import ABC, abstractmethod

class DocumentParser(ABC):
    @abstractmethod
    def parse(self, file_bytes: bytes) -> List[str]:
        pass

class DOCXParser(DocumentParser):
    def parse(self, file_bytes: bytes) -> List[str]:
        # DOCX 파싱 로직

class XLSXParser(DocumentParser):
    def parse(self, file_bytes: bytes) -> List[str]:
        # XLSX 파싱 로직

# 새로운 형식 추가 시 기존 코드 수정 없이 확장
class PDFParser(DocumentParser):
    def parse(self, file_bytes: bytes) -> List[str]:
        # PDF 파싱 로직
```

#### D - Dependency Inversion

```python
# ✅ 추상화에 의존
class TranslationService:
    def __init__(self, ai_client: AIClient):  # 구체 클래스 대신 인터페이스
        self.ai = ai_client

    def translate(self, text: str) -> str:
        return self.ai.generate(text)

# Gemini 대신 OpenAI로 교체 가능
gemini = GeminiClient()
service = TranslationService(gemini)
```

### 2. DRY (Don't Repeat Yourself)

#### ❌ 중복

```typescript
// 여러 파일에 반복
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

#### ✅ 중앙화

```typescript
// lib/supabase/client.ts
export const createBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 다른 파일에서
import { createBrowserClient } from "@/lib/supabase/client";
const supabase = createBrowserClient();
```

### 3. KISS (Keep It Simple, Stupid)

```python
# ❌ 과도한 추상화
class AbstractFactoryProvider:
    def get_factory(self):
        return Factory().create_builder().build()

# ✅ 단순 명료
def create_translator() -> DocumentTranslator:
    return DocumentTranslator(gemini_api_key=os.getenv('GEMINI_API_KEY'))
```

## 주석 작성 규칙 (Documentation Standards)

### TypeScript - JSDoc

```typescript
/**
 * 파일을 Supabase Storage에 업로드하고 번역 작업을 큐에 추가합니다.
 *
 * @param formData - 파일과 옵션을 포함한 FormData 객체
 * @returns 성공 시 작업 ID, 실패 시 에러 메시지
 *
 * @example
 * const formData = new FormData()
 * formData.append('file', file)
 * formData.append('targetLang', 'Korean')
 * const result = await uploadFile(formData)
 */
export async function uploadFile(formData: FormData): Promise<Result> {
  // ...
}
```

### Python - Google Docstring

```python
def translate_batch(texts: List[str], target_lang: str) -> List[str]:
    """
    텍스트 배열을 Gemini API로 일괄 번역합니다.

    Args:
        texts: 번역할 텍스트 목록 (최대 100개)
        target_lang: 대상 언어 (예: 'Korean', 'English')

    Returns:
        번역된 텍스트 목록 (입력과 동일한 순서)

    Raises:
        ValueError: texts가 빈 리스트인 경우
        APIError: Gemini API 호출 실패 시

    Example:
        >>> translate_batch(['Hello', 'World'], 'Korean')
        ['안녕하세요', '세계']
    """
```

## 테스트 표준 (Testing Standards)

### Unit Test 커버리지 목표

- **핵심 비즈니스 로직**: 100%
- **유틸리티 함수**: 90%
- **UI 컴포넌트**: 70%

### 테스트 네이밍

```python
# ✅ 명확한 테스트 이름
def test_translate_docx_preserves_formatting():
    """DOCX 번역 시 원본 서식이 유지되는지 검증"""

def test_upload_rejects_files_over_50mb():
    """50MB 초과 파일 업로드 시 에러 반환 검증"""
```

## 커밋 메시지 컨벤션 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 리팩토링 (기능 변경 없음)
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**예시**:

```
feat(worker): Gemini 2.0 Flash 통합

- gemini_client.py에서 batch_translate 함수 구현
- JSON 모드 강제로 구조화된 출력 보장
- 최대 100개 텍스트 일괄 처리 지원

Closes #42
```

## 성능 가이드라인

### Next.js

1. **Dynamic Import**: 큰 컴포넌트는 지연 로딩

   ```typescript
   const HeavyChart = dynamic(() => import('./HeavyChart'), {
     loading: () => <Spinner />
   })
   ```

2. **Image Optimization**: `next/image` 사용
   ```tsx
   <Image src="/logo.png" width={200} height={200} alt="Logo" />
   ```

### Python Worker

1. **Connection Pooling**: DB/Redis 연결 재사용
2. **Batch Processing**: Gemini API 호출 최소화
3. **Async I/O**: `asyncio` + `aiohttp` 사용

## 보안 체크리스트

- [ ] 모든 사용자 입력을 Zod/Pydantic으로 검증
- [ ] API Key를 환경 변수로 격리
- [ ] SQL Injection 방지 (ORM 사용)
- [ ] XSS 방지 (React는 기본 방어, 추가 sanitization)
- [ ] Rate Limiting 적용
