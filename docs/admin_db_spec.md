# 📊 관리자 대시보드 기획 및 DB 스키마 설계서 (v1.0)

## 1. 관리자 대시보드 (Admin Dashboard) 기획
**목표**: 서비스의 건강 상태(Health), 수익성(Cost vs Revenue), 사용자 활동을 한눈에 파악하고 제어한다.

### 🧭 메뉴 구조
1.  **Overview (종합 현황)**: C-Level 레벨 지표 파악.
2.  **User Management (사용자 관리)**: 고객 응대 및 어뷰징 차단.
3.  **Job Queue Monitor (작업 모니터링)**: 실시간 번역 처리 상태 및 오류 제어.
4.  **Financials (재무 현황)**: API 비용 vs 광고/구독 수익 비교.

### 🖥️ 화면별 상세 기능

#### A. Overview Tab (대시보드 메인)
*   **KPI Cards**:
    *   **DAU / MAU**: 오늘의 순수 방문자 / 이번 달 순수 방문자.
    *   **Active Jobs**: 현재 처리 중인 작업 수 (대기열 포함).
    *   **Today's Cost**: 오늘 발생한 예상 Google API 비용 ($).
    *   **Success Rate**: 최근 1시간 작업 성공률 (%).
*   **Charts**:
    *   시간대별 트래픽 (Line Chart).
    *   언어별 번역 요청 비중 (Pie Chart).

#### B. User Management Tab
*   **Table Columns**: `User ID`, `Email`, `Tier (Free/Pro)`, `Usage (Today)`, `Status`, `Joined At`.
*   **Actions**:
    *   **Ban/Unban**: 약관 위반 사용자 차단.
    *   **Grant Credits**: 보상으로 무료 크레딧/기간 연장 지급.
    *   **View History**: 해당 사용자의 최근 번역 이력 조회.

#### C. Job Queue Monitor Tab (DevOps 연동)
*   **BullMQ Status**: `Waiting`, `Active`, `Completed`, `Failed` 상태별 카운트.
*   **Priority Control**:
    *   특정 긴급 작업의 우선순위를 'High'로 강제 상향.
*   **Retry Policy**: 'Fail' 상태인 작업을 일괄 재시도(Retry).

---

## 2. 데이터베이스 스키마 설계 (Prisma / PostgreSQL)

SaaS 지표 추적, 할당량 관리, 작업 대기열 로직을 모두 포함한 정규화된 스키마입니다.

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --------------------------------------
// 1. 사용자 및 인증 (Auth & User)
// --------------------------------------

enum UserRole {
  USER
  ADMIN
}

enum SubscriptionTier {
  FREE      // 1일 1개 제한, Low Priority
  PRO       // 무제한, High Priority
  ENTERPRISE
}

enum UserStatus {
  ACTIVE
  BANNED
  SUSPENDED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          UserRole  @default(USER)
  tier          SubscriptionTier @default(FREE)
  status        UserStatus @default(ACTIVE)
  
  // 할당량 관리 (Quota)
  usageCountDaily Int     @default(0) // 매일 자정 0으로 초기화
  lastUsageReset  DateTime @default(now())

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  jobs          TranslationJob[]
  payments      PaymentHistory[]
  posts         Post[]
  comments      Comment[]
  
  @@index([email])
}

// NextAuth.js 표준 모델 (Account, Session) - 생략 가능하나 호환성 위해 유지
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// --------------------------------------
// 2. 핵심 비즈니스: 번역 작업 (Translation Job)
// --------------------------------------

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELED
}

enum JobPriority {
  HIGH
  NORMAL
  LOW
}

model TranslationJob {
  id            String      @id @default(cuid())
  userId        String?     // 비회원도 지원할 경우 nullable, 아니면 필수
  user          User?       @relation(fields: [userId], references: [id])
  
  // 파일 정보
  originalFileName String
  fileSize         Int        // bytes
  fileType         String     // pdf, docx, xlsx
  sourceLang       String
  targetLang       String
  
  // 처리 상태
  status        JobStatus   @default(PENDING)
  priority      JobPriority @default(LOW)
  progress      Int         @default(0) // 0~100 (%)
  
  // 결과물 (Signed URL)
  sourceFileKey String      // S3 Key
  resultFileKey String?     // S3 Key
  
  // 비용 추적 (Cost Tracking)
  detectedCharCount Int     @default(0)
  estimatedCost     Float   @default(0.0) // Google API 예상 비용 ($)
  
  errorMessage  String?     // 실패 시 에러 로그
  
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime    @default(now())

  // 인덱스: 대시보드 조회 및 큐 폴링 최적화
  @@index([status, priority]) 
  @@index([userId])
  @@index([createdAt]) // 일별 통계용
}

// --------------------------------------
// 3. 시스템 메트릭 & 통계 (Aggregated Metrics)
// --------------------------------------

model SystemMetric {
  id        String   @id @default(cuid())
  date      DateTime @unique @db.Date // 'YYYY-MM-DD' 단위 저장
  
  // 트래픽 지표
  dau       Int      @default(0) // Daily Active Users
  newUsers  Int      @default(0) // 신규 가입자
  
  // 작업 지표
  totalJobs      Int @default(0)
  failedJobs     Int @default(0)
  totalCharCount BigInt @default(0) // 총 번역 글자 수
  
  // 재무 지표
  totalApiCost   Float @default(0.0) // API 지출 ($)
  adRevenue      Float @default(0.0) // 광고 예상 수익 ($) - 외부 입력 필요

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PaymentHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  amount    Float
  currency  String   @default("USD")
  status    String   // SUCCEEDED, FAILED
  provider  String   // STRIPE, PAYPAL
  
  createdAt DateTime @default(now())
}

// --------------------------------------
// 4. 커뮤니티 게시판 (Community Board)
// --------------------------------------

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(true)
  viewCount Int      @default(0)
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  comments  Comment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([createdAt]) // 최신순 정렬
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

## 3. 핵심 로직 설명

1.  **Quota Control (할당량 제어)**:
    *   API 요청 전 `User.tier`와 `User.usageCountDaily`를 확인.
    *   FREE 유저는 `usageCountDaily >= 3`이면 차단.
    *   Cron Job이 매일 자정 `usageCountDaily`를 0으로 리셋.

2.  **Priority Queueing (우선순위 큐)**:
    *   `User.tier == PRO` 인 경우 `TranslationJob.priority = HIGH`.
    *   BullMQ 워커는 `HIGH` 작업을 먼저 가져가도록 설정.

3.  **Cost Monitoring (비용 모니터링)**:
    *   작업 완료 시 `TranslationJob.estimatedCharCount` * 단가($20/1M) 계산하여 `estimatedCost` 저장.
    *   이벤트 트리거로 `SystemMetric.totalApiCost` 누적 업데이트.
    *   관리자 대시보드에서 `SystemMetric` 테이블만 조회하면 되므로, 쿼리 부하 최소화.
