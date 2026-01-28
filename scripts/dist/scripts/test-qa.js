"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const docx_strategy_1 = require("../src/lib/translation/strategies/docx-strategy");
const xlsx_strategy_1 = require("../src/lib/translation/strategies/xlsx-strategy");
const docx_1 = require("docx");
const ExcelJS = __importStar(require("exceljs"));
async function runTest() {
    console.log('[Script] 🚀 Starting Standalone QA Test...');
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[Script] API Key Check: ${apiKey ? 'Present' : 'MISSING'}`);
    try {
        // --- 1. DOCX Test ---
        console.log('[Script] 📄 Testing DOCX Strategy Initialization...');
        const docxStrategy = new docx_strategy_1.DocxTranslationStrategy();
        console.log('[Script] 📄 Generating DOCX Buffer...');
        const doc = new docx_1.Document({
            sections: [{
                    children: [
                        new docx_1.Paragraph({ text: "QA Verification", heading: "Heading1" }),
                    ],
                }],
        });
        const docBuffer = await docx_1.Packer.toBuffer(doc);
        console.log('[Script] 📄 Running DOCX Translation...');
        const translatedDocx = await docxStrategy.translate(docBuffer, 'Korean');
        console.log(`[Script] ✅ DOCX Success: Generated ${translatedDocx.length} bytes`);
        // --- 2. XLSX Test ---
        console.log('[Script] 📊 Testing XLSX Strategy Initialization...');
        const xlsxStrategy = new xlsx_strategy_1.XlsxTranslationStrategy();
        console.log('[Script] 📊 Generating XLSX Buffer...');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('QA Test');
        sheet.addRow(['ID', 'Original Text']);
        sheet.addRow([1, 'Hello World']);
        const xlsxBuffer = await workbook.xlsx.writeBuffer();
        console.log('[Script] 📊 Running XLSX Translation...');
        const translatedXlsx = await xlsxStrategy.translate(xlsxBuffer, 'Korean');
        console.log(`[Script] ✅ XLSX Success: Generated ${translatedXlsx.length} bytes`);
        console.log('[Script] 🎉 All Tests Passed!');
        process.exit(0);
    }
    catch (error) {
        console.error('[Script] ❌ Test Failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}
runTest();
