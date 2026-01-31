-- Create translation_jobs table if not exists
create table if not exists translation_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- nullable for guest? or mandatory? Assuming nullable based on previous code.
  original_filename text not null,
  file_extension text,
  target_lang text not null default 'en',
  
  -- S3/Storage Paths
  original_file_path text, 
  translated_file_url text, -- Keeping name for compatibility, but storing Path is better.
  
  status text not null default 'pending', -- UPLOADING, UPLOADED, PROCESSING, COMPLETED, FAILED
  progress integer default 0,
  page_count integer default 0,
  file_size integer default 0,
  
  remaining_seconds integer,
  error_message text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table translation_jobs enable row level security;

-- Policies (Re-runnable)
do $$ 
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own jobs') then
        create policy "Users can insert their own jobs" on translation_jobs for insert with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own jobs') then
        create policy "Users can view their own jobs" on translation_jobs for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update their own jobs') then
        create policy "Users can update their own jobs" on translation_jobs for update using (auth.uid() = user_id);
    end if;
end $$;

-- Storage bucket settings (Implicit via UI usually)
