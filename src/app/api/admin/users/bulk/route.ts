import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // 1. 관리자 권한 확인 (Master or Admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile || !['ADMIN', 'MASTER'].includes(currentUserProfile.role)) {
        return NextResponse.json({ error: '권한이 없습니다 (Admin only).' }, { status: 403 });
    }

    // 2. 요청 본문 파싱
    const { userIds, action, value } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json({ error: '대상 사용자가 선택되지 않았습니다.' }, { status: 400 });
    }

    try {
        let updateData: any = {};
        
        switch (action) {
            case 'update_role':
                // MASTER만 MASTER/ADMIN으로 승격 가능
                if (value === 'MASTER' || value === 'ADMIN') {
                    if (currentUserProfile.role !== 'MASTER') {
                        return NextResponse.json({ error: '관리자 임명은 MASTER만 가능합니다.' }, { status: 403 });
                    }
                }
                updateData = { role: value };
                break;
            
            case 'update_status':
                updateData = { status: value }; // 'ACTIVE', 'SUSPENDED', 'BANNED'
                break;
            
            case 'grant_points':
                // 포인트 지급은 별도 RPC 필요하거나, 반복문으로 처리 (Trigger가 동작하도록)
                // 여기서는 편의상 반복문으로 처리 (배치 최적화는 추후 고려)
                const pointAmount = parseInt(value);
                if (isNaN(pointAmount)) return NextResponse.json({ error: '유효하지 않은 포인트 값입니다.' }, { status: 400 });

                const errors = [];
                for (const targetId of userIds) {
                    // 현재 포인트 조회
                    const { data: profile } = await supabase.from('profiles').select('points').eq('id', targetId).single();
                    if (profile) {
                         const { error } = await supabase.from('profiles').update({ 
                            points: (profile.points || 0) + pointAmount 
                        }).eq('id', targetId);
                        if (error) errors.push({ id: targetId, error: error.message });
                    }
                }
                
                if (errors.length > 0) {
                    return NextResponse.json({ 
                        message: `일부 작업 실패 (${errors.length}건)`, 
                        details: errors 
                    }, { status: 207 }); // 207 Multi-Status
                }
                return NextResponse.json({ success: true, count: userIds.length, message: `${userIds.length}명에게 ${pointAmount}P 지급 완료` });

            default:
                return NextResponse.json({ error: '지원하지 않는 작업입니다.' }, { status: 400 });
        }

        // 일반 업데이트 (Role, Status)
        if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .in('id', userIds);

            if (error) throw error;
        }

        return NextResponse.json({ success: true, count: userIds.length });

    } catch (error: any) {
        console.error('Bulk Action Error:', error);
        return NextResponse.json({ error: error.message || '일괄 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
