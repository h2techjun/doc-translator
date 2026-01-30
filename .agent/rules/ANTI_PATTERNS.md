# 🚫 ANTI_PATTERNS

슈프림 마스터 아키텍트 프로토콜에 따라, 시스템의 무결성을 해치는 아래의 패턴들을 엄격히 금지합니다.

## 1. i18n 라우팅 미스매치 (Vercel 404 위험)
- **Problem**: `src/app` 구조가 `[locale]` 동적 세그먼트 폴더를 포함하지 않음에도 불구하고, `next-intl` 등의 미들웨어를 사용하여 경로에 로케일 접두사(예: `/ko/`)를 강제 리다이렉트하는 행위.
- **Risk**: Vercel 배포 시 `DEPLOYMENT_NOT_FOUND` (404) 에러 발생.
- **Action**: 폴더 구조가 Flat(평면형)일 때는 반드시 클라이언트 사이드 로케일 처리(`GeoSmart`)를 우선하며, 미들웨어에서의 강제 경로 수정을 금지합니다.

## 2. Server Component 내 Client Hook 사용 (`use client` 부재)
- **Problem**: `async` 함수로 정의된 Server Component 내에서 `useGeoSmart`, `useTranslations` 등의 React Hook을 직접 호출하는 행위.
- **Risk**: 빌드 타임 에러 (`TS2349`, `Error: Hooks can only be called inside of the body of a function component`).
- **Action**: 서버 컴포넌트에서는 딕셔너리(`dictionaries.ts`)를 직접 임포트하여 데이터를 가져오고, Hook 사용이 필수적인 경우 반드시 상단에 `'use client'` 지시어를 명시하고 클라이언트 컴포넌트로 분리합니다.

## 3. 내부 링크 내 불필요한 공백 및 로케일 접두사
- **Problem**: `<Link href="/ ko /path">`와 같이 템플릿 리터럴 내에 의도치 않은 공백이 포함되거나, 실제 존재하지 않는 로케일 세그먼트를 경로에 포함하는 행위.
- **Risk**: 사용자가 메뉴 클릭 시 404 에러 직면.
- **Action**: 모든 내부 경로는 정규화된 절대 경로(예: `/admin`, `/community`)를 사용하며, 로케일이 폴더 구조에 없는 경우 경로에 포함하지 않습니다.

## 4. 라이브러리 제거 후 레거시 코드 잔존
- **Problem**: 라이브러리(`next-intl` 등)를 제거한 후에도 컴포넌트 내에 해당 라이브러리의 임포트나 함수 호출이 남아있는 상태로 배포 시도.
- **Risk**: 빌드 실패.
- **Action**: 주요 라이브러리 제거 시 프로젝트 전체 검색(`grep`)을 통해 모든 참조를 소탕하십시오.
