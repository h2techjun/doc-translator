
-- 🚨 중요: 이 스크립트를 Supabase Dashboard > SQL Editor에서 실행해주세요!
-- (비동기 번역 및 수익화 기능을 위한 필수 테이블과 정책입니다)

-- 1. 번역 작업 (Translation Jobs) 테이블 생성
CREATE TABLE IF NOT EXISTS public.translation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 파일 메타데이터
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- 번역 설정
    target_lang TEXT NOT NULL,
    output_format TEXT NOT NULL DEFAULT 'docx',
    
    -- 상태 및 진행률
    status TEXT NOT NULL DEFAULT 'IDLE', -- IDLE, UPLOADING, PROCESSING, COMPLETED, FAILED
    progress INTEGER NOT NULL DEFAULT 0, -- 0 to 100
    remaining_seconds INTEGER,
    
    -- 스토리지 경로 (Supabase Storage)
    original_file_path TEXT,
    translated_file_path TEXT,
    
    -- 다운로드 URL
    translated_file_url TEXT,
    
    -- 에러 메시지
    error_message TEXT,

    -- 사용자 연결 (Optional)
    user_id UUID REFERENCES auth.users(id)
);

-- 2. RLS 정책 설정 (보안)
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;

-- MVP 테스트를 위해 익명(Anon) 접근 허용 (주의: 실제 서비스 시에는 인증된 사용자만 접근하도록 수정 필요)
CREATE POLICY "Allow anon insert" ON public.translation_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.translation_jobs FOR SELECT USING (true);
CREATE POLICY "Allow anon update" ON public.translation_jobs FOR UPDATE USING (true);

-- 3. 문서 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- 4. 스토리지 정책 설정
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'documents' );
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'documents' );

-- 5. 사용자 테이블 추가 확인 (이미 존재할 수 있음)
-- credit_balance 컬럼이 없으면 에러가 날 수 있으니 확인해주세요.
-- (기존 schema.sql에 users 테이블 정의가 포함되어 있다면 이 부분은 무시해도 됩니다)
