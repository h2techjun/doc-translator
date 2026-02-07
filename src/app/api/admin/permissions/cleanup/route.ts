
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 🛡️ Localhost Only Guard
    const host = req.headers.get('host') || '';
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
         return NextResponse.json({ error: 'Local execution only' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();

    console.log('[Cleanup] Starting orphan cleanup...');

    // 1. Get all permission records
    const { data: perms, error: permError } = await supabaseAdmin.from('admin_permissions').select('user_id');
    
    if (permError) {
        return NextResponse.json({ error: permError.message }, { status: 500 });
    }
    
    if (!perms || perms.length === 0) {
        return NextResponse.json({ message: 'No permissions found' });
    }

    const userIds = perms.map(p => p.user_id);
    console.log(`[Cleanup] Found ${userIds.length} perm records.`);
    
    // 2. Check against profiles
    const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('id').in('id', userIds);
    
    if (profileError) {
         return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const existingIds = new Set(profiles?.map(p => p.id));
    const orphanIds = userIds.filter(id => !existingIds.has(id));

    if (orphanIds.length === 0) {
        console.log('[Cleanup] No orphans found.');
        return NextResponse.json({ message: 'Clean. No orphans found.' });
    }

    console.log(`[Cleanup] Identifying ${orphanIds.length} orphans:`, orphanIds);

    // 3. Delete Orphans
    const { error: deleteError } = await supabaseAdmin.from('admin_permissions').delete().in('user_id', orphanIds);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('[Cleanup] Success.');

    return NextResponse.json({ 
        success: true, 
        deleted_count: orphanIds.length,
        deleted_ids: orphanIds 
    });
}
