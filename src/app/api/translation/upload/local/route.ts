import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';
import { StorageManager } from '@/lib/supabase/storage';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const targetLang = formData.get('targetLang') as string || 'ko';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // 1. Validation & Points
        const pageCount = await OfficeTranslationEngine.getPageCount(buffer, extension);
        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        const supabase = await createClient();
        
        // 0. Manual Session Recovery (The Hammer Fix 🔨)
        // If standard getUser() fails, we manually parse the cookie and force the session.
        let { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1];
                if (projectId) {
                    const cookieName = `sb-${projectId}-auth-token`;
                    const authCookie = req.cookies.get(cookieName);

                    if (authCookie) {
                        let tokenValue: string | undefined;
                        let refreshToken: string | undefined;

                        try {
                            // Try parsing plain JSON first
                            const json = JSON.parse(authCookie.value);
                            tokenValue = json.access_token;
                            refreshToken = json.refresh_token;
                        } catch {
                            try {
                                // Try parsing decoded JSON
                                const json = JSON.parse(decodeURIComponent(authCookie.value));
                                tokenValue = json.access_token;
                                refreshToken = json.refresh_token;
                            } catch (e) {
                                console.error("Manual API Cookie Parse Failed:", e);
                            }
                        }

                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) {
                                console.log(`[Upload API] Manual Recovery Success: ${recoverData.user.id}`);
                                user = recoverData.user;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("[Upload API] Recovery Error:", e);
            }
        }

        if (user) {
            // Check balance first to provide detailed error message
            const profile = await PointManager.getUserProfile(user.id);
            
            // Check for Unlimited Tiers
            if (profile.tier !== 'GOLD' && profile.tier !== 'MASTER') {
                 if ((profile.points || 0) < pointsToDeduct) {
                     return NextResponse.json({ 
                        error: `포인트가 부족합니다. (필요: ${pointsToDeduct}P, 보유: ${profile.points || 0}P)`, 
                        isPointError: true 
                     }, { status: 403 });
                 }
            }

            const success = await PointManager.usePoints(
                user.id,
                pointsToDeduct,
                `[Queue] ${file.name} 번역 (${pageCount}p)`
            );
            
            if (!success) {
                // This fallback should rarely be hit if the check above passes, 
                // but kept for safety in case of race conditions
                return NextResponse.json({ error: '포인트 부족', isPointError: true }, { status: 403 });
            }
        } else {
            // Guest or not logged in -> Must log in (as Guest or User) to have points
            return NextResponse.json({ 
                error: '로그인이 필요합니다. (게스트 로그인 포함)', 
                isAuthError: true 
            }, { status: 401 });
        }

        const userId = user!.id;


        // 2. Geo Tracking
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const countryCode = req.headers.get('x-vercel-ip-country') || 'KR'; // Default to KR
        const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

        // Transactional Logic: Points already deducted, now attempt creation.
        // If DB Insert or Storage Upload fails, we MUST refund points.
        try {
            const { data: job, error: jobError } = await supabase
                .from('translation_jobs')
                .insert({
                    user_id: userId,
                    original_filename: file.name,
                    file_extension: extension,
                    file_type: file.type || 'application/octet-stream', // Fixed: Missing constraint
                    target_lang: targetLang,
                    status: 'UPLOADING',
                    page_count: pageCount,
                    file_size: buffer.length,
                    ip_address: ip,
                    country_code: countryCode,
                    country_name: city
                })
                .select()
                .single();

            if (jobError || !job) {
                console.error("DB Insert Failed:", jobError);
                // 🚨 Refund Points
                await PointManager.rewardPoints(userId, pointsToDeduct, `[System] 환불: 업로드 실패 (${file.name})`);
                
                if (!userId && jobError?.code === '42501') {
                    return NextResponse.json({ error: '로그인이 필요합니다.', isAuthError: true }, { status: 401 });
                }
                throw new Error(`Job creation failed: ${jobError?.message}`);
            }

            const jobId = job.id;

            // 3. Upload to Storage
            const inputPath = await StorageManager.uploadInputFile(userId || 'guest', jobId, file);
            if (!inputPath) {
                console.error("Storage Upload Failed");
                // 🚨 Refund Points (Clean up job might be needed too, but most important is points)
                await supabase.from('translation_jobs').delete().eq('id', jobId); // Cleanup zombie job
                await PointManager.rewardPoints(userId, pointsToDeduct, `[System] 환불: 저장소 업로드 실패 (${file.name})`);
                throw new Error("Storage upload failed");
            }

            // 4. Update Job (UPLOADED)
            await supabase
                .from('translation_jobs')
                .update({
                    status: 'UPLOADED',
                    original_file_path: inputPath,
                    progress: 10
                })
                .eq('id', jobId);

            return NextResponse.json({ jobId, status: 'UPLOADED' });

        } catch (innerError: any) {
            // Check if we need to refund here if not already handled
            // (Handled explicitly above for known failure points, but safeguard valid)
            console.error("Transaction Error:", innerError);
            throw innerError; 
        }

    } catch (error: any) {
        console.error('Upload Local Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
