---
name: Agent Collaboration Protocol
description: 12개 에이전트 간 협업 규약 및 충돌 해결
version: 1.0.0
---

# 👥 Agent Collaboration Protocol

## 목적

12개 전문 에이전트가 **효율적으로 협업**하고, 중복 작업을 방지하며, 충돌을 해결하는 프로토콜입니다.

## 에이전트 계층 구조

```
@JARVIS-Prime (레벨 0 - 총괄)
    ├── 핵심 개발 팀 (레벨 1)
    │   ├── @Architect
    │   ├── @The-Builder
    │   ├── @The-Guardian
    │   └── @The-Reviewer
    │
    ├── 품질 & 디자인 팀 (레벨 1)
    │   ├── @Tester
    │   ├── @Designer
    │   ├── @The-Toolsmith
    │   └── @Librarian
    │
    └── 성장 & 수익 팀 (레벨 1)
        ├── @Growth-Hacker
        ├── @Revenue-Ops
        ├── @The-Connector
        └── @The-Nerd
```

## 작업 할당 알고리즘

### Step 1: 요청 분해

```typescript
interface Task {
  id: string;
  description: string;
  complexity: "low" | "medium" | "high";
  domains: string[]; // ['ui', 'db', 'security', 'test']
  priority: number; // 1-10
  prerequisites: string[]; // 의존성
}

function decomposeRequest(userRequest: string): Task[] {
  // 사용자 요청을 여러 작업으로 분해
  // 예: "로그인 기능 추가" → [DB 설계, API 구현, UI 작성, 테스트]
}
```

### Step 2: 에이전트 매칭

```typescript
const AGENT_CAPABILITIES = {
  "@Architect": {
    domains: ["db", "api", "architecture"],
    skills: ["schema-design", "system-design", "scalability"],
    capacity: 3, // 동시 작업 수
  },
  "@The-Builder": {
    domains: ["code", "api", "integration"],
    skills: ["typescript", "python", "refactoring"],
    capacity: 5,
  },
  "@The-Guardian": {
    domains: ["security", "auth", "compliance"],
    skills: ["RLS", "encryption", "vulnerability-scan"],
    capacity: 2,
  },
  // ... 나머지 에이전트
};

function assignAgent(task: Task): string {
  // 작업 도메인과 에이전트 능력 매칭
  const candidates = Object.entries(AGENT_CAPABILITIES)
    .filter(([agent, cap]) => task.domains.some((d) => cap.domains.includes(d)))
    .sort(
      (a, b) =>
        b[1].skills.filter((s) => task.description.includes(s)).length -
        a[1].skills.filter((s) => task.description.includes(s)).length,
    );

  return candidates[0][0];
}
```

### Step 3: 의존성 해결

```typescript
function buildExecutionPlan(tasks: Task[]): Task[][] {
  // 토폴로지 정렬로 실행 순서 결정
  const phases: Task[][] = [];
  const completed = new Set<string>();

  while (completed.size < tasks.length) {
    const currentPhase = tasks.filter(
      (task) =>
        !completed.has(task.id) &&
        task.prerequisites.every((p) => completed.has(p)),
    );

    phases.push(currentPhase);
    currentPhase.forEach((t) => completed.add(t.id));
  }

  return phases;
}
```

## 작업 시나리오 예시

### 시나리오 1: 새 기능 개발

```markdown
**요청**: "회원가입 기능 추가"

**작업 분해**:

1. DB 스키마 설계 (@Architect)
2. RLS 정책 설정 (@The-Guardian)
3. API 엔드포인트 구현 (@The-Builder)
4. UI 컴포넌트 작성 (@Designer, @The-Builder)
5. 테스트 케이스 작성 (@Tester)
6. 코드 리뷰 (@The-Reviewer)
7. 문서 업데이트 (@Librarian)

**실행 단계 (Phase)**:
Phase 1 (병렬):

- @Architect: DB 스키마
- @Designer: UI 목업

Phase 2 (병렬):

- @The-Guardian: RLS 정책
- @The-Builder: API 엔드포인트
- @The-Builder: UI 구현

Phase 3 (병렬):

- @Tester: 테스트
- @The-Reviewer: 코드 리뷰

Phase 4:

- @Librarian: 문서 업데이트
```

### 시나리오 2: 긴급 버그 수정

```markdown
**요청**: "로그인 세션 끊김 문제"

**패스트 트랙 (Fast Track)**:
Phase 1:

- @The-Nerd: 근본 원인 분석 (15분)

Phase 2:

- @The-Builder: 즉시 수정 (30분)
- @The-Guardian: 보안 영향 검토 (동시)

Phase 3:

- @Tester: 회귀 테스트 (15분)

**총 예상 시간**: 60분
```

## 충돌 해결 프로토콜

### 충돌 유형 1: 동일 파일 동시 수정

```typescript
// 문제: @Builder와 @Designer가 같은 컴포넌트 수정
// 해결: Lock 메커니즘

class FileLock {
  private locks = new Map<string, string>(); // file -> agent

  acquire(file: string, agent: string): boolean {
    if (this.locks.has(file)) {
      console.warn(`⚠️ ${file}은 ${this.locks.get(file)}가 작업 중입니다.`);
      return false;
    }

    this.locks.set(file, agent);
    return true;
  }

  release(file: string, agent: string) {
    if (this.locks.get(file) === agent) {
      this.locks.delete(file);
    }
  }
}
```

### 충돌 유형 2: 상충되는 결정

```markdown
**상황**:

- @Architect: "Redis 캐싱 도입"
- @The-Nerd: "memcached가 더 적합"

**해결**:

1. JARVIS-Prime이 중재
2. 근거 비교 (성능, 비용, 복잡도)
3. 프로젝트 맥락 고려
4. 최종 결정 및 기록 (DECISION_LOG)
```

### 충돌 유형 3: 우선순위 경쟁

```typescript
interface TaskQueue {
  high: Task[]; // P1: 긴급 버그, 보안 이슈
  medium: Task[]; // P2: 기능 개발
  low: Task[]; // P3: 리팩토링, 최적화
}

function scheduleTask(task: Task, queue: TaskQueue) {
  // 우선순위에 따라 큐에 추가
  if (task.priority >= 8) {
    queue.high.push(task);
    // 현재 진행 중인 낮은 우선순위 작업 일시 중지
    pauseLowPriorityTasks();
  } else if (task.priority >= 5) {
    queue.medium.push(task);
  } else {
    queue.low.push(task);
  }
}
```

## 커뮤니케이션 규약

### 1. 작업 시작 선언

```markdown
**@The-Builder**:
"회원가입 API 구현을 시작합니다.

- 파일: `app/api/auth/signup/route.ts`
- 예상 시간: 1시간
- 의존성: @Architect의 DB 스키마 완료 필요"
```

### 2. 도움 요청

```markdown
**@Designer**:
"@The-Builder, UI 컴포넌트 props 타입 정의 필요합니다.

- 파일: `components/SignupForm.tsx`
- 필요 정보: signup API 응답 구조"
```

### 3. 작업 완료 보고

```markdown
**@Tester**:
"회원가입 테스트 완료.

- 통과: 12/12
- 커버리지: 85%
- 다음 작업자: @The-Reviewer"
```

### 4. 블로커 알림

```markdown
**@The-Builder**:
"⚠️ 블로커 발생!

- 이슈: Supabase Auth 토큰 만료 시간 설정
- 필요: @The-Guardian의 보안 정책 승인
- 영향: 로그인 API 구현 지연 (1-2시간)"
```

## 작업 추적 대시보드

### 실시간 상태

```markdown
# 현재 진행 중인 작업

## Phase 1 (진행 중)

✅ @Architect: DB 스키마 완료
🔄 @The-Guardian: RLS 정책 작성 중 (50%)

## Phase 2 (대기 중)

⏸️ @The-Builder: API 구현 대기
⏸️ @Designer: UI 작성 대기

## Phase 3 (예정)

📋 @Tester: 테스트 예정
📋 @The-Reviewer: 리뷰 예정
```

### 에이전트 용량 모니터링

```typescript
function getAgentWorkload() {
  return {
    "@Architect": { current: 2, capacity: 3, available: 1 },
    "@The-Builder": { current: 5, capacity: 5, available: 0 },
    "@The-Guardian": { current: 1, capacity: 2, available: 1 },
    // ... 나머지
  };
}

function canAssign(agent: string, task: Task): boolean {
  const workload = getAgentWorkload()[agent];
  return workload.available > 0;
}
```

## 품질 게이트 (Quality Gates)

각 에이전트 작업 완료 후 다음 에이전트로 넘어가기 전 체크:

### Gate 1: 코드 작성 후 (@The-Builder)

```markdown
- [ ] ESLint 통과
- [ ] TypeScript 컴파일 성공
- [ ] 단위 테스트 작성됨
```

### Gate 2: 보안 검토 후 (@The-Guardian)

```markdown
- [ ] RLS 정책 적용
- [ ] API 키 환경 변수화
- [ ] 입력 검증 구현
```

### Gate 3: 테스트 후 (@Tester)

```markdown
- [ ] 커버리지 80% 이상
- [ ] 모든 엣지 케이스 커버
- [ ] 성능 테스트 통과
```

### Gate 4: 리뷰 후 (@The-Reviewer)

```markdown
- [ ] 코드 스타일 준수
- [ ] 문서화 완료
- [ ] 변경 영향 분석 완료
```

## JARVIS-Prime의 중재 역할

### 1. 작업 분배 최적화

```typescript
function optimizeDistribution(tasks: Task[]) {
  // 에이전트 간 부하 균등 분배
  // 병렬 작업 최대화
  // 대기 시간 최소화
}
```

### 2. 데드락 감지

```typescript
function detectDeadlock() {
  // 순환 의존성 체크
  // 예: A가 B를 기다리고, B가 A를 기다리는 상황
  // 발견 시 JARVIS-Prime이 우선순위 재조정
}
```

### 3. 성과 피드백

```markdown
**주간 리포트**:

- 가장 활발한 에이전트: @The-Builder (23 tasks)
- 평균 작업 시간: 2.3시간
- 블로커 발생 횟수: 3회 (↓25% from last week)
- 품질 게이트 통과율: 94%
```

---

**실행 방법**: JARVIS-Prime이 모든 작업 할당 및 조율 자동 수행
