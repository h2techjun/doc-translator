-- ==============================================================================
-- [Force Password Reset & Admin Grant] 비밀번호 강제 변경 및 관리자 권한 부여
-- 대상: gagum80@hotmail.com
-- 비밀번호: 2424g4
-- ==============================================================================

-- 1. 암호화 기능을 위한 확장 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    target_email TEXT := 'gagum80@hotmail.com';
    target_pwd TEXT := '2424g4';
    v_user_id UUID;
BEGIN
    -- 유저 ID 조회
    SELECT id INTO v_user_id FROM auth.users WHERE email = target_email;

    IF v_user_id IS NOT NULL THEN
        -- 1. 비밀번호 강제 업데이트 (Bcrypt 해싱 적용) 및 이메일 인증 처리
        UPDATE auth.users
        SET encrypted_password = crypt(target_pwd, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()), -- 이미 인증되었으면 유지, 아니면 현재 시간
            confirmation_token = NULL, -- 기존 토큰 무효화
            recovery_token = NULL,
            updated_at = now(),
            raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb
        WHERE id = v_user_id;

        -- 2. 프로필 권한을 ADMIN으로 설정
        -- (role 제약조건이 있다면 이 쿼리가 성공해야 함)
        UPDATE public.profiles
        SET role = 'ADMIN'
        WHERE id = v_user_id;
        
        RAISE NOTICE '✅ 성공: % 계정의 비밀번호가 변경되고 ADMIN 권한이 부여되었습니다.', target_email;
    ELSE
        -- 계정이 없을 경우 경고
        RAISE EXCEPTION '❌ 실패: % 계정을 찾을 수 없습니다. 사용자가 회원가입이 되어 있거나 대시보드에 존재해야 합니다.', target_email;
    END IF;
END $$;

-- 3. 결과 확인
SELECT u.email, p.role, u.email_confirmed_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'gagum80@hotmail.com';
