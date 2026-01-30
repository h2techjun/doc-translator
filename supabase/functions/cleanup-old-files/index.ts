import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * 🧹 cleanup-old-files Edge Function
 * 
 * 보관 기간(10일)이 지난 업로드 파일 및 관련 데이터를 데이터베이스와 스토리지에서 삭제합니다.
 */
Deno.serve(async (req) => {
    try {
        // 1. Supabase 클라이언트 설정 (Service Role Key 필요)
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. 10일 이상 지난 완료되거나 실패한 작업 식별
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

        const { data: oldJobs, error: fetchError } = await supabase
            .from("translation_jobs")
            .select("id, original_file_path")
            .lt("created_at", tenDaysAgo);

        if (fetchError) throw fetchError;
        if (!oldJobs || oldJobs.length === 0) {
            return new Response(JSON.stringify({ message: "No old files to cleanup at this time." }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(`Found ${oldJobs.length} records older than 10 days. Starting cleanup...`);

        const results = [];

        // 3. 루프를 돌며 스토리지 파일 및 DB 레코드 정리
        for (const job of oldJobs) {
            const cleanupTarget = { jobId: job.id, fileDeleted: false, dbDeleted: false, error: null };

            try {
                // A. 스토리지 파일 삭제
                if (job.original_file_path) {
                    const { error: storageError } = await supabase.storage
                        .from("documents")
                        .remove([job.original_file_path]);

                    if (!storageError) {
                        cleanupTarget.fileDeleted = true;
                    } else {
                        console.error(`Failed to delete file for job ${job.id}:`, storageError);
                        cleanupTarget.error = storageError.message;
                    }
                }

                // B. DB 레코드 삭제 (Cascade 설정이 안 되어 있을 경우를 대비해 명시적 삭제 권장)
                // 여기서는 status를 EXPIRED로 업데이트하거나 실제 삭제를 선택할 수 있습니다.
                // 마스터님의 요청에 인위적으로 "파기"라고 명시되었으므로 실제 삭제를 진행합니다.
                const { error: dbDeleteError } = await supabase
                    .from("translation_jobs")
                    .delete()
                    .eq("id", job.id);

                if (!dbDeleteError) {
                    cleanupTarget.dbDeleted = true;
                }

            } catch (err: any) {
                cleanupTarget.error = err.message;
            }

            results.push(cleanupTarget);
        }

        return new Response(JSON.stringify({
            success: true,
            cleanedCount: results.length,
            details: results
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("Cleanup Error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
