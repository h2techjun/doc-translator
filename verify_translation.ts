import { DocxTranslationStrategy } from './src/lib/translation/strategies/docx-strategy';
import { XlsxTranslationStrategy } from './src/lib/translation/strategies/xlsx-strategy';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function runTest() {
    console.log('🏁 Starting Translation Quality Verification...');

    const docxStrategy = new DocxTranslationStrategy();
    const xlsxStrategy = new XlsxTranslationStrategy();

    // 1. DOCX Test (Simple placeholder)
    try {
        const docxPath = path.join(process.cwd(), 'tests/sample.docx');
        if (fs.existsSync(docxPath)) {
            console.log('📄 Testing DOCX (Word)...');
            const buffer = fs.readFileSync(docxPath);
            const translated = await docxStrategy.translate(buffer, 'Korean');
            fs.writeFileSync('tests/output_sample_docx.docx', translated);
            console.log('✅ DOCX Test Complete. Check tests/output_sample_docx.docx');
        } else {
            console.log('⚠️ tests/sample.docx not found. Skipping DOCX test.');
        }
    } catch (e) {
        console.error('❌ DOCX Test Failed:', e);
    }

    // 2. XLSX Test
    try {
        const xlsxPath = path.join(process.cwd(), 'tests/sample.xlsx');
        if (fs.existsSync(xlsxPath)) {
            console.log('📊 Testing XLSX (Excel)...');
            const buffer = fs.readFileSync(xlsxPath);
            const translated = await xlsxStrategy.translate(buffer, 'Korean');
            fs.writeFileSync('tests/output_sample_xlsx.xlsx', translated);
            console.log('✅ XLSX Test Complete. Check tests/output_sample_xlsx.xlsx');
        } else {
            console.log('⚠️ tests/sample.xlsx not found. Skipping XLSX test.');
        }
    } catch (e) {
        console.error('❌ XLSX Test Failed:', e);
    }
}

runTest();
