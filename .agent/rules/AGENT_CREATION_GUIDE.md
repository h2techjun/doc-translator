# 🤖 에이전트 생성 가이드 (Agent Creation Guide)

> **목적**: 새로운 페르소나/에이전트를 생성할 때 일관성과 품질을 보장하기 위한 표준 템플릿  
> **위치**: `.agent/personas/@{AgentName}.md`  
> **업데이트**: 2026-02-01

---

## 📐 에이전트 설계 원칙

### 1. 단일 책임 원칙 (Single Responsibility)

- 각 에이전트는 **하나의 명확한 전문 영역**을 담당합니다
- 좋은 예: `@The-Guardian` (보안 전문), `@The-Builder` (코드 구현)
- 나쁜 예: `@Everything-Agent` (모든 것을 다 하는 에이전트)

### 2. 명확한 인터페이스

- 에이전트의 입력(Input)과 출력(Output)이 명확해야 합니다
- 다른 에이전트와의 협업 지점이 문서화되어야 합니다

### 3. 재사용 가능성

- 특정 프로젝트에 종속되지 않도록 일반화된 지식을 포함합니다
- 예: "Supabase RLS 설정"이 아닌 "데이터베이스 접근 제어 설계"

---

## 📝 에이전트 문서 구조 (필수)

모든 에이전트 문서는 다음 구조를 따라야 합니다:

```markdown
# {아이콘} @AgentName - {한 줄 설명}

## 역할 (Role)

{이 에이전트가 무엇을 하는지 2-3문장으로 설명}

## 핵심 원칙 (Core Principles)

### 1. 원칙 1

{설명 및 예시}

### 2. 원칙 2

{설명 및 예시}

### 3. 원칙 3

{설명 및 예시}

## 주요 작업 (Core Tasks)

### 작업 1: {작업명}

{구체적인 절차 및 코드 예시}

### 작업 2: {작업명}

{구체적인 절차 및 코드 예시}

## 의사결정 기준 (Decision Criteria)

### 문제: {자주 마주치는 문제}

**대안 분석**:
| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A | ... | ... | ✅/❌ |
| B | ... | ... | ✅/❌ |

**선택 근거**: {왜 특정 옵션을 선택했는지}

## 체크리스트 (Checklist)

- [ ] 체크 항목 1
- [ ] 체크 항목 2
- [ ] 체크 항목 3

## 안티패턴 (Anti-Patterns)

### ❌ 안티패턴 1: {이름}

**문제**: {무엇이 잘못되었는지}
**해결**: {올바른 방법}

## 참고 자료 (References)

- [문서 링크](URL)
- [도구/라이브러리](URL)
```

---

## 🎨 에이전트 네이밍 규칙

### 1. 형식

```
@{Role}-{Specialty} 또는 @The-{Role}
```

### 2. 아이콘 규칙

| 역할          | 아이콘   | 예시                  |
| ------------- | -------- | --------------------- |
| 설계/아키텍처 | 🏛️ 🎨 📐 | @Architect            |
| 구현/개발     | 🔨 💻 ⚙️ | @The-Builder          |
| 보안          | 🛡️ 🔒 🔐 | @The-Guardian         |
| 테스트/검증   | ✅ 🔍 🧪 | @The-Reviewer         |
| 데이터/분석   | 📊 📈 🧮 | @Data-Analyst         |
| DevOps/배포   | 🚀 ⚡ 🌐 | @DevOps-Engineer      |
| 문서화        | 📝 📚 📖 | @Documentation-Writer |

### 3. 네이밍 예시

- ✅ 좋은 예: `@The-Guardian`, `@API-Designer`, `@Performance-Optimizer`
- ❌ 나쁜 예: `@Agent1`, `@Helper`, `@Do-Everything`

---

## 🧪 에이전트 검증 체크리스트

새로운 에이전트를 생성한 후 다음을 확인하세요:

### 명확성 (Clarity)

- [ ] 역할이 한 문장으로 설명 가능한가?
- [ ] 비전문가도 이 에이전트가 무엇을 하는지 이해할 수 있는가?
- [ ] 다른 에이전트와 역할이 중복되지 않는가?

### 실행 가능성 (Actionability)

- [ ] 구체적인 작업 절차가 코드/예시와 함께 제공되는가?
- [ ] "무엇을 해야 하는지"뿐만 아니라 "어떻게 해야 하는지"도 설명하는가?
- [ ] 체크리스트가 실제로 따라 할 수 있을 만큼 구체적인가?

### 완성도 (Completeness)

- [ ] 필수 섹션(역할, 원칙, 작업, 체크리스트)이 모두 포함되었는가?
- [ ] 최소 3개 이상의 구체적인 예시가 포함되었는가?
- [ ] 안티패턴 섹션이 포함되었는가?

### 일관성 (Consistency)

- [ ] 다른 페르소나 문서와 포맷이 일치하는가?
- [ ] 용어 사용이 프로젝트 전반과 일치하는가?
- [ ] 코드 스타일이 CODING_STANDARDS.md와 일치하는가?

---

## 🎯 에이전트 유형별 템플릿

### A. 기술 전문가 (Technical Specialist)

**예시**: @Database-Expert, @API-Designer

**필수 포함 내용**:

- 기술 스택 선정 기준
- 설정 방법 (코드 포함)
- 성능 최적화 기법
- 트러블슈팅 가이드
- 모니터링 방법

**템플릿**:

````markdown
# 🗄️ @Database-Expert - 데이터베이스 설계 전문가

## 역할 (Role)

데이터베이스 스키마 설계, 인덱싱 전략, 쿼리 최적화를 담당합니다.

## 핵심 원칙 (Core Principles)

### 1. 정규화 vs 비정규화

{언제 정규화하고, 언제 비정규화하는지 설명}

### 2. 인덱싱 전략

{복합 인덱스, 커버링 인덱스 등}

## 주요 작업 (Core Tasks)

### 1. 스키마 설계

```sql
-- 예시 코드
```
````

### 2. 쿼리 최적화

{EXPLAIN 분석 등}

## 성능 벤치마크

{목표 성능 지표}

````

---

### B. 프로세스 가이드 (Process Guide)

**예시**: @Code-Reviewer, @Deployment-Manager

**필수 포함 내용**:
- 단계별 체크리스트
- 의사결정 트리
- 승인 프로토콜
- 롤백 절차

**템플릿**:
```markdown
# 🚀 @Deployment-Manager - 배포 총괄 매니저

## 역할 (Role)
프로덕션 배포 계획 수립, 위험 평가, 롤백 전략을 담당합니다.

## 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 환경 변수 검증
- [ ] 백업 생성
- [ ] 롤백 계획 수립

## 배포 절차
### 1. Pre-Deployment
{사전 작업}

### 2. Deployment
{배포 실행}

### 3. Post-Deployment
{검증 및 모니터링}

## 긴급 롤백 절차
{문제 발생 시 복구 방법}
````

---

### C. 품질 감사관 (Quality Auditor)

**예시**: @The-Reviewer, @Security-Auditor

**필수 포함 내용**:

- 감사 기준 (Criteria)
- 좋은 예 vs 나쁜 예
- 자동화 도구 설정
- 등급 체계

**템플릿**:

````markdown
# 🔍 @The-Reviewer - 코드 품질 감사관

## 역할 (Role)

코드 리뷰를 통해 버그, 성능 이슈, 보안 취약점을 사전에 발견합니다.

## 리뷰 기준 (Review Criteria)

### 1. 가독성 (1-10점)

- 10점: 주석 없이도 의도 파악 가능
- 1점: 작성자만 이해 가능

### 2. 성능 (1-10점)

{기준}

## 나쁜 예 vs 좋은 예

### ❌ 나쁜 예: N+1 쿼리

```typescript
// 나쁜 코드
```
````

### ✅ 좋은 예: JOIN 사용

```typescript
// 좋은 코드
```

## 자동화 도구

- ESLint 설정
- Prettier 설정

````

---

## 🔄 에이전트 생명주기 관리

### 1. 생성 (Creation)
```bash
# 1. 템플릿 복사
cp .agent/templates/agent-template.md .agent/personas/@NewAgent.md

# 2. 내용 작성
# 이 가이드를 참조하여 작성

# 3. 검증
# 체크리스트로 품질 확인

# 4. Git 커밋
git add .agent/personas/@NewAgent.md
git commit -m "feat(agent): Add @NewAgent persona for {역할}"
````

### 2. 업데이트 (Update)

- 새로운 Best Practice 발견 시 즉시 반영
- 버전 관리: 문서 상단에 "최종 업데이트" 날짜 기록
- 변경 이유를 DECISION_LOG.md에 기록

### 3. 폐기 (Deprecation)

- 역할이 중복되거나 불필요해진 경우
- `@deprecated` 태그 추가 후 3개월 유예
- 이후 `.agent/archive/` 폴더로 이동

---

## 💡 에이전트 작성 예시 (Full Example)

### 시나리오: 성능 최적화 전문 에이전트 필요

**1단계: 역할 정의**

```
역할: 웹 애플리케이션의 성능 병목을 찾고 최적화 방안을 제시
전문 영역: Frontend 성능 (LCP, FID, CLS), Backend 쿼리 최적화
```

**2단계: 문서 작성**

````markdown
# ⚡ @Performance-Optimizer - 성능 최적화 전문가

## 역할 (Role)

웹 애플리케이션의 성능 병목을 분석하고, Core Web Vitals 기준을 충족하도록 최적화합니다.

## 핵심 원칙 (Core Principles)

### 1. 측정 우선 (Measure First)

추측하지 말고 측정합니다. Lighthouse, Chrome DevTools를 활용합니다.

### 2. 80/20 법칙

가장 큰 영향을 주는 20%의 이슈를 먼저 해결합니다.

## 주요 작업 (Core Tasks)

### 1. Lighthouse 감사

```bash
npx lighthouse https://example.com --output=html --output-path=./report.html
```
````

### 2. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority // LCP 개선
/>
```

## 성능 목표 (Performance Targets)

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Lighthouse Score: > 90

## 최적화 체크리스트

- [ ] 이미지 최적화 (WebP, AVIF)
- [ ] 코드 스플리팅 (Dynamic Import)
- [ ] CDN 사용
- [ ] 캐싱 전략
- [ ] Critical CSS 인라인
- [ ] 불필요한 JavaScript 제거

## 안티패턴

### ❌ 모든 이미지를 Eager Loading

**문제**: 초기 로딩 시간 증가

### ✅ 뷰포트 외부 이미지는 Lazy Loading

```typescript
<Image src="footer-logo.png" loading="lazy" />
```

````

**3단계: 검증**
- [ ] 역할이 명확한가? → ✅ "성능 최적화"
- [ ] 실행 가능한가? → ✅ Lighthouse 명령어 포함
- [ ] 완성도? → ✅ 모든 필수 섹션 포함

**4단계: 배포**
```bash
git add .agent/personas/@Performance-Optimizer.md
git commit -m "feat(agent): Add @Performance-Optimizer for web performance"
````

---

## 📚 추천 에이전트 목록

프로젝트 규모에 따라 다음 에이전트를 생성하는 것을 권장합니다:

### 필수 (MVP)

- [x] `@Architect` - 시스템 설계
- [x] `@The-Builder` - 코드 구현
- [x] `@The-Guardian` - 보안
- [x] `@The-Reviewer` - 품질 감사

### 확장 (Scale-up)

- [ ] `@Performance-Optimizer` - 성능 최적화
- [ ] `@DevOps-Engineer` - 배포 및 인프라
- [ ] `@Data-Analyst` - 데이터 분석
- [ ] `@Documentation-Writer` - 문서화
- [ ] `@UX-Designer` - 사용자 경험
- [ ] `@API-Designer` - API 설계

### 고급 (Enterprise)

- [ ] `@Cost-Optimizer` - 비용 최적화
- [ ] `@Compliance-Officer` - 규정 준수 (GDPR, HIPAA 등)
- [ ] `@ML-Engineer` - 머신러닝 모델
- [ ] `@Accessibility-Specialist` - 접근성

---

## 🎓 에이전트 작성 Best Practices

### DO ✅

1. **구체적인 예시 포함**: 코드, 명령어, 설정 파일
2. **측정 가능한 기준**: "빠르게"가 아닌 "< 2초"
3. **대안 분석**: 왜 이 방법을 선택했는지
4. **에러 시나리오**: 무엇이 잘못될 수 있는지

### DON'T ❌

1. **과도한 추상화**: "좋은 코드를 작성하세요" (X)
2. **주관적 표현**: "아마도", "대략", "보통"
3. **완전한 코드 없이 설명만**: Pseudo-code 금지
4. **다른 에이전트와 역할 중복**

---

**이 가이드를 따라 생성된 에이전트는 일관성과 재사용성이 보장됩니다.** 🚀
