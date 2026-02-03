-- Drop messages table and related objects
-- NOTE: This is a destructive operation. No backup is kept.

-- 1. Drop Policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- 2. Drop Table
DROP TABLE IF EXISTS public.messages;

-- 3. Drop Realtime if enabled (optional, but good practice)
-- drop publication if it exists specifically for messages, but usually it's 'supabase_realtime' for all tables.
-- We just need to remove the table from publication if we were granular, but dropping table handles it.

-- 4. Drop Types if explicitly defined in database (usually they are auto-generated in client)
-- No action needed for TypeScript types here, that's done in client code.
