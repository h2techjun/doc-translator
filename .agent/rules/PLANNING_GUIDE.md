# 📋 계획 문서 작성 가이드 (Planning Guide)

> **목적**: 실행 가능한 고품질 계획 문서를 작성하기 위한 표준 템플릿  
> **적용 대상**: Implementation Plan, Feature Plan, Refactoring Plan 등  
> **업데이트**: 2026-02-01

---

## 🎯 계획 문서의 목적

좋은 계획 문서는 다음을 달성해야 합니다:

1. **명확성**: 비전문가도 전체 흐름을 이해할 수 있어야 함
2. **실행 가능성**: 개발자가 즉시 코드 작성을 시작할 수 있어야 함
3. **검증 가능성**: 각 단계의 완료 여부를 명확히 확인할 수 있어야 함
4. **위험 관리**: 잠재적 문제와 해결 방안을 사전에 제시해야 함

---

## 📐 계획 문서 표준 구조

모든 계획 문서는 다음 섹션을 **순서대로** 포함해야 합니다:

````markdown
# 🎯 {프로젝트명} {계획 유형} (Plan Type)

> **목표**: {한 문장으로 최종 목표 설명}  
> **기간**: {예상 소요 시간}  
> **책임자**: {담당 에이전트/팀}

---

## 📋 Phase 0: {단계명}

**기간**: {예상 시간}  
**담당**: {에이전트명}

### ✅ Checkpoint 0.1: {체크포인트명}

{구체적인 작업 내용}

**생성할 파일**:

- [ ] `path/to/file1.ts`
- [ ] `path/to/file2.py`

**실행 명령어**:

```bash
# 명령어
```
````

**검증 기준**:

- [ ] 검증 항목 1
- [ ] 검증 항목 2

---

## 📋 Phase 1: {단계명}

{동일한 구조 반복}

---

## ✅ 최종 검증 체크리스트

### 기능 테스트

- [ ] 테스트 항목 1
- [ ] 테스트 항목 2

### 보안 테스트

- [ ] 보안 항목 1

### 성능 테스트

- [ ] 성능 항목 1

---

## 🚀 다음 단계 (Post-MVP)

{향후 확장 계획}

````

---

## 🔑 핵심 작성 원칙

### 1. SMART 원칙 준수

모든 Phase와 Checkpoint는 SMART 기준을 충족해야 합니다:

- **S**pecific (구체적): "데이터베이스 설정" (X) → "Supabase에서 translation_jobs 테이블 생성" (O)
- **M**easurable (측정 가능): "빠르게 실행" (X) → "3초 이내 실행" (O)
- **A**chievable (달성 가능): 비현실적 목표 금지
- **R**elevant (관련성): 최종 목표와 직접 연결
- **T**ime-bound (기한 설정): "Phase 1: 2일 (16시간)"

### 2. 역의존성 순서 (Dependency Order)

- Phase는 반드시 **의존성 순서**대로 배치합니다
- 예: Phase 1 (인프라) → Phase 2 (백엔드) → Phase 3 (프론트엔드)
- ❌ 나쁜 예: Phase 1에서 API 호출 코드 작성 → Phase 2에서 서버 설정

### 3. 체크포인트 세분화

- 하나의 Checkpoint는 **1~4시간 내** 완료 가능해야 합니다
- 4시간 초과 시 서브 체크포인트로 분리
- ✅ 좋은 예:
  - Checkpoint 1.1: Supabase 프로젝트 생성 (30분)
  - Checkpoint 1.2: 스키마 작성 (1시간)
- ❌ 나쁜 예:
  - Checkpoint 1: 데이터베이스 전체 구축 (8시간)

### 4. 코드 완전성

- **Pseudo-code 절대 금지**
- 모든 코드는 **복사-붙여넣기 후 즉시 실행 가능**해야 함
- 환경 변수, import 문, 타입 정의 모두 포함

**나쁜 예**:
```typescript
// TODO: 여기서 파일을 업로드합니다
uploadFile(file)
````

**좋은 예**:

```typescript
import { createClient } from "@/lib/supabase/client";

export async function uploadFile(file: File) {
  const supabase = createClient();

  const filePath = `uploads/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (error) throw new Error(error.message);
  return data.path;
}
```

### 5. 검증 기준 명시

- 각 Checkpoint마다 **검증 기준**을 명확히 제시
- 단순히 "완료" 대신 "어떻게 확인하는지" 명시

**예시**:

```markdown
**검증 기준**:

- [ ] `npm run dev` 실행 시 http://localhost:3000 접속 가능
- [ ] 콘솔에 에러 없음
- [ ] Supabase 연결 테스트 통과 (브라우저 콘솔에서 `supabase.from('jobs').select()` 성공)
```

---

## 📊 Phase 설계 패턴

### 패턴 1: Infrastructure-First (인프라 우선)

**적용 시기**: 새로운 프로젝트 시작 시

```markdown
Phase 0: 환경 구성 (로컬 개발 환경)
Phase 1: 인프라 구축 (DB, Storage, Queue)
Phase 2: 백엔드 엔진 (핵심 로직)
Phase 3: 프론트엔드 UI
Phase 4: 통합 및 QA
Phase 5: 배포
```

### 패턴 2: Feature-Driven (기능 우선)

**적용 시기**: 기존 프로젝트에 기능 추가 시

```markdown
Phase 0: 요구사항 분석 및 설계
Phase 1: 백엔드 API 구현
Phase 2: 프론트엔드 UI 구현
Phase 3: 테스트 및 QA
Phase 4: 배포
```

### 패턴 3: Refactoring (리팩토링)

**적용 시기**: 레거시 코드 개선 시

```markdown
Phase 0: 현황 분석 (기술 부채 파악)
Phase 1: 테스트 코드 작성 (안전망 구축)
Phase 2: 점진적 리팩토링 (한 모듈씩)
Phase 3: 성능 측정 및 검증
Phase 4: 문서 업데이트
```

---

## 🧩 Checkpoint 작성 가이드

### 구조

````markdown
### ✅ Checkpoint {Phase}.{Number}: {작업명}

{작업 설명 (1-2문장)}

**전제 조건** (선택):

- 이전 Checkpoint 완료
- 필요한 도구/라이브러리 설치

**작업 절차**:

1. {단계 1}
2. {단계 2}
3. {단계 3}

**생성할 파일** (해당 시):

- [ ] `path/to/file.ts`
- [ ] `path/to/file.py`

**실행 명령어** (해당 시):

```bash
npm install package-name
```
````

````

**코드 예시** (필수):
```language
// 실제 실행 가능한 코드
````

```

**검증 기준**:
- [ ] 검증 항목 1 (구체적인 확인 방법)
- [ ] 검증 항목 2

**예상 산출물**:
- {무엇이 완성되는지}

**예상 소요 시간**: {1-4시간}
```

### 예시: 완전한 Checkpoint

````markdown
### ✅ Checkpoint 1.2: Supabase 데이터베이스 스키마 생성

Supabase SQL Editor에서 `translation_jobs` 테이블을 생성하고 RLS 정책을 설정합니다.

**전제 조건**:

- Checkpoint 1.1 완료 (Supabase 프로젝트 생성됨)
- Supabase Dashboard 로그인 완료

**작업 절차**:

1. Supabase Dashboard → SQL Editor 이동
2. 아래 SQL 복사 및 실행
3. Tables 메뉴에서 테이블 생성 확인

**실행 SQL**:

```sql
-- translation_jobs 테이블
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_jobs_user_id ON translation_jobs(user_id);

-- RLS 활성화
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view their own jobs"
ON translation_jobs FOR SELECT
USING (auth.uid() = user_id);
```
````

**검증 기준**:

- [ ] Tables 메뉴에 `translation_jobs` 표시됨
- [ ] RLS 정책 2개 생성 확인 (Dashboard → Authentication → Policies)
- [ ] 테스트 쿼리 성공:
  ```sql
  SELECT * FROM translation_jobs LIMIT 1;
  ```

**예상 산출물**:

- 프로덕션 준비 완료된 데이터베이스 스키마

**예상 소요 시간**: 1시간

````

---

## 🚨 위험 관리 섹션

계획 문서에는 **예상 위험과 완화 전략**을 포함해야 합니다.

### 위치
각 Phase 또는 전체 계획 문서 끝부분에 추가

### 구조
```markdown
## ⚠️ 위험 요소 및 완화 전략

### 위험 1: {위험 설명}
**발생 확률**: 높음/중간/낮음
**영향도**: 높음/중간/낮음
**완화 전략**:
- {사전 예방 방법}
- {발생 시 대응 방법}

### 위험 2: API 비용 초과
**발생 확률**: 중간
**영향도**: 높음
**완화 전략**:
- Gemini API 호출 전 텍스트 캐싱 (Redis)
- 일일 API 호출 한도 설정 (환경 변수)
- 비용 알림 설정 (Google Cloud Billing Alerts)
````

---

## ✅ 최종 검증 체크리스트 작성

계획 문서의 마지막에는 반드시 **최종 검증 체크리스트**를 포함합니다.

### 구조

```markdown
## ✅ 최종 검증 체크리스트 (Final Validation)

### 기능 테스트 (Functional Tests)

- [ ] 핵심 기능 1 정상 작동
- [ ] 핵심 기능 2 정상 작동
- [ ] 엣지 케이스 처리 확인

### 보안 테스트 (Security Tests)

- [ ] 인증/인가 검증
- [ ] 입력 검증 (SQL Injection, XSS 등)
- [ ] API Key 노출 여부 확인

### 성능 테스트 (Performance Tests)

- [ ] 응답 시간 < 목표값
- [ ] 동시 사용자 부하 테스트
- [ ] Lighthouse Score > 90

### 문서화 (Documentation)

- [ ] README.md 업데이트
- [ ] API 문서 작성
- [ ] 배포 가이드 작성
```

---

## 📏 계획 문서 품질 기준

### 자가 평가 체크리스트

계획 문서 작성 후 다음을 확인하세요:

#### 명확성 (Clarity) - 30점

- [ ] (10점) 비전문가도 전체 흐름 이해 가능
- [ ] (10점) 각 Phase의 목표가 한 문장으로 설명됨
- [ ] (10점) 기술 용어에 설명 주석 포함

#### 실행 가능성 (Actionability) - 40점

- [ ] (15점) 모든 코드가 실행 가능 (Pseudo-code 없음)
- [ ] (15점) 파일 경로가 절대 경로로 명시됨
- [ ] (10점) 명령어가 OS별로 구분되어 있음 (필요 시)

#### 검증 가능성 (Verifiability) - 20점

- [ ] (10점) 각 Checkpoint에 검증 기준 명시
- [ ] (10점) 최종 검증 체크리스트 포함

#### 위험 관리 (Risk Management) - 10점

- [ ] (5점) 예상 위험 요소 나열
- [ ] (5점) 각 위험에 대한 완화 전략 제시

**합계**: \_\_/100점  
**통과 기준**: 80점 이상

---

## 🎨 계획 문서 스타일 가이드

### 1. 언어 및 톤

- **언어**: 한국어 (코드, 기술 용어는 영어)
- **톤**: 명령형, 단정적 ("~해야 합니다", "~합니다")
- **금지**: 불확실한 표현 ("아마도", "가능하면", "~인 것 같습니다")

### 2. 코드 블록 사용

````markdown
✅ 좋은 예: 언어 명시

```typescript
const example = "hello";
```
````

````

```markdown
❌ 나쁜 예: 언어 미명시
````

const example = 'hello'

```

```

### 3. 체크리스트 형식

```markdown
✅ 좋은 예: 구체적인 액션

- [ ] `npm install supabase` 실행
- [ ] `.env.local` 파일에 API Key 추가
- [ ] localhost:3000에서 연결 테스트

❌ 나쁜 예: 추상적인 설명

- [ ] 설치
- [ ] 설정
- [ ] 테스트
```

### 4. 시간 추정

```markdown
✅ 좋은 예: 범위 제시
**예상 소요 시간**: 1~2시간 (초보자 기준)

❌ 나쁜 예: 불명확
**예상 소요 시간**: 얼마 안 걸림
```

---

## 🔄 계획 문서 버전 관리

### 1. 변경 이력 기록

계획 문서 상단에 변경 이력을 기록합니다:

```markdown
# 📋 DocTranslation Implementation Plan

> **버전**: v1.2  
> **최종 업데이트**: 2026-02-01  
> **변경 이력**:
>
> - v1.2 (2026-02-01): Phase 3에 인증 페이지 추가
> - v1.1 (2026-01-28): Gemini 2.0 Flash로 AI 엔진 변경
> - v1.0 (2026-01-25): 초기 계획 수립
```

### 2. 피드백 반영

계획 실행 중 발견된 문제는 즉시 문서에 반영합니다:

```markdown
## 📝 실행 중 발견된 이슈

### 이슈 1: Supabase Storage 크기 제한

**문제**: 무료 티어는 1GB 제한, 계획에는 5GB로 명시됨  
**해결**: Phase 1.3 수정 - 파일 크기 제한을 50MB → 10MB로 하향  
**반영일**: 2026-02-01
```

---

## 💡 계획 문서 작성 예시 (Full Example)

### 시나리오: 사용자 알림 기능 추가

````markdown
# 🔔 사용자 알림 기능 구현 플랜 (User Notification Feature Plan)

> **목표**: 번역 완료 시 사용자에게 이메일 및 브라우저 알림 전송  
> **기간**: 3일 (24시간)  
> **책임자**: @The-Builder, @The-Guardian

---

## 📋 Phase 0: 알림 인프라 설계

**기간**: 4시간  
**담당**: @Architect

### ✅ Checkpoint 0.1: 알림 전략 수립

**목표**: 이메일과 브라우저 알림 중 어떤 방식을 사용할지 결정

**대안 분석**:
| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| 이메일 (SendGrid) | 신뢰성 높음 | 비용 발생 | ✅ |
| 브라우저 Push | 무료 | 브라우저 권한 필요 | ✅ |
| SMS | 즉시 확인 가능 | 비용 높음 | ❌ |

**선택 이유**: 이메일과 브라우저 Push 병행 (사용자 선택 가능)

### ✅ Checkpoint 0.2: 데이터베이스 스키마 확장

**목표**: 사용자 알림 설정을 저장할 테이블 추가

**실행 SQL**:

```sql
-- 사용자 알림 설정 테이블
CREATE TABLE user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
ON user_notification_settings
USING (auth.uid() = user_id);
```
````

**검증 기준**:

- [ ] Supabase Dashboard에서 테이블 생성 확인
- [ ] RLS 정책 활성화 확인

---

## 📋 Phase 1: 이메일 알림 구현

**기간**: 8시간  
**담당**: @The-Builder

### ✅ Checkpoint 1.1: SendGrid 계정 생성 및 API Key 발급

**작업 절차**:

1. [SendGrid](https://sendgrid.com) 가입
2. 무료 티어 선택 (월 100통 무료)
3. Settings → API Keys → Create API Key
4. `.env` 파일에 추가:
   ```env
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@example.com
   ```

**검증 기준**:

- [ ] API Key 발급 완료
- [ ] 환경 변수 설정 완료

### ✅ Checkpoint 1.2: 이메일 전송 함수 구현

**파일**: `apps/worker/core/notifications/email.py`

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

class EmailNotifier:
    def __init__(self):
        self.client = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL')

    def send_translation_complete(
        self,
        to_email: str,
        filename: str,
        download_url: str
    ) -> bool:
        """번역 완료 이메일 전송"""
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=f'번역 완료: {filename}',
            html_content=f"""
            <h1>번역이 완료되었습니다</h1>
            <p>파일: {filename}</p>
            <a href="{download_url}">다운로드</a>
            """
        )

        try:
            response = self.client.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"Email error: {e}")
            return False
```

**검증 기준**:

- [ ] 함수 작성 완료
- [ ] 타입 힌트 포함
- [ ] 에러 처리 포함

### ✅ Checkpoint 1.3: Worker에서 알림 호출

**파일**: `apps/worker/queue_worker.py`

**수정 내용** (기존 process_job 함수):

```python
# 기존 코드에 추가
from core.notifications.email import EmailNotifier

email_notifier = EmailNotifier()

async def process_job(job_data: dict):
    # ... 기존 번역 로직 ...

    # 완료 후 이메일 전송
    if user_settings['email_enabled']:
        email_notifier.send_translation_complete(
            to_email=user_email,
            filename=file_name,
            download_url=download_url
        )
```

**검증 기준**:

- [ ] 테스트 작업 실행 시 이메일 수신 확인

---

## 📋 Phase 2: 브라우저 Push 알림 구현

**기간**: 8시간  
**담당**: @The-Builder

### ✅ Checkpoint 2.1: Web Push 라이브러리 설치

```bash
cd apps/web
npm install web-push
```

### ✅ Checkpoint 2.2: Service Worker 등록

**파일**: `apps/web/public/sw.js`

```javascript
self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
  });
});
```

**파일**: `apps/web/src/app/layout.tsx`

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

**검증 기준**:

- [ ] 브라우저 개발자 도구 → Application → Service Workers에서 등록 확인

---

## ✅ 최종 검증 체크리스트

### 기능 테스트

- [ ] 번역 완료 시 이메일 수신 확인
- [ ] 브라우저 Push 알림 수신 확인
- [ ] 설정 페이지에서 알림 ON/OFF 가능

### 보안 테스트

- [ ] SendGrid API Key가 .env에 격리됨
- [ ] 타 사용자에게 알림 전송 안 됨

### 성능 테스트

- [ ] 이메일 전송 시간 < 2초

---

## ⚠️ 위험 요소

### 위험 1: SendGrid 무료 티어 초과

**발생 확률**: 중간  
**영향도**: 높음  
**완화 전략**:

- 일일 알림 전송 수 모니터링
- 100통 임박 시 관리자에게 알림

```

---

**이 가이드를 따라 작성된 계획 문서는 즉시 실행 가능하며, 검증 가능합니다.** 🚀
```
