import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PointManager } from '@/lib/payment/point-manager';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, type } = await req.json();

        // Security check: Only allow specific small reward amounts for now
        if (amount > 5) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        await PointManager.rewardPoints(
            user.id,
            amount,
            `광고 시청 리워드 (${type})`
        );

        return NextResponse.json({ success: true, pointsClaimed: amount });

    } catch (error: any) {
        console.error('Reward API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
