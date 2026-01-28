
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { DocxTranslationStrategy } from '../src/lib/translation/strategies/docx-strategy';
import { XlsxTranslationStrategy } from '../src/lib/translation/strategies/xlsx-strategy';
import { Document, Packer, Paragraph } from 'docx';
import * as ExcelJS from 'exceljs';

async function runTest() {
    console.log('[Script] 🚀 Starting Standalone QA Test...');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[Script] API Key Check: ${apiKey ? 'Present' : 'MISSING'}`);

    try {
        // --- 1. DOCX Test ---
        console.log('[Script] 📄 Testing DOCX Strategy Initialization...');
        const docxStrategy = new DocxTranslationStrategy();

        console.log('[Script] 📄 Generating DOCX Buffer...');
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "QA Verification", heading: "Heading1" }),
                ],
            }],
        });
        const docBuffer = await Packer.toBuffer(doc);


        console.log('[Script] 📄 Running DOCX Translation...');
        const translatedDocx = await docxStrategy.translate(docBuffer, 'Korean');
        console.log(`[Script] ✅ DOCX Success: Generated ${translatedDocx.length} bytes`);

        // Save DOCX
        const fs = require('fs');
        fs.writeFileSync('translated_output.docx', translatedDocx);
        console.log('[Script] 💾 Saved: translated_output.docx');

        // --- 2. XLSX Test ---
        console.log('[Script] 📊 Testing XLSX Strategy Initialization...');
        const xlsxStrategy = new XlsxTranslationStrategy();

        console.log('[Script] 📊 Generating XLSX Buffer...');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('QA Test');
        sheet.addRow(['ID', 'Original Text']);
        sheet.addRow([1, 'Hello World']);
        const xlsxBuffer = await workbook.xlsx.writeBuffer() as unknown as Buffer;

        console.log('[Script] 📊 Running XLSX Translation...');
        const translatedXlsx = await xlsxStrategy.translate(xlsxBuffer, 'Korean');
        console.log(`[Script] ✅ XLSX Success: Generated ${translatedXlsx.length} bytes`);

        // Save XLSX
        fs.writeFileSync('translated_output.xlsx', translatedXlsx);
        console.log('[Script] 💾 Saved: translated_output.xlsx');

        console.log('[Script] 🎉 All Tests Passed!');
        process.exit(0);

    } catch (error: any) {
        console.error('[Script] ❌ Test Failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

runTest();
