-- 👑 마스터 시스템 V3: "The Omniscient" 통합 스키마 (The Omniscient Implementation Schema)
-- 이 스크립트를 Supabase SQL Editor에서 실행하여 마스터 시스템의 데이터베이스 기반을 구축하십시오.

-- [중요] 1. 'role' 컬럼 확인 및 추가 (Ensure 'role' column exists in profiles)
-- 기존 profiles 테이블에 role 컬럼이 없다면 추가합니다. (권한: USER, ADMIN, MASTER)
-- 이를 통해 관리자 대시보드 접근 권한을 제어합니다.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MASTER'));
    END IF;
END $$;

-- 2. 시스템 전역 설정 (System Settings / Global Configuration)
-- 유지보수 모드, 공지사항 배너 등 코드 배포 없이 시스템 상태를 실시간으로 제어하기 위한 테이블입니다.
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY, -- 설정 키 (예: 'MAINTENANCE_MODE')
    value JSONB NOT NULL, -- 설정 값 (JSON 형식으로 유연하게 저장, 예: true, {text: "공지"})
    description TEXT, -- 설정에 대한 설명 (관리자 참고용)
    is_public BOOLEAN DEFAULT false, -- 공개 여부 (프론트엔드에서 로그인 없이 조회 가능 여부)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- 마지막 수정 시간
);

-- 설정 테이블 RLS (Row Level Security) 보안 정책
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 관리자(ADMIN, MASTER)만 설정 변경 가능
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);

-- 공개 설정(is_public = true)은 누구나 조회 가능 (로그인 전 화면에서도 공지 표시 등)
CREATE POLICY "Public can view public settings" ON public.system_settings FOR SELECT USING (is_public = true);

-- 3. 쿠폰 및 프로모션 엔진 (Coupons / Promotion Engine)
-- 마케팅 및 보상을 위한 쿠폰 관리 테이블입니다.
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY, -- 쿠폰 코드 (중복 불가, 예: 'WELCOME2024')
    discount_type TEXT NOT NULL CHECK (discount_type IN ('FIXED', 'PERCENT')), -- 할인 유형 (정액 할인 / 정률 할인)
    discount_value INTEGER NOT NULL, -- 할인 값 (예: 1000 또는 10)
    usage_limit INTEGER DEFAULT 100, -- 최대 사용 가능 횟수 (선착순 이벤트용)
    used_count INTEGER DEFAULT 0, -- 현재 사용된 횟수
    valid_until TIMESTAMP WITH TIME ZONE, -- 유효 기간 (만료일)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 관리자만 쿠폰 생성 및 수정, 삭제 가능
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);
-- 일반 유저는 API를 통해 쿠폰 유효성을 검증하므로, 보안상 직접적인 테이블 SELECT 권한은 부여하지 않습니다.

-- 4. 유저 신고 및 모더레이션 (User Reports / Moderation)
-- 악성 게시물이나 유저를 신고하고, 관리자가 이를 심판(Process)하는 테이블입니다.
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 신고자 ID
    target_id UUID NOT NULL, -- 신고 대상 ID (게시물 ID, 댓글 ID, 또는 유저 ID)
    target_type TEXT NOT NULL, -- 대상 유형 ('POST', 'COMMENT', 'USER')
    reason TEXT NOT NULL, -- 신고 사유 (상세 내용)
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')), -- 처리 상태 (대기중/해결됨/기각됨)
    admin_notes TEXT, -- 관리자 처리 노트 (어떻게 조치했는지 기록)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- 누구나 신고 가능 (자신의 신고 내역 생성 권한)
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 관리자만이 모든 신고 내역을 조회하고 상태를 변경(심판) 가능
CREATE POLICY "Admins can manage reports" ON public.user_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);

-- 5. 감사 로그 (Audit Logs / Security Halo)
-- 관리자의 모든 중요 활동(시스템 변경, 유저 차단 등)을 기록하여 보안 무결성을 증명하는 테이블입니다.
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- 행위자 (관리자) ID
    action TEXT NOT NULL, -- 수행 동작 (예: 'UPDATE_SETTINGS', 'BAN_USER')
    target_resource TEXT, -- 대상 리소스 (예: 'system_settings', 'users/uuid')
    details JSONB, -- 변경 상세 내용 스냅샷 (JSON)
    ip_address TEXT, -- 접속 IP 주소 (추적용)
    user_agent TEXT, -- 브라우저/기기 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 감사 로그 조회 가능 (보안 감시)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);

-- 로그 삽입은 주로 서버 로직(Service Role)에서 수행되나, 클라이언트 사이드 관리자 액션을 기록할 경우를 대비해 권한 허용
CREATE POLICY "Admins can insert logs" ON public.audit_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);

-- 6. IP 블랙리스트 (IP Blacklist / Iron Wall)
-- 시스템 공격이나 악성 행위를 반복하는 IP를 원천 차단하기 위한 테이블입니다.
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
    ip_address TEXT PRIMARY KEY, -- 차단할 IP 주소
    reason TEXT, -- 차단 사유
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(), -- 차단 일시
    banned_by UUID REFERENCES public.profiles(id) -- 차단 실행한 관리자
);

ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;

-- 관리자만 블랙리스트 추가/해제 가능
CREATE POLICY "Admins can manage blacklist" ON public.ip_blacklist FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
);

-- [초기 데이터 시드] 기본 시스템 설정값 주입
INSERT INTO public.system_settings (key, value, description, is_public)
VALUES 
    ('MAINTENANCE_MODE', 'false', '전역 유지보수 모드 (true로 설정 시 일반 유저 접속 차단)', true),
    ('ANNOUNCEMENT_BANNER', 'null', '상단 공지 배너 설정 {text: "공지내용", color: "blue", link: "/url"}', true)
ON CONFLICT (key) DO NOTHING; -- 이미 존재하면 무시

-- [관리자 승격 명령 예시]
-- 아래 쿼리의 이메일 부분을 본인의 이메일로 수정하여 실행하면 즉시 MASTER 권한을 획득합니다.
-- [주의] 실제 사용 시 주석(--)을 제거하고 실행하세요.
-- UPDATE public.profiles SET role = 'MASTER' WHERE email = 'YOUR_EMAIL@gmail.com'; 
