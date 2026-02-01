-- ==============================================================================
-- [Grant ADMIN] 중간 관리자(ADMIN) 권한 부여
-- 주의: 이 권한은 대시보드 접근 및 콘텐츠 관리가 가능합니다.
-- ==============================================================================

-- 아래 'target_user_email@example.com'을 관리자로 임명할 사용자의 이메일로 변경하세요.
UPDATE public.profiles
SET role = 'ADMIN'
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'gagum80@hotmail.com' -- 👈 대상 이메일 수정 필요
);

-- 확인
SELECT email, role 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE role = 'ADMIN';
