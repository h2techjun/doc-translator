-- 🛡️ 관리자 기능 대폭 강화 (Admin Improvements)
-- 사용자 상태 관리 및 세밀한 권한 제어 시스템 구축

-- 1. 사용자 프로필 상태 컬럼 추가
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN 
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'banned_until') THEN 
        ALTER TABLE public.profiles ADD COLUMN banned_until TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN 
        ALTER TABLE public.profiles ADD COLUMN ban_reason TEXT;
    END IF;
END $$;

-- 2. 관리자 세밀 권한 테이블 (Admin Granular Permissions)
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL, -- 'READ_USERS', 'MANAGE_USERS', 'MANAGE_POINTS', 'VIEW_LOGS', 'MANAGE_SETTINGS'
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, permission)
);

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- 3. 관리자 전용 감사 로그 (Admin Specific Audit Logs)
-- 기존 audit_logs가 있으나, 관리 활동을 더 명확히 분리하여 관리하기 위해 별도 생성
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'BAN_USER', 'UNBAN_USER', 'ADD_PERMISSION', 'UPDATE_POINTS'
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RLS 보안 정책 설정
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- MASTER 권한을 가진 사용자만 권한 관리 가능
CREATE POLICY "Only MASTER can manage admin permissions" ON public.admin_permissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MASTER')
    );

-- ADMIN 이상은 권한 조회 가능
CREATE POLICY "Admins can view permissions" ON public.admin_permissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
    );

-- ADMIN 이상은 로그 기록 및 조회 가능
CREATE POLICY "Admins can view and create action logs" ON public.admin_actions_log
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MASTER'))
    );

-- 5. 관리자 통계 기능을 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT count(*) FROM profiles),
        'active_users', (SELECT count(*) FROM profiles WHERE status = 'ACTIVE'),
        'banned_users', (SELECT count(*) FROM profiles WHERE status = 'BANNED'),
        'total_translations', (SELECT count(*) FROM translation_jobs),
        'completed_translations', (SELECT count(*) FROM translation_jobs WHERE status = 'COMPLETED'),
        'pending_translations', (SELECT count(*) FROM translation_jobs WHERE status = 'PENDING'),
        'today_new_users', (SELECT count(*) FROM profiles WHERE created_at >= CURRENT_DATE),
        'today_translations', (SELECT count(*) FROM translation_jobs WHERE created_at >= CURRENT_DATE)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
