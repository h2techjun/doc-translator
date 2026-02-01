-- ==============================================================================
-- [초강력 복구] 로그인 500 에러 및 권한 문제 해결
-- Database error querying schema 원인: 권한(GRANT) 부족 또는 RLS 정책 충돌
-- ==============================================================================

-- 1. 트랜잭션 시작 (안전장치)
BEGIN;

-- 2. public 스키마 권한 전체 재설정 (가장 강력한 처방)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Trigger 충돌 방지: 신규 유저 Triggers 잠시 비활성화 (필요하다면)
-- (보통 handle_new_user 트리거가 public 스키마 권한 부족으로 실패하는 경우가 많음)
-- 아래 함수가 확실히 실행 가능하도록 권한 부여
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- 4. public.profiles 테이블 RLS 정책 잠시 비활성화 (로그인 차단 확인용)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- (보안상 위험하므로 비활성화보다는 정책을 수정)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. pgcrypto 재설치 (확실하게 public 스키마에)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- 6. gagum80 계정 복구 (메타데이터 및 비밀번호)
UPDATE auth.users
SET 
  encrypted_password = crypt('2424g4', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
  updated_at = now()
WHERE email = 'gagum80@hotmail.com';

-- 7. profiles 테이블에 해당 유저가 존재하는지 확인하고 없으면 강제 삽입
INSERT INTO public.profiles (id, email, role, tier, points)
SELECT id, email, 'ADMIN', 'FREE', 0
FROM auth.users
WHERE email = 'gagum80@hotmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN';

COMMIT;
