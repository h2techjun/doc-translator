
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { POINT_COSTS } from '@/lib/payment/types';
import { PointManager } from '@/lib/payment/point-manager';
import { OfficeTranslationEngine } from '@/lib/translation/engine';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileId, accessToken, filename, mimeType, sizeBytes, targetLang } = body;

        if (!fileId || !accessToken || !targetLang) {
            return NextResponse.json({ error: 'Missing required fields (fileId, accessToken, targetLang)' }, { status: 400 });
        }

        const supabase = await createClient();
        
        // 0. Manual Session Recovery (The Hammer Fix 🔨)
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
                            const json = JSON.parse(authCookie.value);
                            tokenValue = json.access_token;
                            refreshToken = json.refresh_token;
                        } catch {
                            try {
                                const json = JSON.parse(decodeURIComponent(authCookie.value));
                                tokenValue = json.access_token;
                                refreshToken = json.refresh_token;
                            } catch (e) { console.error("Manual API Cookie Parse Failed:", e); }
                        }

                        if (tokenValue && refreshToken) {
                            const { data: recoverData } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: refreshToken
                            });
                            if (recoverData.user) user = recoverData.user;
                        }
                    }
                }
            } catch (e) { console.error("Drive Recovery Error:", e); }
        }

        if (!user) {
            return NextResponse.json({ error: '인증되지 않은 사용자입니다. 구글 드라이브 업로드는 로그인이 필요합니다.' }, { status: 401 });
        }
        
        // 1. Download from Google Drive
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const fileBuffer = Buffer.from(response.data as ArrayBuffer);
        const fileExt = filename.split('.').pop()?.toLowerCase() || 'tmp';

        // 2. Point Calculation
        const pageCount = await OfficeTranslationEngine.getPageCount(fileBuffer, fileExt);
        let pointsToDeduct = POINT_COSTS.BASE_COST;
        if (pageCount > POINT_COSTS.BASE_PAGES) {
            pointsToDeduct += (pageCount - POINT_COSTS.BASE_PAGES) * POINT_COSTS.ADDITIONAL_PAGE_COST;
        }

        // 3. Point Deduction
        const profile = await PointManager.getUserProfile(user.id);
        if (profile.tier !== 'GOLD' && profile.tier !== 'MASTER') {
                if ((profile.points || 0) < pointsToDeduct) {
                    return NextResponse.json({ 
                    error: `포인트가 부족합니다. (필요: ${pointsToDeduct}P, 보유: ${profile.points || 0}P)`, 
                    isPointError: true 
                    }, { status: 403 });
                }
        }

        const pointSuccess = await PointManager.usePoints(
            user.id,
            pointsToDeduct,
            `[Drive] ${filename} 번역 (${pageCount}p)`
        );

        if (!pointSuccess) {
            return NextResponse.json({ error: '포인트 부족', isPointError: true }, { status: 403 });
        }

        // 4. Create Job Record
        const jobId = uuidv4();
        const safeStorageName = `source_file.${fileExt}`;
        // Google Drive uploads go to same 'user_id/job_id' structure
        const objectPath = `${user.id}/${jobId}/${safeStorageName}`;

        // Geo Tracking
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const countryCode = req.headers.get('x-vercel-ip-country') || 'KR';
        const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

        // Transactional Logic: Points already deducted
        try {
            const { error: dbError } = await supabase
                .from('translation_jobs')
                .insert({
                    id: jobId,
                    user_id: user.id,
                    original_filename: filename,
                    file_type: mimeType,
                    file_extension: fileExt,
                    file_size: sizeBytes || 0,
                    target_lang: targetLang,
                    status: 'UPLOADING',
                    original_file_path: objectPath,
                    progress: 0,
                    page_count: pageCount,
                    ip_address: ip,
                    country_code: countryCode,
                    country_name: city
                });

            if (dbError) {
                console.error('DB Job Creation Error:', dbError);
                // 🚨 Refund Points
                await PointManager.rewardPoints(user.id, pointsToDeduct, `[System] 환불: 업로드 실패 (${filename})`);
                return NextResponse.json({ error: 'Failed to create job record' }, { status: 500 });
            }

            // 5. Upload to Supabase Storage
            console.log(`Attempting upload to 'documents/${objectPath}'`);

            const { error: storageError } = await supabase
                .storage
                .from('documents')
                .upload(objectPath, fileBuffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (storageError) {
                console.error('Supabase Storage Detail Error:', JSON.stringify(storageError, null, 2));
                // 🚨 Refund Points
                await supabase.from('translation_jobs').delete().eq('id', jobId); // Cleanup
                await PointManager.rewardPoints(user.id, pointsToDeduct, `[System] 환불: 저장소 업로드 실패 ({filename})`);
                
                return NextResponse.json({
                    error: 'Failed to upload to storage',
                    details: storageError.message
                }, { status: 500 });
            }

            // 6. Update Job Status to UPLOADED
            await supabase
                .from('translation_jobs')
                .update({ status: 'UPLOADED', progress: 10 })
                .eq('id', jobId);

            return NextResponse.json({
                success: true,
                jobId,
                objectPath,
                filename
            });

        } catch (innerError) {
             console.error("Drive Transaction Error:", innerError);
             throw innerError;
        }

    } catch (error: any) {
        console.error('Drive Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
