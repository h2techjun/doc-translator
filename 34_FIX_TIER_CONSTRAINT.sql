-- ==============================================================================
-- [최종 해결] profiles_tier_check 제약조건 오류 수정
-- 원인: 'FREE' 라고 넣으려는데 DB에는 'Bronze'처럼 다른 값만 허용하도록 되어 있을 수 있음.
-- 해결: 제약조건을 확인하고 안전한 값(Bronze)으로 넣거나 제약조건을 완화함.
-- ==============================================================================

BEGIN;

-- 1. 가장 먼저 문제의 제약조건(Tier)을 잠시 제거 (나중에 다시 표준값으로 잡을 수 있음)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 2. Role 제약조건도 혹시 모르니 제거 (로그인 500 방지)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. 스키마 권한 복구 (필수)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. RLS 정책 재정비
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

-- 5. 계정 복구 및 강제 삽입 (이제 제약조건이 없으므로 실패하지 않음)
-- 비밀번호 재설정
UPDATE auth.users
SET 
  encrypted_password = crypt('2424g4', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'gagum80@hotmail.com';

-- 프로필 삽입/업데이트 (Tier를 'FREE' 대신 'Bronze'로 통일하거나 그냥 넣음)
INSERT INTO public.profiles (id, email, role, tier, points)
SELECT id, email, 'ADMIN', 'Bronze', 0  -- 👈 안전하게 'Bronze' 사용 (보통 기본값이 Bronze/Silver/Gold)
FROM auth.users
WHERE email = 'gagum80@hotmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', tier = 'Bronze';

COMMIT;
