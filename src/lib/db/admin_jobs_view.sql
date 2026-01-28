CREATE OR REPLACE VIEW admin_jobs_view AS
SELECT 
  tj.id,
  tj.user_id,
  au.email AS user_email,
  tj.original_filename,
  tj.status,
  tj.progress,
  tj.target_language,
  tj.created_at,
  tj.completed_at,
  tj.error_message
FROM public.translation_jobs tj
LEFT JOIN auth.users au ON tj.user_id = au.id; 
-- Note: Joining auth.users directly might require security definer or service role.
-- We will use this view via Service Role in the API.
