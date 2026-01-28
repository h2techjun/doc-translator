import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import ExcelJS from 'exceljs';
import * as fs from 'fs';

async function generateTestFiles() {
    console.log('🧪 Generating Test Samples...');

    // 1. DOCX Generation
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "Global DocTranslator Test Document", heading: "Heading1" }),
                new Paragraph({ text: "This is a sample document to verify layout preservation." }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Column 1")] }),
                                new TableCell({ children: [new Paragraph("Column 2")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Performance")] }),
                                new TableCell({ children: [new Paragraph("Excellent")] }),
                            ],
                        }),
                    ],
                }),
            ],
        }],
    });

    const docBuffer = await Packer.toBuffer(doc);
    if (!fs.existsSync('tests')) fs.mkdirSync('tests');
    fs.writeFileSync('tests/sample.docx', docBuffer);
    console.log('✅ Created tests/sample.docx');

    // 2. XLSX Generation
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Translation Test');
    sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Original Text', key: 'text', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
    ];
    sheet.addRow({ id: 1, text: 'Welcome to the future of translation.', status: 'Active' });
    sheet.addRow({ id: 2, text: 'This cell has complex formulas and formatting.', status: 'Pending' });

    // Add Rich Text
    const richCell = sheet.getCell('B4');
    richCell.value = {
        richText: [
            { text: 'This is ', font: { bold: true, color: { argb: 'FFFF0000' } } },
            { text: 'rich text ', font: { italic: true } },
            { text: 'preservation test.', font: { underline: true } },
        ],
    };

    await workbook.xlsx.writeFile('tests/sample.xlsx');
    console.log('✅ Created tests/sample.xlsx');
}

generateTestFiles();
