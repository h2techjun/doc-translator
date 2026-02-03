# 🚫 ANTI PATTERNS (The "Don't Do List")

> 회고(Retro)를 통해 발견된 반복적인 실수나 프로젝트에서 금지된 패턴을 기록합니다.
> 에이전트는 작업 전 이 파일을 확인하여 같은 실수를 반복하지 않아야 합니다.

## 1. General

- **[2024-01-27]**: `gemini-flash-latest` 같은 부정확한 모델명 사용 금지. 반드시 공식 문서에 기재된 정확한 버전(`gemini-2.0-flash`, `gemini-1.5-pro` 등)을 확인할 것.
- **[2024-01-27]**: API 호출 시 쿼터 제한(429)에 대한 예외 처리를 누락하지 말 것. 사용자에게 명확한 피드백(Toast/Alert)을 제공해야 함.
- **[2024-01-28]**: **Template Blindness 금지**. 문서를 작성할 때(`TECH_STACK.md` 등) `package.json`이나 실제 코드를 확인하지 않고 템플릿을 무비판적으로 복사하지 말 것. (예: 사용하지 않는 Zustand/TanStack Query 기재 금지)
- **[2024-01-28]**: **Visual Blindness (UI Hierarchy Myth)**. 사용자가 제공한 스크린샷과 소스 코드가 다를 경우, 라이브러리 컴포넌트(`FileDropzone.tsx`)가 아니라 실제 `page.tsx` 등에 하드코딩된 UI가 있는지 먼저 `grep`으로 검색하라. (Assumed hierarchy vs. Flat implementation mismatch 사례 방지).
- **[2024-01-28]**: **Structural Integrity Violation [CRITICAL]**. `multi_replace_file_content`로 대규모 리팩토링 시, 중괄호 `{ }` 짝이 맞지 않아 빌드 에러(<eof> error)가 발생하는지 반드시 점검하라. 복잡한 파일은 작은 단위로 쪼개어 수정하거나 `replace_file_content`로 한 번에 정확한 블록을 교체하는 것이 안전하다.
- **[2024-01-28]**: **Duplicate Declaration Bug**. `multi_replace` 사용 시 타겟 텍스트를 너무 일반적인 주석 등으로 잡지 말 것. 동일한 주석이 여러 군데 있으면 중복 코드가 생성될 위험이 크다.
- **[2024-01-28]**: **Language Inertia(언어 관성) 금지**. "기술 문서는 영어가 편하다"는 이유로 사용자가 지정한 기본 언어 메타(한국어)를 무시하고 영문 아티팩트를 생성하지 말 것. 이는 명백한 지시 불이행임. **특히 `IMPLEMENTATION_PLAN.md`와 같은 계획 문서는 반드시 한국어로 작성하여 마스터가 즉시 검토할 수 있게 하라.**
- **[2024-01-28]**: **Blind Edit(맹목적 수정) 금지 [CRITICAL]**. 파일 내용을 "기억"이나 "추측"으로 수정하지 마라. `replace` 또는 `multi_replace` 호출 전에는 반드시 `view_file`로 해당 라인을 눈으로 확인(Read-Before-Write)해야 한다. **특히 tool call이 한 번이라도 실패하면 즉시 멈추고 파일을 다시 읽어라. 재시도는 금지된다.**
- **[2024-01-28]**: **Log Preservation(로그 보존) 필수 [CRITICAL]**. `RETRO_*.md`, `CHANGELOG.md`와 같은 히스토리성 문서는 절대로 `write_to_file`로 덮어쓰지 마라. 반드시 `replace_file_content` 등을 사용하여 기존 내용 뒤에 새로운 내용을 추가(Append)하거나 누적해야 한다. 과거의 데이터를 지우는 것은 범죄다.
- **[2026-01-31]**: **Inconsistent Naming Bug [BUILD BLOCKER]**. DB 컬럼명(`target_lang`)과 프론트엔드 타입/UI 명칭(`target_language`)을 절대 혼용하지 말 것. TypeScript의 엄격한 타입 체크 환경에서 이는 전 페이지 빌드 중단을 초래하며, 수정 시 전수 조사가 필요해 시간 낭비가 매우 큼.
- **[2026-01-31]**: **Fragile Config Over-reliance**. Vercel(리눅스) 환경에서 `tailwind.config.ts` 등 `.ts` 기반 설정 파일이 빌드 시 로드 실패를 일으킬 경우, 망설이지 말고 호환성이 검증된 `.js`로 즉시 전환하라.
- **[2026-01-31]**: **Huge Dictionary Blind Spot [CRITICAL]**. `dictionaries.ts`와 같이 1,000줄이 넘는 거대 객체 파일을 수정할 때, 모든 로케일에 동일한 속성이 추가되었는지 확인하지 않고 턴을 종료하지 마라. `multi_replace` 사용 시 블록이 너무 크면 유실 위험이 있으므로, 가급적 로케일별로 나누어 수정하거나 수정 후 `grep` 성격의 검색 도구로 전수 검사하라.
- **[2026-01-31]**: **OS Mismatch Command**. Windows 환경에서 `grep`을 직접 호출하지 마라. `grep_search` 툴을 사용하거나, 터미널이 반드시 필요하다면 `Select-String`을 사용하라.
- **[2026-01-31]**: **Context Override Blindness [CRITICAL]**. 사용자가 명시적으로 지정한 환경 변수, 모델 버전, API 설정 또는 제공된 스크린샷의 정보를 무시하고 외부 문서나 자신의 지식(Knowledge Base)을 기반으로 설정을 변경하지 말 것. 특히 사용자가 "이미지는 ~이다" 또는 "설정은 ~여야 한다"고 경고한 경우, 이를 시스템의 '절대 진리(Source of Truth)'로 취급하라. 외부 지식보다 현재 워크스페이스의 컨텍스트가 100% 우선한다.
- **[2026-01-31]**: **Library Guesswork [STRICT]**. 외부 라이브러리(`@paypal/react-paypal-js` 등) 사용 시, `npm install` 후 `node_modules`의 `.d.ts`를 확인하거나 공식 문서를 참조하지 않고 속성(`style={{ text: false }}`)을 추측하여 작성하지 말 것. 이는 빌드 에러를 유발하는 가장 흔한 원인임. "아마 있겠지"라는 생각은 금지된다.
- **[2026-01-31]**: **Blind Component Editing**. UI 컴포넌트(`PricingPage`, `Modal` 등)를 수정할 때, 전체 파일 구조(`view_file`)를 확인하지 않고 부분적인 기억에 의존하여 수정하지 말 것. 특히 중첩된 `<div>` 구조나 조건부 렌더링 블록을 수정할 때는 반드시 주변 5~10줄을 먼저 읽고 컨텍스트를 파악해야 `TargetContent` 불일치를 방지할 수 있다.

## 2. Next.js

- 서버 컴포넌트(`route.ts`)에서 브라우저 전용 API(`alert`, `window`) 사용 금지.
- `use client` 지시어는 최하단 컴포넌트에만 사용하여 서버 사이드 렌더링 이점을 해치지 말 것.

## 3. CSS/Tailwind

- `h-[100vh]` 대신 `min-h-screen`을 사용하여 모바일 브라우저 주소창 문제를 방지할 것.

## 4. i18n 및 라우팅 (Vercel 404 Critical)

- **i18n 라우팅 미스매치**: 물리적 폴더 구조(`src/app`)에 없는 로케일 세그먼트를 미들웨어에서 강제로 리다이렉트하거나 링크에 포함하는 행위 금지. Vercel `DEPLOYMENT_NOT_FOUND` (404)를 유발함.
- **공백 및 접두사 오류**: `<Link href="/ ko /path">`와 같이 경로 내에 공백이 포함되거나 잘못된 접두사를 사용하는 행위. 모든 경로는 정규화된 절대 경로를 사용하라.
- **Agent Fragmentation**: 프로젝트마다 개별 `.agent` 폴더를 생성하여 지식을 파편화하는 행위 금지. 전역 중추(`d:/02_Project/.agent`)를 업데이트하라.
- **[2026-01-31]**: **Static Path Collision**. `[source]/[target]`와 같은 동적 라우트와 `en-to-ko` 같은 정적 폴더가 섞여 있으면 Next.js 라우팅 충돌이 발생할 수 있음. pSEO 지원 시에는 `[...slug]` 형태의 Catch-all 라우트를 사용하여 유연성을 확보하고 정적 폴더를 최소화하라.
- **[2026-01-31]**: **Agent Responsibility Fog**. 하위 에이전트에게 구체적인 역할을 부여하지 않고 모호하게 작업을 시작하지 말 것. "누가 무엇을 하는가"가 명확하지 않은 계획서는 무효임.
- **[2026-01-31]**: **Shadow Duplication Bug**. 대규모 코드 교체(특히 하단에 유틸리티 함수가 모여 있는 파일) 시, 추가하려는 블록에 이미 파일 하단에 정의된 헬퍼 함수(예: `FeatureBox`)가 포함되어 중복 정의 에러(`TS2393`)를 유발하는지 반드시 확인하라. 수정 전 파일의 `tail`을 확인하는 습관을 가져야 한다.
- **[2026-01-31]**: **Zombie Dependency Error**. "필요 없는 파일 정리" 요청 시, 파일을 삭제하기 전 해당 파일을 참조(Import)하고 있는 팩토리나 레지스트리 코드가 있는지 전수 검색(`grep_search`)하라. 파일만 지우고 참조를 남겨두는 것은 빌드 중단을 야기하는 치명적인 실수다.
- **[2026-01-31]**: **PowerShell File Encoding Corruption [CRITICAL]**. PowerShell의 `Get-Content | Set-Content` 파이프라인은 UTF-8 BOM 및 CRLF 문제를 일으켜 TypeScript 파일을 손상시킬 수 있음. 대량 텍스트 치환이 필요한 경우 반드시 `multi_replace_file_content` 도구를 사용하고, 실패 시 `git checkout`으로 복구 후 재시도하라.
- **[2026-01-31]**: **i18n Mass Update Without Verification**. `dictionaries.ts`에 새로운 키를 추가할 때, 타입 정의만 업데이트하고 모든 언어 구현체(20개+)에 동기화하지 않으면 빌드 에러가 발생함. 반드시 `.agent/skills/i18n-checker` 스킬을 실행하거나, 최소한 `grep_search`로 누락된 언어가 없는지 확인하라.
- **[2026-01-31]**: **Optional Type Escape Hatch Abuse**. 타입 에러를 빠르게 해결하기 위해 필드를 `optional(?)`로 만드는 것은 임시방편일 뿐, 근본적 해결책이 아님. 런타임 안정성을 위해 모든 언어에 실제 값을 추가하는 것이 원칙이다.
- **[2026-02-01]**: **Visibility Death Hack [STRICT]**. `text-[10px]`와 같이 12px(text-xs) 미만의 폰트나 `opacity-50` 이하의 저대비 설정을 관리자/엔터프라이즈 페이지에서 남발하지 말 것. 이는 가독성을 심각하게 해치며 사용자 피로도를 높임. 최소 `text-xs`와 밝은 텍스트(`text-slate-200` 등)를 기본으로 하라.
- **[2026-02-01]**: **Multi-Chunk Fragility [CRITICAL]**. `multi_replace_file_content` 호출 시 5개 이상의 non-contiguous chunk를 한 번에 처리하려다 하나라도 `TargetContent` 불일치로 실패하면 전체 작업이 지연됨. 특히 복잡한 UI 코드에서는 3개 내외의 확실한 덩어리로 나누어 호출하거나, 타겟 텍스트 전후의 공백/줄바꿈을 `view_file`로 완벽히 재확인하라. 추측에 기반한 context 포함은 금지된다.
- **[2026-02-01]**: **Admin Auth Fragility**. Supabase `createServerClient`를 서버 컴포넌트에서 사용할 때 `getUser()` 세션이 불안정할 수 있음. 관리자용 API/페이지에서는 반드시 `Manual Session Recovery` (The Hammer Fix) 패턴을 사용하여 세션을 강제로 복구하고 권한을 체크하라.
