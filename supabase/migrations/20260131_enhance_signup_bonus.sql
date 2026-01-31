-- 📝 Update Signup Bonus Logic
-- 게스트: 10P (기존)
-- 정식 가입: 50P (상향)

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- is_anonymous 컬럼 확인 (Supabase Auth 스키마에 존재)
  -- 만약 is_anonymous 컬럼이 없다면(구버전) email 유무로 판별 가능
  
  IF new.is_anonymous IS TRUE THEN
    INSERT INTO public.profiles (id, email, points, tier)
    VALUES (new.id, new.email, 10, 'BRONZE');
  ELSE
    INSERT INTO public.profiles (id, email, points, tier)
    VALUES (new.id, new.email, 50, 'BRONZE');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles 테이블의 기본값도 50으로 변경 (혹시 모를 직접 insert 대비)
ALTER TABLE public.profiles ALTER COLUMN points SET DEFAULT 50;
