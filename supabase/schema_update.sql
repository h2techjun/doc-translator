
-- Translation Jobs Table
-- Stores the state of translation tasks (Async Pipeline)

CREATE TABLE IF NOT EXISTS public.translation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- File Metadata
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Translation Config
    target_lang TEXT NOT NULL,
    output_format TEXT NOT NULL DEFAULT 'docx',
    
    -- Status & Progress
    status TEXT NOT NULL DEFAULT 'IDLE', -- IDLE, UPLOADING, PROCESSING, COMPLETED, FAILED
    progress INTEGER NOT NULL DEFAULT 0, -- 0 to 100
    remaining_seconds INTEGER, -- Estimated time remaining
    
    -- Storage Paths (Supabase Storage)
    original_file_path TEXT, -- Path in 'documents' bucket
    translated_file_path TEXT, -- Path in 'documents' bucket
    
    -- Public URLs (for download)
    translated_file_url TEXT,
    
    -- Error handling
    error_message TEXT,

    -- Ownership (Optional for now, but good practice)
    user_id UUID REFERENCES auth.users(id)
);

-- RLS Policies (Enable access for anon usage if needed, or authenticated only)
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anon insert/select for MVP (WARNING: Lock down in production)
CREATE POLICY "Allow anon insert" ON public.translation_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.translation_jobs FOR SELECT USING (true);
CREATE POLICY "Allow anon update" ON public.translation_jobs FOR UPDATE USING (true);

-- Storage Bucket for Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'documents' );
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'documents' );
