
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: 쿠폰 등록 및 포인트 적립
export async function POST(req: NextRequest) {
    const { code } = await req.json();

    if (!code) {
        return NextResponse.json({ error: '쿠폰 코드를 입력해주세요.' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. 쿠폰 조회
    const { data: coupon, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

    if (couponError || !coupon) {
        return NextResponse.json({ error: '유효하지 않은 쿠폰입니다.' }, { status: 404 });
    }

    // 2. 유효성 검사 (만료일)
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: '이미 만료된 쿠폰입니다.' }, { status: 400 });
    }

    // 3. 유효성 검사 (전체 사용 한도)
    if (coupon.usage_limit <= coupon.used_count) {
        return NextResponse.json({ error: '선착순 마감된 쿠폰입니다.' }, { status: 400 });
    }

    // 4. 중복 사용 검사
    const { data: redemption } = await supabaseAdmin
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .single();

    if (redemption) {
        return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
    }

    // 5. 포인트 지급 트랜잭션 (포인트 타입인 경우)
    let pointsToAdd = 0;
    if (coupon.discount_type === 'FIXED') {
        pointsToAdd = coupon.discount_value;
    } else {
        // PERCERT 할인은 추후 결제 시 적용 로직이 필요하므로, 현재는 포인트 지급형만 처리
        // 혹은 기획 의도에 따라 %만큼 포인트를 줄 수도 있으나 불명확함.
        // 여기서는 FIXED 타입만 허용하고 PERCENT는 에러 처리하거나 로직 보강 필요.
        // 일단 FIXED 중심으로 구현.
        if (coupon.discount_type !== 'FIXED') {
            return NextResponse.json({ error: '결제 전용 쿠폰입니다. 결제 화면에서 사용해주세요.' }, { status: 400 });
        }
    }

    // 6. DB 업데이트 (Redemption Log + Count Up + Add Points)
    // 이 모든 과정은 원자적이어야 하나, Supabase JS 클라이언트로는 한계가 있음.
    // 실무에서는 Postgres Function으로 묶는 것이 안전함. 여기서는 순차 처리.

    // Record Redemption
    const { error: redeemError } = await supabaseAdmin
        .from('coupon_redemptions')
        .insert({
            coupon_id: coupon.id,
            user_id: user.id
        });

    if (redeemError) {
        return NextResponse.json({ error: '쿠폰 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // Update Token Balance (Increment Points)
    // RPC를 사용하는 것이 좋지만, profiles 테이블 직접 업데이트로 처리
    const { error: pointError } = await supabaseAdmin.rpc('increment_points', {
        user_id_arg: user.id,
        amount_arg: pointsToAdd
    });

    // 만약 RPC가 없다면 직접 update (concurrency issue 가능성 있음)
    if (pointError) {
        // Fallback: Read-Modify-Write (Not safe for high concurrency but okay for MVP)
        const { data: profile } = await supabaseAdmin.from('profiles').select('points').eq('id', user.id).single();
        await supabaseAdmin.from('profiles').update({ points: (profile?.points || 0) + pointsToAdd }).eq('id', user.id);
    }

    // Update Coupon Usage Count
    await supabaseAdmin
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);

    // Create Transaction Record
    await supabaseAdmin.from('point_transactions').insert({
        user_id: user.id,
        amount: pointsToAdd,
        type: 'COUPON',
        description: `쿠폰 등록: ${code}`
    });

    // Notify User
    await supabaseAdmin.from('notifications').insert({
        user_id: user.id,
        type: 'COUPON',
        title: '쿠폰 지급 완료',
        message: `${pointsToAdd} 포인트가 지급되었습니다.`,
        link: '/pricing'
    });

    return NextResponse.json({ success: true, points_added: pointsToAdd });
}
