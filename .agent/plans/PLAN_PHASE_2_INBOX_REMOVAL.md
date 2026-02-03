# 🗑️ Phase 2: 쪽지 기능 제거 계획 (Inbox Removal)

> **목표**: "쪽지/메시지" 기능과 관련된 모든 로직, 데이터, UI를 영구적으로 삭제합니다.
> **정책**: 백업 없음. 복구 불가. 완전 삭제.

## 📋 체크리스트

### 1. 데이터베이스 (The Core)

- [x] **마이그레이션**: `supabase/migrations/20260204_drop_inbox.sql` 작성
  - `DROP TABLE IF EXISTS messages;` 실행
  - 메시징 관련 함수/트리거(Trigger) 삭제

### 2. API 라우트 (The Gateway)

- [x] `src/app/api/messages` 폴더 삭제 (이전 단계에서 완료 확인)
- [x] `messages`를 사용하는 다른 엔드포인트가 있는지 스캔

### 3. 사용자 인터페이스 (The Shell)

- [x] `src/app/inbox` 폴더 삭제 (확인됨)
- [x] `Navbar.tsx`에서 "쪽지함" 링크/아이콘 제거
- [x] `PostDetailClient.tsx`에서 "쪽지 보내기" 버튼 제거
- [x] `dictionaries.ts` 및 `locales/*.ts`에서 "Inbox" 관련 번역 키 삭제

### 4. 코드베이스 정리 (The Residue)

- [x] `types/supabase.ts` (또는 `database.types.ts`)에서 `Message` 타입 정의 삭제
- [x] 프로젝트 전체에서 `message` 또는 `inbox` 키워드로 검색하여 잔여 코드(Hooks, Utils) 제거

## 🧪 검증 (Verification)

- [ ] 빌드가 에러 없이 성공해야 함
- [ ] Supabase 대시보드에서 `messages` 테이블이 사라져야 함
- [ ] 상단 내비게이션 바(Navbar)에 쪽지 아이콘이 없어야 함
