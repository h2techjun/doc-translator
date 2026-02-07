
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanOrphans() {
    console.log('🔍 Scanning for orphaned admin permissions...');

    // 1. Get all permission records
    const { data: permissions, error: permError } = await supabase
        .from('admin_permissions')
        .select('user_id');

    if (permError) {
        console.error('❌ Error fetching permissions:', permError);
        return;
    }

    if (!permissions || permissions.length === 0) {
        console.log('✅ No permissions found.');
        return;
    }

    console.log(`📊 Total permission records: ${permissions.length}`);

    // 2. Check which users exist in profiles
    const userIds = permissions.map(p => p.user_id);
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .in('id', userIds);

    if (profileError) {
        console.error('❌ Error fetching profiles:', profileError);
        return;
    }

    const existingUserIds = new Set(profiles?.map(p => p.id));
    const orphanIds = userIds.filter(id => !existingUserIds.has(id));

    if (orphanIds.length === 0) {
        console.log('✅ No orphans found. All permissions match existing profiles.');
        return;
    }

    console.log(`⚠️ Found ${orphanIds.length} orphan records. IDs:`, orphanIds);

    // 3. Delete orphans
    const { error: deleteError } = await supabase
        .from('admin_permissions')
        .delete()
        .in('user_id', orphanIds);

    if (deleteError) {
        console.error('❌ Error deleting orphans:', deleteError);
    } else {
        console.log(`🗑️ Successfully deleted ${orphanIds.length} orphan records.`);
    }
}

cleanOrphans();
