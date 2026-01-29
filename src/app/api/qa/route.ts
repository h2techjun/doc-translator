import { NextRequest, NextResponse } from 'next/server';
import { DocxTranslationStrategy } from '@/lib/translation/strategies/docx-strategy';
import { XlsxTranslationStrategy } from '@/lib/translation/strategies/xlsx-strategy';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import * as ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
    const results: any = {
        docx: { success: false, message: '' },
        xlsx: { success: false, message: '' },
    };

    try {
        console.log('[QA] 🚀 Starting E2E Test...');

        // --- 1. DOCX Test ---
        console.log('[QA] 📄 Testing DOCX Strategy Initialization...');
        const docxStrategy = new DocxTranslationStrategy();

        console.log('[QA] 📄 Generating DOCX Buffer...');
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "QA Verification", heading: "Heading1" }),
                ],
            }],
        });
        const docBuffer = await Packer.toBuffer(doc);

        console.log('[QA] 📄 Running DOCX Translation...');
        const translatedDocx = await docxStrategy.translate(docBuffer, 'Korean');

        results.docx.success = translatedDocx.length > 0;
        results.docx.message = `Generated ${translatedDocx.length} bytes`;
        console.log('[QA] ✅ DOCX Success');

        // --- 2. XLSX Test ---
        console.log('[QA] 📊 Testing XLSX Strategy Initialization...');
        const xlsxStrategy = new XlsxTranslationStrategy();

        console.log('[QA] 📊 Generating XLSX Buffer...');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('QA Test');
        sheet.addRow(['ID', 'Original Text']);
        sheet.addRow([1, 'Hello World']);
        const xlsxBuffer = Buffer.from(await workbook.xlsx.writeBuffer() as ArrayBuffer);

        console.log('[QA] 📊 Running XLSX Translation...');
        const translatedXlsx = await xlsxStrategy.translate(xlsxBuffer, 'Korean');

        results.xlsx.success = translatedXlsx.length > 0;
        results.xlsx.message = `Generated ${translatedXlsx.length} bytes`;
        console.log('[QA] ✅ XLSX Success');

        return NextResponse.json({
            status: 'success',
            verification: results
        });

    } catch (error: any) {
        console.error('[QA] ❌ Test Failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
