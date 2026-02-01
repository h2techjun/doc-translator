-- ==============================================================================
-- [Role System Enforcer] 권한 체계 정립 스크립트
-- MASTER: 최고 관리자 (System Owner)
-- ADMIN: 중간 관리자 (Moderator)
-- USER: 일반 사용자
-- ==============================================================================

-- 1. 기존 권한 데이터 정리 (혹시 모를 오타나 예전 데이터 호환성 보정)
-- 'admin' 소문자나 다른 변형이 있다면 대문자 표준으로 변경
UPDATE public.profiles SET role = 'MASTER' WHERE role ILIKE 'master';
UPDATE public.profiles SET role = 'ADMIN' WHERE role ILIKE 'admin';
UPDATE public.profiles SET role = 'USER' WHERE role IS NULL OR role NOT IN ('MASTER', 'ADMIN');

-- 2. Role 컬럼에 제약 조건 추가 (Enum처럼 동작하게 강제)
-- 이미 constraint가 있다면 삭제 후 재생성
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('MASTER', 'ADMIN', 'USER'));

-- 3. 코멘트 추가 (문서화)
COMMENT ON COLUMN public.profiles.role IS '사용자 권한 등급: MASTER (최고관리자), ADMIN (중간관리자), USER (일반)';
