-- 💰 누적 결제액 추적 및 등급 시스템 고도화
-- GOLD 달성 조건: 100,000 KRW 이상 누적 결제

-- 1. profiles 테이블에 total_payment_amount 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_payment_amount INTEGER DEFAULT 0;

-- 2. 등급 업데이트 함수 (결제 금액에 따라 자동 승급)
CREATE OR REPLACE FUNCTION public.calculate_tier_upgrade(current_tier TEXT, total_amount INTEGER)
RETURNS TEXT AS $$
BEGIN
  -- MASTER는 불변 (관리자 부여)
  IF current_tier = 'MASTER' THEN
    RETURN 'MASTER';
  END IF;

  -- 10만원 이상이면 GOLD
  IF total_amount >= 100000 THEN
    RETURN 'GOLD';
  -- 1원이라도 결제했으면 SILVER (기존이 BRONZE일 경우)
  ELSIF total_amount > 0 AND current_tier = 'BRONZE' THEN
    RETURN 'SILVER';
  END IF;

  RETURN current_tier;
END;
$$ LANGUAGE plpgsql;
