-- 🚨 Supabase SQL Editor에서 실행하세요.

-- 1. 신규 가입 시 public.profiles 자동 생성 함수 (기본 10P 지급)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, points, tier)
  VALUES (new.id, new.email, 10, 'BRONZE');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 재설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. [Correction] 기존에 포인트가 0인 유저들에게 10P 지급 (데이터 보정)
UPDATE public.profiles
SET points = 10
WHERE points = 0 OR points IS NULL;

-- 4. 특정 사용자를 관리자(MASTER)로 지정 (예시)
-- tier를 'GOLD' 또는 'MASTER'로 지정하면 무제한 번역이 가능합니다.
UPDATE public.profiles 
SET tier = 'GOLD' 
WHERE email = 'admin@example.com';
