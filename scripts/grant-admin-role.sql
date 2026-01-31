-- 관리자 권한 부여 스크립트
-- 사용법: Supabase SQL Editor에서 실행

-- 1. 현재 로그인한 사용자의 이메일로 관리자 권한 부여
-- 아래 이메일을 본인의 이메일로 변경하세요
UPDATE profiles 
SET role = 'ADMIN'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'  -- 여기에 본인 이메일 입력
);

-- 2. 모든 사용자 확인 (디버깅용)
SELECT 
    u.email,
    p.id,
    p.role,
    p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.created_at DESC;

-- 3. 특정 사용자 ID로 관리자 권한 부여
-- UPDATE profiles 
-- SET role = 'ADMIN'
-- WHERE id = 'user-uuid-here';
