
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { PDFDocument, rgb } from 'pdf-lib';
// fetch is global in Node 18+ 
// If node version is recent, fetch is global. If not, might need to import. 
// However, in this environment, it's safer to use 'http' or verify 'fetch'. 
// Assuming Node 18+ (Next.js 14 requires it).

// Consts
const API_URL = 'http://localhost:3000/api/translation';
const TEST_DIR = path.join(process.cwd(), 'test-files');

// Ensure test dir exists
if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR);
}

// 1. Generate/Prepare Files
async function prepareFiles() {
    console.log('📂 Preparing test files...');

    // XLSX
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test');
    sheet.getCell('A1').value = 'Hello World';
    sheet.getCell('A2').value = 'This is a test document.';
    await workbook.xlsx.writeFile(path.join(TEST_DIR, 'test.xlsx'));
    console.log('✅ Created test.xlsx');

    // PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Hello World. This is a secure PDF.', {
        x: 50,
        y: 450,
        size: 30,
        color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(TEST_DIR, 'test.pdf'), pdfBytes);
    console.log('✅ Created test.pdf');

    // DOCX (Copy from mammoth fixtures)
    const docxSource = path.join(process.cwd(), 'node_modules/mammoth/test/test-data/single-paragraph.docx');
    if (fs.existsSync(docxSource)) {
        fs.copyFileSync(docxSource, path.join(TEST_DIR, 'test.docx'));
        console.log('✅ Prepared test.docx');
    } else {
        console.warn('⚠️ Could not find sample.docx in node_modules');
    }
}

// 2. Upload & Translate Flow
async function testFile(filename: string, fileType: string) {
    const filePath = path.join(TEST_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`⏭️ Skipping ${filename} (Not found)`);
        return;
    }

    console.log(`\n🚀 Testing ${filename}...`);
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    try {
        // A. Request Upload URL
        const uploadRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: JSON.stringify({
                filename,
                fileType,
                size: stats.size,
                targetLang: 'ko'
            }),
            headers: {
                'Content-Type': 'application/json',
                'x-test-user-id': 'cm6bt8x3p0000abcde1234567'
            }
        });

        if (!uploadRes.ok) throw new Error(`Upload Request Failed: ${uploadRes.status} ${await uploadRes.text()}`);
        const { uploadUrl, jobId, fileKey } = await uploadRes.json() as any;
        console.log(`   Detailed: Job Created (${jobId})`);

        // B. Upload to Storage (S3/MinIO)
        const s3Res = await fetch(uploadUrl, {
            method: 'PUT',
            body: fileBuffer,
            headers: { 'Content-Type': fileType }
        });
        if (!s3Res.ok) throw new Error(`S3 Upload Failed: ${s3Res.status}`);
        console.log(`   Detailed: Uploaded to Storage`);

        // C. Start Translation
        const outputFormat = filename.endsWith('xlsx') ? 'xlsx' : (filename.endsWith('pdf') ? 'pdf' : 'docx');
        const startRes = await fetch(`${API_URL}/${jobId}/start`, {
            method: 'POST',
            body: JSON.stringify({
                targetLang: 'ko',
                outputFormat
            }),
            headers: {
                'Content-Type': 'application/json',
                'x-test-user-id': 'cm6bt8x3p0000abcde1234567'
            }
        });
        if (!startRes.ok) throw new Error(`Start Failed: ${await startRes.text()}`);
        console.log(`   Detailed: Translation Started`);

        // D. Poll Status
        let attempts = 0;
        while (attempts < 30) { // Max 60 seconds
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await fetch(`${API_URL}/${jobId}`, {
                headers: {
                    'x-test-user-id': 'e2e-test-user-id'
                }
            });
            const data = await statusRes.json() as any;

            process.stdout.write(`.`); // progress indicator

            if (data.status === 'COMPLETED') {
                console.log(`\n✅ ${filename} COMPLETED!`);
                console.log(`   Download: ${data.translatedFileUrl}`);
                return;
            } else if (data.status === 'FAILED') {
                console.error(`\n❌ ${filename} FAILED: ${data.error}`);
                return;
            }
            attempts++;
        }
        console.error(`\n⏰ ${filename} Timed out`);

    } catch (error: any) {
        console.error(`\n❌ Error testing ${filename}:`, error.message);
    }
}

async function main() {
    // Check Health First
    try {
        const health = await fetch('http://localhost:3000/api/health');
        console.log('🏥 Health Status:', await health.json());
    } catch (e) {
        console.error('❌ Server is not running on 3000');
        process.exit(1);
    }

    await prepareFiles();

    // NOTE: Order matters? No.
    await testFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await testFile('test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    await testFile('test.pdf', 'application/pdf');
}

main();
