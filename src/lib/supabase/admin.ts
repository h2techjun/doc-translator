import { createClient } from '@supabase/supabase-js';

/**
 * Service Role Client for Admin Operations
 * WARNING: This client bypasses RLS. Use only in secure server-side environments.
 */
export const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
