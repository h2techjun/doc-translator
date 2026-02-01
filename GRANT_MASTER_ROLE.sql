-- ==============================================================================
-- [Grant MASTER] 최고 최고 관리자(MASTER) 권한 부여
-- 주의: 이 권한은 시스템의 모든 부분에 접근할 수 있습니다.
-- ==============================================================================

UPDATE public.profiles
SET role = 'MASTER'
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'h2techjun@gmail.com' -- 👈 본인 이메일 확인
);

-- 확인
SELECT u.email, p.role 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'MASTER';
