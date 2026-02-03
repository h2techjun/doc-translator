-- 👑 Phase 3: 회원 등급 및 결제 내역 시스템 (User Tiers & Payment History)
-- 기존 profiles 테이블에 등급 및 결제 누적액 컬럼을 추가하고, 결제 내역 관리 테이블을 생성합니다.

-- 1. Profiles 테이블 확장
DO $$ 
BEGIN 
    -- 1.1 등급(tier) 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tier') THEN 
        ALTER TABLE public.profiles 
        ADD COLUMN tier TEXT DEFAULT 'BRONZE' 
        CHECK (tier IN ('GUEST', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'MASTER'));
    END IF;

    -- 1.2 총 결제액(total_payment_amount) 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_payment_amount') THEN 
        ALTER TABLE public.profiles ADD COLUMN total_payment_amount NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. 결제 내역(payment_history) 테이블 생성
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL, -- 결제 금액 (원화 기준, 외화는 환율 적용하여 변환 저장 권장)
    currency TEXT DEFAULT 'KRW', -- 통화 (KRW, USD 등)
    status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    description TEXT, -- 결제 내용 (예: '50P 충전')
    metadata JSONB, -- PG사 응답 데이터 등
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 보안 정책 설정
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payment_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
    );

-- 3. 등급 자동 산정 로직 (Trigger Function)
CREATE OR REPLACE FUNCTION public.calculate_user_tier()
RETURNS TRIGGER AS $$
DECLARE
    current_total NUMERIC;
    new_tier TEXT;
    user_role TEXT;
BEGIN
    -- 환불일 경우 amount를 차감하는 로직은 별도 처리하거나, 여기서는 COMPLETED 된 내역만 집계
    -- 3.1 유저의 총 결제액 재계산 (COMPLETED 상태인 것만)
    SELECT COALESCE(SUM(amount), 0) INTO current_total
    FROM public.payment_history
    WHERE user_id = NEW.user_id AND status = 'COMPLETED';

    -- 3.2 프로필 업데이트 (총액)
    UPDATE public.profiles
    SET total_payment_amount = current_total
    WHERE id = NEW.user_id
    RETURNING role INTO user_role;

    -- 3.3 관리자(ADMIN, MASTER)는 등급 로직 제외 (DIAMOND, MASTER 등급 유지)
    IF user_role IN ('ADMIN', 'MASTER') THEN
        RETURN NEW;
    END IF;

    -- 3.4 등급 산정 기준 적용
    -- GOLD: 1,000,000원 이상
    -- SILVER: 1원 이상 (1회라도 결제 시)
    -- BRONZE: 결제 없음 (기본)
    IF current_total >= 1000000 THEN
        new_tier := 'GOLD';
    ELSIF current_total > 0 THEN
        new_tier := 'SILVER';
    ELSE
        new_tier := 'BRONZE';
    END IF;

    -- 3.5 등급 업데이트
    UPDATE public.profiles
    SET tier = new_tier
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 연결
-- 결제 내역이 추가되거나 상태가 변경될 때마다 실행
DROP TRIGGER IF EXISTS on_payment_change ON public.payment_history;
CREATE TRIGGER on_payment_change
AFTER INSERT OR UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.calculate_user_tier();

-- 5. 소급 적용 스크립트 (Migration Time Only)
-- 기존 데이터가 있다면(혹시 payment_history가 아닌 다른 곳에 있었다면 마이그레이션이 필요하지만, 현재는 신규 생성으로 가정)
-- profiles의 기본 등급을 역할(role)에 맞춰 초기화

UPDATE public.profiles
SET tier = CASE 
    WHEN role = 'MASTER' THEN 'MASTER'
    WHEN role = 'ADMIN' THEN 'DIAMOND'
    ELSE 'BRONZE'
END
WHERE tier IS NULL OR tier = 'GUEST'; -- 기존 유저들이 NULL일 경우 대비

-- (선택) 만약 기존 transactions 테이블이 있었다면 여기서 데이터를 payment_history로 마이그레이션 하는 쿼리가 필요함.
-- 현재는 transactions 테이블 실체가 불분명하여 생략함.
