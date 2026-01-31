import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OfficeTranslationEngine } from '@/lib/translation/engine';
import { StorageManager } from '@/lib/supabase/storage';

export const maxDuration = 60; // 1분

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
    const { jobId } = params;
    const body = await req.json().catch(() => ({}));
    const { outputFormat = 'docx' } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Get Job
    // If guest, we need to bypass RLS or allow anon select? 
    // Assuming logged-in user for now.

    const { data: job, error } = await supabase
        .from('translation_jobs')
        .select('*')
        .eq('id', jobId)
        // .eq('user_id', user?.id) // Guest support tricky here without admin key
        .single();

    if (error || !job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status === 'COMPLETED' || job.status === 'PROCESSING') {
        return NextResponse.json({ message: 'Already processing or completed', status: job.status });
    }

    // 2. Set Processing
    await supabase.from('translation_jobs').update({ status: 'PROCESSING', progress: 20 }).eq('id', jobId);

    try {
        // 3. Download
        const fileBlob = await StorageManager.downloadFile(job.original_file_path);
        const buffer = Buffer.from(await fileBlob.arrayBuffer());

        // 4. Translate
        // Progress update simulation? (Not easy in serverless without streaming)
        // We just await the whole thing.
        const result = await OfficeTranslationEngine.translateFile(buffer, job.original_filename, job.target_lang);

        // 5. Upload Result
        const outputFilename = `translated_${job.original_filename}`;
        const userFolder = job.user_id || 'guest';
        const outputPath = await StorageManager.uploadOutputFile(userFolder, jobId, outputFilename, result.file);

        if (!outputPath) throw new Error("Output upload failed");

        // 6. Complete
        await supabase
            .from('translation_jobs')
            .update({
                status: 'COMPLETED',
                progress: 100,
                translated_file_url: outputPath, // We store Path here
                remaining_seconds: 0
            })
            .eq('id', jobId);

        return NextResponse.json({ status: 'COMPLETED', jobId });

    } catch (err: any) {
        console.error("Translation Execution Failed:", err);
        await supabase.from('translation_jobs').update({
            status: 'FAILED',
            error_message: err.message
        }).eq('id', jobId);

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
