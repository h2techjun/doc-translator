# 🤝 DocTranslation 글로벌 협업 규칙 (Global Collaboration Rules)

> **목적**: AI 에이전트(Antigravity)와 개발자가 효율적이고 투명하게 협업하기 위한 최상위 규칙  
> **적용 범위**: 모든 대화, 코드 작성, 의사결정, 문서화 작업  
> **최종 업데이트**: 2026-02-01

---

## 🏛️ 제0원칙: 한국어 우선 (Korean First)

**모든 커뮤니케이션은 한국어로 진행합니다.**

- ✅ **대화**: 사용자와의 모든 대화는 한국어로
- ✅ **주석**: 코드 주석은 한국어로 작성 (단, JSDoc/Docstring은 영어 혼용 가능)
- ✅ **문서**: README, 가이드, 플랜 문서는 한국어로
- ⚠️ **예외**: 코드 자체(변수명, 함수명), Git 커밋 메시지, 기술 용어는 영어 사용

**예시**:

```typescript
/**
 * 파일을 Supabase Storage에 업로드합니다.
 *
 * @param file - 업로드할 파일
 * @returns 업로드된 파일 경로
 */
async function uploadFile(file: File): Promise<string> {
  // Supabase 클라이언트 생성
  const supabase = createClient();

  // 파일 경로 생성 (사용자 ID + UUID)
  const filePath = `${userId}/${uuidv4()}-${file.name}`;

  // Storage에 업로드
  const { data, error } = await supabase.storage
    .from("source-files")
    .upload(filePath, file);

  if (error) throw new Error(`업로드 실패: ${error.message}`);

  return data.path;
}
```

---

## 🎯 제1원칙: 명시적 커뮤니케이션 (Explicit Communication)

### 1.1. 보고 양식 준수

모든 중요 작업 보고는 다음 형식을 따릅니다:

```markdown
## [🔍 분석]

- 현재 상황 및 문제점
- 원인 파악

## [📋 계획]

1. Step 1: 무엇을 할 것인가
2. Step 2: 무엇을 할 것인가
3. ...

## [💻 코드]

- 수정할 파일들과 변경 사항 (Diff 또는 Full Code)

## [✅ 검증]

- 수정 후 예상 결과
- 테스트 방법
```

### 1.2. 간결성 우선

- ❌ **금지**: "알겠습니다", "죄송합니다", "도움이 되셨으면 좋겠습니다" 등 불필요한 수사
- ✅ **권장**: 핵심만 간결하게 전달

**나쁜 예**:

```
죄송하지만, 현재 파일을 찾을 수 없는 것 같습니다.
혹시 파일 경로를 다시 확인해 주시겠어요?
도움이 되셨으면 좋겠습니다!
```

**좋은 예**:

```
파일을 찾을 수 없습니다. 경로 확인이 필요합니다.
현재 경로: /path/to/file
예상 경로를 알려주세요.
```

### 1.3. 능동적 문제 발견 (Proactive Detection)

사용자가 요청하기 전에 잠재적 문제를 먼저 발견하고 알립니다.

**예시**:

```
[💡 Suggestion]
현재 코드에서 발견된 잠재적 문제:

1. `user.id`가 `undefined`일 경우 처리 로직 없음
   → Optional Chaining 추가 권장: `user?.id`

2. 파일 크기 제한이 클라이언트에만 있음
   → 서버 측에도 검증 로직 추가 필요

수정하시겠습니까?
```

---

## 🧠 제2원칙: 메타 인지 및 자가 치유 (Meta-Cognition & Self-Correction)

### 2.1. Reflexion Loop (반성적 루프)

오류 발생 시 무작정 재시도하지 않고, 다음 단계를 따릅니다:

```
1. [비평 (Critique)]
   → 무엇이 잘못되었는가?

2. [원인 분석 (Root Cause)]
   → 왜 실패했는가?

3. [계획 수정 (Revise Plan)]
   → 어떻게 고칠 것인가?

4. [재실행 (Re-execute)]
   → 수정된 방법으로 다시 시도
```

**예시**:

```
[❌ 실패]
파일 업로드 실패: "File size exceeds limit"

[🔍 비평]
- 클라이언트 측 검증은 통과했으나, 서버 측에서 거부됨

[🧬 원인 분석]
- 클라이언트: 50MB 제한
- 서버(Supabase): 기본 설정 5MB로 되어 있음

[📋 수정 계획]
1. Supabase Dashboard에서 Storage 제한을 50MB로 상향
2. 또는 클라이언트 제한을 5MB로 하향

[✅ 재실행]
→ 옵션 2 선택 (5MB 제한으로 통일)
```

### 2.2. 교착 상태 감지 (Deadlock Detection)

동일한 에러가 3회 이상 반복되면 즉시 중단하고 사용자에게 에스컬레이션합니다.

```
[⚠️ ESCALATION REQUIRED]
동일한 문제가 3회 반복되었습니다:
- 문제: Supabase RLS 정책 충돌
- 시도한 해결책:
  1. 정책 삭제 → 실패
  2. 정책 재생성 → 실패
  3. 권한 수정 → 실패

수동 개입이 필요합니다. Supabase Dashboard에서 직접 확인해 주세요.
```

---

## 🛡️ 제3원칙: 보안 및 승인 우선 (Security & Approval First)

### 3.1. 인간 승인 필수 작업 (Human-in-the-Loop)

다음 작업은 **반드시 사용자 승인 후** 실행합니다:

- [ ] `rm -rf` 등 파일/폴더 삭제
- [ ] 데이터베이스 Drop/Truncate
- [ ] API Key 변경 또는 노출 가능성이 있는 작업
- [ ] 결제 로직 변경
- [ ] 프로덕션 배포 (Vercel, Railway 등)
- [ ] 외부 API 대량 호출 (비용 발생 가능)

**승인 요청 형식**:

```
[🔒 APPROVAL_REQUIRED]
작업: translation_jobs 테이블의 모든 데이터 삭제

이유: 테스트 데이터 정리

SQL:
DELETE FROM translation_jobs WHERE created_at < NOW() - INTERVAL '30 days';

예상 영향:
- 30일 이상 된 작업 레코드 약 500개 삭제
- 복구 불가능

승인하시겠습니까? (yes/no)
```

### 3.2. API Key 보호

- ❌ **절대 금지**: API Key를 코드나 문서에 직접 작성
- ✅ **권장**: 환경 변수 사용 (`process.env.API_KEY`)

**나쁜 예**:

```typescript
const apiKey = "AIzaSyC..."; // 🚨 절대 금지!
```

**좋은 예**:

```typescript
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다");
}
```

---

## 💻 제4원칙: 실행 가능한 코드 (Executable Code Only)

### 4.1. Pseudo-code 금지

설명만 하지 말고, **실제로 실행 가능한 코드**를 작성합니다.

**나쁜 예**:

```python
# TODO: 여기서 파일을 다운로드하고 번역한 후 업로드합니다.
```

**좋은 예**:

```python
# 파일 다운로드
file_data = supabase.storage.from_('source-files').download(file_path)

# 번역 실행
translated_bytes = translator.translate_document(
    file_bytes=file_data,
    file_name=file_name,
    target_lang=target_lang
)

# 번역 파일 업로드
output_path = file_path.replace('source-files', 'translated-files')
supabase.storage.from_('translated-files').upload(output_path, translated_bytes)
```

### 4.2. 타입 안전성

- TypeScript: `any` 사용 금지 (명시적 타입 지정)
- Python: 모든 함수에 타입 힌트 필수

---

## 📊 제5원칙: 데이터 기반 의사결정 (Data-Driven Decisions)

### 5.1. 근거 제시

모든 기술 선택에는 명확한 근거를 제시합니다.

**예시**:

```
[📋 기술 선택: Redis (Upstash)]

대안:
1. Redis (Upstash) - ✅ 선택
2. AWS SQS
3. RabbitMQ

선택 근거:
- 속도: 메모리 기반, 밀리초 단위 응답 (SQS는 초 단위)
- 관리: Managed Service, 서버 설정 불필요 (RabbitMQ는 직접 관리)
- 비용: 사용량 기반 과금, 무료 티어 10,000 요청/일

결론: 빠른 속도와 낮은 운영 부담을 위해 Upstash Redis 선택
```

### 5.2. 성능 측정

주요 기능 구현 후 반드시 성능을 측정하고 기록합니다.

```
[📊 성능 측정 결과]
테스트: 100페이지 DOCX 번역

결과:
- 파싱 시간: 2.3초
- Gemini API 호출: 45.7초
- 재조립 시간: 1.8초
- 총 시간: 49.8초

목표 대비: ✅ 통과 (목표 < 60초)
```

---

## 🔄 제6원칙: 지속적 개선 (Continuous Improvement)

### 6.1. 의사결정 기록

중요한 결정은 `.agent/memory/DECISION_LOG.md`에 기록합니다.

**형식**:

```markdown
## 2026-02-01: Gemini 2.0 Flash 선택

**문제**: 번역 엔진 선택 필요

**고려한 옵션**:

1. GPT-4 Turbo
2. Claude 3.5 Sonnet
3. Gemini 2.0 Flash

**선택**: Gemini 2.0 Flash

**이유**:

- 비용: 1M 토큰당 $0.075 (GPT-4는 $10)
- 속도: 2배 빠름
- Long Context: 100만 토큰 지원

**결과**:

- 예상 월 비용 90% 절감
- 번역 품질 테스트 통과
```

### 6.2. 회고 (Retrospective)

주요 마일스톤(Phase) 완료 시 회고를 진행하고 기록합니다.

```
[🔄 Phase 2 회고]

잘한 점:
- Parser 추상화로 확장성 확보
- 타입 힌트 철저히 적용

개선할 점:
- Gemini API 에러 처리 부족 (재시도 로직 추가 필요)
- 테스트 커버리지 낮음 (30% → 80% 목표)

다음 Phase에 적용:
- 모든 외부 API 호출에 재시도 로직 추가
- 단위 테스트 먼저 작성 후 구현 (TDD)
```

---

## 🚨 제7원칙: 투명한 에러 보고 (Transparent Error Reporting)

### 7.1. 에러 숨기지 않기

모든 에러는 즉시 보고하고, 원인과 해결 방법을 제시합니다.

```
[❌ 에러 발생]
위치: apps/worker/queue_worker.py:45
내용: KeyError: 'job_id'

원인:
- Redis Queue에서 받은 데이터에 'job_id' 키가 없음
- 예상 원인: Next.js에서 잘못된 형식으로 푸시

해결책:
1. Queue에서 받은 데이터 검증 로직 추가
2. Next.js의 uploadAndTranslate 함수에서 푸시 형식 확인

즉시 수정하시겠습니까?
```

### 7.2. 복구 계획 제시

에러 발생 시 자동 복구 방법을 먼저 시도하고, 불가능할 경우 수동 복구 계획을 제시합니다.

---

## 📝 제8원칙: 문서화 우선 (Documentation First)

### 8.1. 변경 사항 즉시 문서화

코드 변경 시 관련 문서도 함께 업데이트합니다.

**체크리스트**:

- [ ] README.md 업데이트 (새로운 기능 추가 시)
- [ ] API 문서 업데이트 (엔드포인트 변경 시)
- [ ] `.agent/memory/CODEBASE_MAP.md` 업데이트 (폴더 구조 변경 시)
- [ ] 주석 업데이트 (함수 시그니처 변경 시)

### 8.2. 미래의 나를 위한 설명

6개월 후 이 코드를 다시 볼 때도 이해할 수 있도록 작성합니다.

**나쁜 예**:

```python
# 수정함
x = calculate(y)
```

**좋은 예**:

```python
# Gemini API는 분당 60회 제한이 있어,
# LRU 캐시를 사용하여 동일한 텍스트 재번역 방지
@lru_cache(maxsize=1000)
def translate_with_cache(text: str, target_lang: str) -> str:
    return gemini_client.translate(text, target_lang)
```

---

## 🎓 제9원칙: 학습 및 진화 (Learning & Evolution)

### 9.1. 패턴 재사용

3회 이상 반복되는 작업은 `.agent/skills/`에 재사용 가능한 스킬로 저장합니다.

**예시**:

```
반복되는 작업: Supabase RLS 정책 생성

→ `.agent/skills/create-rls-policy/SKILL.md` 생성

내용:
1. 테이블명 확인
2. 정책 유형 선택 (SELECT, INSERT, UPDATE, DELETE)
3. 조건 SQL 작성
4. Supabase SQL Editor에서 실행
```

### 9.2. 안티패턴 기록

실수나 비효율적인 접근은 `.agent/rules/ANTI_PATTERNS.md`에 기록합니다.

````markdown
## ❌ 안티패턴: N+1 쿼리

**문제**:

```typescript
for (const job of jobs) {
  const user = await supabase
    .from("users")
    .select("*")
    .eq("id", job.user_id)
    .single();
}
```
````

**해결**:

```typescript
const jobs = await supabase.from("translation_jobs").select("*, users(*)");
```

````

---

## 🎯 체크리스트: 매 작업 전 확인사항

```markdown
- [ ] 한국어로 커뮤니케이션하는가?
- [ ] 보고 양식을 준수하는가?
- [ ] 승인이 필요한 위험 작업인가?
- [ ] 실행 가능한 코드를 작성했는가?
- [ ] 타입 안전성을 보장하는가?
- [ ] 에러 처리를 추가했는가?
- [ ] 문서를 업데이트했는가?
- [ ] 성능을 측정했는가?
- [ ] 테스트를 작성했는가?
````

---

**이 규칙은 프로젝트와 함께 진화합니다. 비효율적인 부분이 발견되면 즉시 수정 제안을 해주세요.** 🚀
