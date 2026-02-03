# 🗺️ CODEBASE MAP
> 이 파일은 프로젝트의 전체 아키텍처를 보여주는 지도입니다. 프로젝트 구조가 변경될 때마다 업데이트하십시오.

## 📁 Source Structure (`/src`)

### 🧠 Core Business Logic (`/src/lib`)
- **translation/**: 문서 번역 핵심 엔진
    - `engine.ts`: 오케스트레이터 (Facade)
    - `strategies/`: 파일 형식별 번역 전략 (Strategy Pattern)
    - `parsers/`: XML/HTML 파서
- **i18n/**: 다국어 리소스
    - `dictionaries.ts`: 20개국어 번역 데이터
    - `languages.ts`: 지원 언어 목록 상수
- **supabase/**: 데이터베이스 클라이언트 유틸리티
- **payment/**: 결제 관련 로직 (TBD)

### 🎨 UI Components (`/src/components`)
- **ui/**: Shadcn UI 기반 원자 컴포넌트 (Button, Select 등)
- **translation/**: 번역 관련 분자 컴포넌트 (`GamifiedLoading.tsx`)
- **theme-provider.tsx**: 테마 컨텍스트
- **mode-toggle.tsx**: 다크모드/라이트모드 토글

### 🚀 Application Router (`/src/app`)
- **page.tsx**: 메인 랜딩 페이지 (SSR + Client Hydration)
- **layout.tsx**: 루트 레이아웃 (Font, Global Style)
- **globals.css**: 전역 Tailwind 스타일
- **api/**: 백엔드 API 라우트
    - `translate/`: 파일 업로드 및 번역 처리 엔드포인트

### 📝 Configuration
- `tailwind.config.ts`: 디자인 시스템 토큰 설정
- `next.config.mjs`: Next.js 빌드 설정
- `package.json`: 의존성 관리

---

## 🔗 Key Relationships
- **Frontend**: Next.js App Router -> React Server Components -> Client Components
- **API Flow**: Client (`page.tsx`) -> `/api/translate` -> `OfficeTranslationEngine` -> `Strategy` -> Google Gemini API
- **Data Flow**: `React Hook Form` (File Input) -> `FormData` -> `Buffer` -> `Stream` processing

## 🛠️ Infrastructure
- **Hosting**: Vercel (Next.js)
- **Database**: Supabase
- **AI**: Google Vertex AI / Gemini API
