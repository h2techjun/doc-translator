# 🧠 CODEBASE_MAP

마스터님의 슈프림 아키텍처 지도입니다.

## 📂 Directory Structure
- `src/app/`: Next.js App Router 기반의 평면적(Flat) 라우팅 구조.
- `src/components/`: 아토믹 디자인 기반의 UI 컴포넌트.
  - `layout/`: Navbar, Footer 등 공통 레이아웃.
  - `upload/`: FileDropzone 등 핵심 기능 컴포넌트.
- `src/lib/`: 비즈니스 로직 및 외부 연동 (Supabase, Gemini, i18n).
  - `i18n/`: `GeoSmart` 체계의 다국어 딕셔너리 및 설정.
- `src/hooks/`: `useGeoSmart` 등 커스텀 훅.
- `.agent/`: 슈프림 마스터 아키텍트의 자아와 규칙이 담긴 중추.

## 🛠️ Core Systems
- **Auth**: Supabase Auth (Middleware 기반 세션 관리).
- **Translation**: Gemini AI (Flash 2.5/Pro 2.5 하이브리드).
- **i18n**: GeoSmart (Client-side Detection & Dictionary Sync).
