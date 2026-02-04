import { createClient } from '@supabase/supabase-js';

/**
 * Service Role Client for Admin Operations
 * WARNING: This client bypasses RLS. Use only in secure server-side environments.
 */
export const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        console.error("❌ Fatal: NEXT_PUBLIC_SUPABASE_URL is missing.");
        throw new Error('Configuration Error: NEXT_PUBLIC_SUPABASE_URL is missing.');
    }

    if (!supabaseServiceRoleKey) {
        console.error("❌ Fatal: SUPABASE_SERVICE_ROLE_KEY is missing. Check Vercel Environment Variables.");
        // Mask the key if it exists but is invalid (e.g. empty string)
        throw new Error(`Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. (Len: ${supabaseServiceRoleKey ? (supabaseServiceRoleKey as string).length : 0})`);
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
