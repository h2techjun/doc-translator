import { NextResponse } from 'next/server';

export async function GET() {
    const envVars = Object.keys(process.env).sort();
    const supabaseKeyStatus = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? `Found (Length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` 
        : 'MISSING or Empty';

    return NextResponse.json({
        message: 'Environment Variable Debugger',
        targetKey: 'SUPABASE_SERVICE_ROLE_KEY',
        status: supabaseKeyStatus,
        availableKeys: envVars.filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN')) // Hide sensitive keys from list
    });
}
