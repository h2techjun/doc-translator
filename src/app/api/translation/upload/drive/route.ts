
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

// Helper to convert Node.js stream to Web stream (if needed by Supabase, though upload usually accepts Buffer/ArrayBuffer/Blob/File)
// Actually Supabase upload accepts Blob, File, ArrayBuffer, ArrayBufferView, FormData, or Buffer.
// We will try to read the stream into a buffer for simplicity with small files, or use a stream compatible approach.
// Since we might deal with large files, buffer might be memory intensive.
// But Supabase JS client 'upload' method in Node environment supports Buffer or Stream (depending on version/polyfill).
// Let's try to get ArrayBuffer from the response.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileId, accessToken, filename, mimeType, sizeBytes } = body;

        if (!fileId || !accessToken) {
            return NextResponse.json({ error: 'Missing fileId or accessToken' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Create Job Record
        const jobId = uuidv4();

        // Sanitize object path for storage (Korean/Special characters cause 400 'Invalid key' error)
        // We keep the original filename in the DB, but use a safe name for S3/Storage.
        const fileExt = filename.split('.').pop() || 'tmp';
        const safeStorageName = `source_file.${fileExt}`;
        const objectPath = `${jobId}/${safeStorageName}`;

        // Get user if logged in
        const { data: { user } } = await supabase.auth.getUser();

        const { error: dbError } = await supabase
            .from('translation_jobs')
            .insert({
                id: jobId,
                original_filename: filename, // Keep original name here
                file_type: mimeType,
                file_size: sizeBytes || 0,
                target_lang: 'en',
                status: 'UPLOADING',
                original_file_path: objectPath,
                progress: 0,
                user_id: user?.id || null
            });

        if (dbError) {
            console.error('DB Job Creation Error:', dbError);
            return NextResponse.json({ error: 'Failed to create job record' }, { status: 500 });
        }

        // 2. Download from Google Drive
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const fileBuffer = Buffer.from(response.data as ArrayBuffer);

        // 3. Upload to Supabase Storage
        console.log(`Attempting upload to 'documents/${objectPath}' with size ${fileBuffer.length}, User: ${user?.id || 'Anonymous'}`);

        const { error: storageError } = await supabase
            .storage
            .from('documents')
            .upload(objectPath, fileBuffer, {
                contentType: mimeType,
                upsert: true
            });

        if (storageError) {
            console.error('Supabase Storage Detail Error:', JSON.stringify(storageError, null, 2));
            return NextResponse.json({
                error: 'Failed to upload to storage',
                details: storageError.message,
                hint: 'Check bucket existence and RLS policies.'
            }, { status: 500 });
        }

        // 4. Update Job Status to UPLOADED
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

    } catch (error: any) {
        console.error('Drive Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
