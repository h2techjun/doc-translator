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
            .select("id, original_file_path, translated_file_path")
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
            const cleanupTarget = { jobId: job.id, filesDeleted: [], dbDeleted: false, error: null };
            const pathsToTrash = [];

            if (job.original_file_path) pathsToTrash.push(job.original_file_path);
            if (job.translated_file_path) pathsToTrash.push(job.translated_file_path);

            try {
                // A. 스토리지 파일 통합 삭제
                if (pathsToTrash.length > 0) {
                    const { data: deletedFiles, error: storageError } = await supabase.storage
                        .from("documents")
                        .remove(pathsToTrash);

                    if (!storageError) {
                        cleanupTarget.filesDeleted = deletedFiles?.map(f => f.name) || [];
                    } else {
                        console.error(`Failed to delete files for job ${job.id}:`, storageError);
                        cleanupTarget.error = storageError.message;
                    }
                }

                // B. DB 레코드 삭제
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
