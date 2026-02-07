-- ==============================================================================
-- 👑 User Tier Normalization & Security Hardening
-- 담당 에이전트: @Architect, @Guardian
-- 목표: 데이터 대소문자 일치, RLS 보안 강화, 제약 조건 재확립
-- ==============================================================================

BEGIN;

-- 1. 데이터 정규화 (소문자가 있을 경우 대문자로 변경)
UPDATE public.profiles
SET tier = UPPER(tier)
WHERE tier IS NOT NULL;

-- 2. 제약 조건 재확립 (안전한 표준값만 허용)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_tier_check 
CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'MASTER', 'GUEST'));

-- 3. RLS 정책 강화 (Zero-Trust Security)
-- 기존의 Public Viewable 정책 제거
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- 새로운 보안 정책 적용: 본인 정보만 조회 가능하거나, 마스터/관리자만 전체 조회 가능
CREATE POLICY "Profiles are viewable by owners or admins" 
ON public.profiles 
FOR SELECT 
USING (
    auth.uid() = id 
    OR 
    (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER')
    ))
);

-- 쓰기 정책도 동일하게 강화 (관리자가 아니라면 본인 것만 수정 가능)
DROP POLICY IF EXISTS "Users can update own profiles." ON public.profiles;
CREATE POLICY "Users can update own profiles or admins for all"
ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id 
    OR 
    (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER')
    ))
);

COMMIT;
