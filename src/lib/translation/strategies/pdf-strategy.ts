import { BaseTranslationStrategy } from './base-strategy';
import { translateDocument } from '@/lib/ai/gemini';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from "docx";

/**
 * 📄 PDF 문서 번역 전략 (Gemini Vision 기반 - Buffer Mode)
 * 
 * 🎯 목적 (Purpose):
 * PDF 파일을 Gemini Vision API로 분석하여 구조를 추출하고, 번역된 내용을 DOCX로 재구성합니다.
 * 
 * 🔄 처리 흐름 (Workflow):
 * 1. PDF 파일을 Gemini Vision API에 전송
 * 2. Gemini가 문서 구조를 JSON 형태로 추출 및 번역
 * 3. JSON을 파싱하여 문서 요소 배열 생성
 * 4. docx 라이브러리로 DOCX 파일 생성
 * 5. 생성된 DOCX를 Buffer로 반환
 * 
 * ✅ 보존되는 요소 (Preserved Elements):
 * - 제목 계층 구조 (H1, H2, H3)
 * - 문단 정렬 (좌, 중앙, 우)
 * - 표 구조 (셀 병합, 열 너비, 테두리)
 * - 이미지 위치 (플레이스홀더로 표시)
 * - 글머리 기호 목록
 * 
 * ⚠️ 제한사항 (Limitations):
 * - PDF → DOCX 변환 (원본 PDF 형식 유지 불가)
 * - 이미지는 플레이스홀더로만 표시 (실제 이미지 미포함)
 * - 복잡한 레이아웃은 단순화될 수 있음
 * - Gemini API 응답 길이 제한으로 긴 문서는 잘릴 수 있음
 * 
 * 📦 의존성 (Dependencies):
 * - @/lib/ai/gemini: Gemini Vision API 호출
 * - docx: DOCX 파일 생성 라이브러리
 * - BaseTranslationStrategy: 기본 번역 기능 제공
 */

// 📐 타입 정의 (Type Definitions)
type AlignString = "left" | "center" | "right";

type TableCellData = {
    text: string;
    row_span?: number;
    col_span?: number;
    align?: AlignString;
};

type DocElement =
    | { type: "heading"; level: number; text: string; align?: AlignString }
    | { type: "paragraph"; text: string; align?: AlignString }
    | { type: "table"; rows: (TableCellData | string)[][]; col_widths_percent?: number[]; has_border?: boolean }
    | { type: "image_placeholder"; text: string; align?: AlignString }
    | { type: "bullet_list"; items: string[] };

export class PdfTranslationStrategy extends BaseTranslationStrategy {
    /**
     * 📄 PDF 파일 번역 실행 (고급 하이브리드 모드)
     * 
     * 🔄 처리 흐름:
     * 1. pdf-lib로 텍스트 + 좌표 + 서식 정보 추출
     * 2. Gemini Vision으로 문서 구조 (표, 이미지) 파악
     * 3. 두 정보를 결합하여 고품질 DOCX 생성
     * 
     * @param fileBuffer - 원본 PDF 파일의 Buffer
     * @param targetLang - 목표 언어 (예: "Korean", "English", "Japanese")
     * @returns 번역된 DOCX 파일의 Buffer
     * 
     * @throws {Error} PDF 로드 실패 시
     * @throws {Error} Gemini Vision API 호출 실패 시
     */
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[PdfStrategy] 📄 고급 하이브리드 PDF 번역 시작 (목표 언어: ${targetLang})`);

        // 🔀 병렬 처리: pdf-lib 추출 + Gemini Vision 분석을 동시에 실행
        const [pdfTextData, geminiStructure] = await Promise.all([
            this.extractTextWithPdfLib(fileBuffer),
            this.analyzeStructureWithGemini(fileBuffer, targetLang)
        ]);

        console.log(`  ✅ 데이터 수집 완료:`);
        console.log(`     - pdf-lib: ${pdfTextData.totalChars} 문자 추출`);
        console.log(`     - Gemini: ${geminiStructure.length}개 구조 요소 인식`);

        // 🔗 두 정보를 결합하여 DOCX 생성
        return await this.mergeAndGenerateDocx(pdfTextData, geminiStructure, targetLang);
    }

    /**
     * 📖 pdf-lib로 텍스트 + 서식 정보 추출
     * 
     * 추출 정보:
     * - 텍스트 내용 및 좌표 (x, y)
     * - 글꼴 이름 및 크기
     * - 페이지별 레이아웃
     */
    private async extractTextWithPdfLib(fileBuffer: Buffer): Promise<any> {
        const PDFDocument = (await import('pdf-lib')).PDFDocument;
        const pdfDoc = await PDFDocument.load(fileBuffer);

        const pages = pdfDoc.getPages();
        const textData: any = {
            pages: [],
            totalChars: 0
        };

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();

            // ⚠️ pdf-lib는 텍스트 추출 API가 제한적이므로
            // pdf-parse를 사용하여 보완
            textData.pages.push({
                pageNumber: i + 1,
                width,
                height,
                // TODO: pdf-parse로 텍스트 + 좌표 추출
                text: `[Page ${i + 1} - ${width}x${height}]`
            });
        }

        // pdf-parse로 전체 텍스트 추출
        const pdfParse = (await import('pdf-parse')) as any;
        const parseResult = await (pdfParse.default || pdfParse)(fileBuffer);
        textData.totalChars = parseResult.text.length;
        textData.fullText = parseResult.text;

        console.log(`  📖 pdf-lib 추출: ${pages.length}페이지, ${textData.totalChars}자`);
        return textData;
    }

    /**
     * 🔍 Gemini Vision으로 문서 구조 분석
     * 
     * 인식 요소:
     * - 제목 계층 구조
     * - 표 (셀 병합, 테두리)
     * - 이미지 위치
     * - 문단 정렬
     */
    private async analyzeStructureWithGemini(fileBuffer: Buffer, targetLang: string): Promise<DocElement[]> {
        console.log("  🔍 Gemini Vision API에 구조 분석 요청 중...");

        let jsonContent = "[]";
        try {
            const rawResponse = await translateDocument(fileBuffer, "application/pdf", targetLang);

            // JSON 정제
            let cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            cleanJson = cleanJson.replace(/,(\s*[\}\]])/g, '$1');

            // JSON 끊김 복구
            if (!cleanJson.trim().endsWith("]")) {
                console.warn("  ⚠️ JSON 응답 잘림 감지, 복구 중...");
                cleanJson = this.repairJson(cleanJson);
            }

            jsonContent = cleanJson;
            console.log(`  ✅ Gemini Vision 분석 완료 (JSON: ${jsonContent.length} chars)`);
        } catch (e: any) {
            console.error("  ❌ Gemini Vision 에러:", e.message);
            // Fallback: 빈 구조 반환 (pdf-lib 데이터만 사용)
            return [];
        }

        try {
            return JSON.parse(jsonContent) as DocElement[];
        } catch (e) {
            console.error("  ❌ JSON 파싱 실패, 빈 구조 반환");
            return [];
        }
    }

    /**
     * 🔗 pdf-lib 데이터 + Gemini 구조를 결합하여 DOCX 생성
     * 
     * 전략:
     * 1. Gemini 구조를 기본 골격으로 사용
     * 2. pdf-lib 텍스트 데이터로 서식 보강
     * 3. 누락된 텍스트는 pdf-parse 결과로 보완
     */
    private async mergeAndGenerateDocx(
        pdfTextData: any,
        geminiStructure: DocElement[],
        targetLang: string
    ): Promise<Buffer> {
        console.log(`  🔨 하이브리드 DOCX 생성 중...`);

        const children: any[] = [];

        // 🎯 전략 1: Gemini 구조가 있으면 우선 사용
        if (geminiStructure.length > 0) {
            console.log(`  ✅ Gemini 구조 기반 생성 (${geminiStructure.length}개 요소)`);

            for (const el of geminiStructure) {
                switch (el.type) {
                    case "heading":
                        children.push(this.createHeading(el.text, el.level, el.align));
                        break;
                    case "paragraph":
                        children.push(this.createParagraph(el.text, el.align));
                        break;
                    case "table":
                        children.push(this.createTable(el.rows, el.col_widths_percent, el.has_border));
                        children.push(new Paragraph({ text: "" }));
                        break;
                    case "image_placeholder":
                        children.push(this.createImagePlaceholder(el.text, el.align));
                        break;
                    case "bullet_list":
                        el.items.forEach(item => children.push(this.createBullet(item)));
                        break;
                }
            }
        }
        // 🎯 전략 2: Gemini 실패 시 pdf-parse 텍스트로 Fallback
        else {
            console.warn(`  ⚠️ Gemini 구조 없음, pdf-parse 텍스트로 Fallback`);

            // pdf-parse 텍스트를 번역하여 단순 문단으로 구성
            const fullText = pdfTextData.fullText || "";
            const paragraphs = fullText.split('\n\n').filter((p: string) => p.trim().length > 0);

            for (const para of paragraphs.slice(0, 50)) { // 최대 50개 문단
                const translatedText = await this.translateText(para.trim(), targetLang);
                children.push(this.createParagraph(translatedText));
            }
        }

        // 📄 DOCX 문서 생성
        const doc = new Document({
            sections: [{
                properties: {},
                children: children.length > 0 ? children : [
                    new Paragraph({ text: "문서 변환 실패: 내용을 추출할 수 없습니다." })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        console.log(`  ✅ 하이브리드 DOCX 생성 완료 (크기: ${buffer.length} bytes)`);
        return buffer;
    }

    /**
     * 🔧 끊긴 JSON 문자열 복구
     * 
     * Gemini API 응답이 길이 제한으로 잘린 경우, 마지막으로 완성된 객체까지만 살리고
     * 배열을 올바르게 닫아서 유효한 JSON으로 만듭니다.
     * 
     * @param jsonStr - 잘린 JSON 문자열
     * @returns 복구된 JSON 문자열
     */
    private repairJson(jsonStr: string): string {
        try {
            // 마지막 닫는 중괄호 위치 찾기
            const lastCurly = jsonStr.lastIndexOf("}");
            if (lastCurly === -1) return "[]"; // 객체가 하나도 없으면 빈 배열

            // 그 뒤를 모두 제거
            let fixed = jsonStr.substring(0, lastCurly + 1);

            // 배열 닫기
            if (!fixed.endsWith("]")) {
                fixed += "]";
            }

            console.log(`  🔧 JSON 복구 완료 (${jsonStr.length} → ${fixed.length} chars)`);
            return fixed;
        } catch (e) {
            console.error("  ❌ JSON 복구 실패:", e);
            return "[]";
        }
    }

    /**
     * 📝 JSON 구조를 DOCX 파일로 변환
     * 
     * @param elements - 문서 요소 배열
     * @returns DOCX 파일 Buffer
     */
    private async generateDocxFromJson(elements: DocElement[]): Promise<Buffer> {
        console.log(`  🔨 DOCX 생성 중... (요소 수: ${elements.length})`);

        const children: any[] = [];

        for (const el of elements) {
            switch (el.type) {
                case "heading":
                    children.push(this.createHeading(el.text, el.level, el.align));
                    break;
                case "paragraph":
                    children.push(this.createParagraph(el.text, el.align));
                    break;
                case "table":
                    children.push(this.createTable(el.rows, el.col_widths_percent, el.has_border));
                    children.push(new Paragraph({ text: "" })); // 표 뒤 간격
                    break;
                case "image_placeholder":
                    children.push(this.createImagePlaceholder(el.text, el.align));
                    break;
                case "bullet_list":
                    el.items.forEach(item => children.push(this.createBullet(item)));
                    break;
            }
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        console.log(`  ✅ DOCX 생성 완료 (크기: ${buffer.length} bytes)`);
        return buffer;
    }

    // --- DOCX 요소 생성 헬퍼 메서드 ---

    /**
     * 🎨 정렬 문자열을 docx AlignmentType으로 변환
     */
    private mapAlignment(align?: AlignString): any {
        if (align === "center") return AlignmentType.CENTER;
        if (align === "right") return AlignmentType.RIGHT;
        return AlignmentType.BOTH; // 기본값: 양쪽 정렬
    }

    /**
     * 📌 제목 생성
     */
    private createHeading(text: string, level: number, align?: AlignString): Paragraph {
        let headingLevel: any = HeadingLevel.HEADING_1;
        if (level === 2) headingLevel = HeadingLevel.HEADING_2;
        if (level === 3) headingLevel = HeadingLevel.HEADING_3;

        return new Paragraph({
            text: text,
            heading: headingLevel,
            spacing: { before: 240, after: 120 },
            alignment: align ? this.mapAlignment(align) : AlignmentType.CENTER
        });
    }

    /**
     * 📝 문단 생성
     */
    private createParagraph(text: string, align?: AlignString): Paragraph {
        return new Paragraph({
            children: [new TextRun({ text: text, font: "Malgun Gothic", size: 22 })],
            spacing: { after: 120 },
            alignment: this.mapAlignment(align)
        });
    }

    /**
     * 📊 표 생성 (셀 병합, 열 너비, 테두리 지원)
     */
    private createTable(rows: (TableCellData | string)[][], colWidths?: number[], hasBorder: boolean = true): Table {
        const borderStyle = hasBorder ? BorderStyle.SINGLE : BorderStyle.NIL;
        const borderSize = hasBorder ? 1 : 0;
        const borderColor = hasBorder ? "000000" : "Auto";

        const tableRows = rows.map((rowContent) => {
            const cells = rowContent.map((cellData, colIndex) => {
                let text = "";
                let rowSpan = 1;
                let colSpan = 1;
                let align: AlignString = "left";

                if (typeof cellData === "string") {
                    text = cellData;
                } else {
                    text = cellData.text;
                    rowSpan = cellData.row_span || 1;
                    colSpan = cellData.col_span || 1;
                    align = cellData.align || "left";
                }

                let widthPercent = 100 / rowContent.length;
                if (colWidths && colWidths.length > colIndex) {
                    widthPercent = colWidths[colIndex];
                }

                return new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: text || "", font: "Malgun Gothic", size: 20 })],
                        alignment: this.mapAlignment(align)
                    })],
                    borders: {
                        top: { style: borderStyle, size: borderSize, color: borderColor },
                        bottom: { style: borderStyle, size: borderSize, color: borderColor },
                        left: { style: borderStyle, size: borderSize, color: borderColor },
                        right: { style: borderStyle, size: borderSize, color: borderColor },
                    },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    width: { size: widthPercent, type: WidthType.PERCENTAGE },
                    rowSpan: rowSpan,
                    columnSpan: colSpan,
                });
            });
            return new TableRow({ children: cells });
        });

        return new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
        });
    }

    /**
     * 🖼️ 이미지 플레이스홀더 생성
     */
    private createImagePlaceholder(text: string, align?: AlignString): Table {
        return new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [new TextRun({ text: text, bold: true, color: "666666" })],
                                    alignment: AlignmentType.CENTER
                                })
                            ],
                            borders: {
                                top: { style: BorderStyle.DASHED, size: 1, color: "888888" },
                                bottom: { style: BorderStyle.DASHED, size: 1, color: "888888" },
                                left: { style: BorderStyle.DASHED, size: 1, color: "888888" },
                                right: { style: BorderStyle.DASHED, size: 1, color: "888888" },
                            },
                            shading: { fill: "EEEEEE" },
                            margins: { top: 400, bottom: 400, left: 100, right: 100 }
                        })
                    ]
                })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: align ? this.mapAlignment(align) : AlignmentType.CENTER
        });
    }

    /**
     * 🔘 글머리 기호 생성
     */
    private createBullet(text: string): Paragraph {
        return new Paragraph({
            text: text,
            bullet: { level: 0 },
            spacing: { after: 100 }
        });
    }

    /**
     * ⚠️ Fallback 문서 생성 (JSON 파싱 실패 시)
     */
    private async createFallbackDoc(content: string): Promise<Buffer> {
        console.warn("  ⚠️ Fallback 문서 생성 중...");
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "JSON 파싱 에러 발생", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({
                        children: [new TextRun({
                            text: "Gemini Vision API 응답을 파싱하는 중 에러가 발생했습니다. 원본 응답:",
                            font: "Malgun Gothic",
                            size: 22
                        })]
                    }),
                    new Paragraph({
                        children: [new TextRun({
                            text: content.substring(0, 5000), // 최대 5000자만 표시
                            font: "Consolas",
                            size: 16
                        })]
                    })
                ]
            }]
        });
        return await Packer.toBuffer(doc);
    }
}
