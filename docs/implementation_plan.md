# 🏗️ 00_Translation MVP 구현 계획서 (Solutions Architect)

## 1. 프로젝트 개요
**목표**: 대용량 문서를 원본 서식 그대로 번역/변환해주는 글로벌 SaaS 플랫폼.
**핵심 가치**: "완벽한 포맷 유지", "대용량 파일 리워드", "글로벌 확장성".

## 2. 아키텍처 (Hybrid Architecture)
*   **프론트엔드**: Next.js 15 (App Router) + Tailwind CSS + `next-intl`
*   **백엔드**: Next.js Server Actions (API) + **Redis/BullMQ (비동기 큐)**
*   **데이터베이스**: PostgreSQL (Prisma)
*   **저장소**: AWS S3 호환 Object Storage (Signed URL 사용)
*   **워커**: Node.js Worker (별도 컨테이너 또는 백그라운드 프로세스)

### 🌊 데이터 흐름 (Event Driven)
1.  **업로드 (Upload)**: 클라이언트 -> 서버 (Pre-signed URL) -> S3 (직접 업로드)
2.  **작업 등록 (Enqueue)**: 서버 -> Redis (Job 등록, 우선순위: High/Low)
3.  **처리 (Process)**: 워커 -> Redis (Pop) -> Google Translate API / LibreOffice -> S3 (결과 업로드)
4.  **알림 (Notify)**: 서버 -> 클라이언트 (Polling/SSE) -> UI 진행률 표시줄(Progress Bar)

## 3. 핵심 기능 명세

### A. 회원 및 등급 관리 (User & Tiers)
*   **인증**: 
    *   **소셜 로그인**: Google, Apple (NextAuth.js Providers).
    *   **이메일 로그인**: 매직 링크(Magic Link) 또는 OTP 방식 (비밀번호 없는 로그인).
    *   **UI**: 모달 형태의 통합 로그인 화면 (스크린샷 참조).
*   **등급 (Tiers)**:
    *   **Free**: 일 1회 제한 (할당량), 낮은 우선순위 큐(Low Priority), 광고 노출.
    *   **Pro**: 무제한, 높은 우선순위 큐(High Priority), 광고 제거, 빠른 처리 속도.
*   **관리자 (Admin)**: 사용자 관리(차단 등), SaaS 매출 지표(DAU/ARPU) 대시보드.

### B. 문서 번역 및 변환 (Core Business)
*   **스트림 처리 (Stream Processing)**: 모든 파일 처리는 메모리가 아닌 Stream으로 처리하여 OOM(메모리 부족) 방지.
*   **번역 저장소 (Translation Memory)**: 동일 문장 해시 캐싱으로 API 비용 절감.
*   **변환기 (Converter)**: Word <-> PDF 양방향 변환 (LibreOffice Docker).

### C. 커뮤니티 및 보안
*   **게시판 (Board)**: 팁 공유 게시판 (Tip-Tap 에디터, 이미지 업로드).
*   **Q&A**: 스팸 차단 (IP당 분당 10회 요청 제한).
*   **수명 주기 (Lifecycle)**: 7일 지난 파일 자동 삭제 (S3 규칙).

## 4. 데이터베이스 스키마 설계 (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole { USER, ADMIN }
enum UserStatus { ACTIVE, BANNED }
enum SubscriptionTier { FREE, PRO }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          UserRole @default(USER)
  tier          SubscriptionTier @default(FREE)
  status        UserStatus @default(ACTIVE)
  
  usageDaily    Int      @default(0) // 할당량 확인용
  
  jobs          Job[]
  posts         Post[]
  comments      Comment[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([email])
}

model Job {
  id            String   @id @default(cuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  
  fileType      String
  status        String   // PENDING, PROCESSING, COMPLETED, FAILED
  priority      String   // HIGH, LOW
  
  costEstimate  Float    @default(0.0) // 비용 추적
  
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([status, priority]) // 워커 폴링 최적화
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  comments  Comment[]
  createdAt DateTime @default(now())
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}

// SaaS 지표 (집계용)
model DailyMetric {
  date          DateTime @id @db.Date
  dau           Int @default(0)
  revenueAd     Float @default(0.0)
  costApi       Float @default(0.0)
  totalJobs     Int @default(0)
}
```

## 5. 비용 효율화 전략 (Cost Control)
1.  **할당량 (Quota)**: Free 유저 하루 1회 강제 제한.
2.  **알림 (Alert)**: API 일일 한도 $50 도달 시 슬랙/이메일 알림.
3.  **하이브리드 엔진**: 쉬운 문장은 오픈소스 모델로 라우팅 (추후 적용).
