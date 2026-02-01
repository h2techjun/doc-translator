-- ==============================================================================
-- [긴급 복구] 로그인 500 에러 해결 스크립트
-- 원인 추정: 엄격한 제약조건(CHECK) 충돌 또는 메타데이터 손상
-- ==============================================================================

-- 1. profiles 테이블의 제약조건을 우선 삭제 (로그인 차단 원인 1순위 제거)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. pgcrypto 확장이 올바른 스키마에 있는지 확인
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 3. 유저 메타데이터 복구 (NULL일 경우 로그인 불가)
-- 기존 메타데이터가 NULL이 되어버렸을 가능성을 차단합니다.
UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN '{"provider": "email", "providers": ["email"]}'::jsonb
    ELSE raw_app_meta_data 
  END
WHERE email = 'gagum80@hotmail.com';

-- 4. 권한 재설정 (Database error querying schema 에러 해결용)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 5. 다시 한 번 비밀번호와 권한을 확실하게 세팅
UPDATE auth.users
SET encrypted_password = crypt('2424g4', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'gagum80@hotmail.com';

UPDATE public.profiles
SET role = 'ADMIN'
WHERE id = (SELECT id FROM auth.users WHERE email = 'gagum80@hotmail.com');
