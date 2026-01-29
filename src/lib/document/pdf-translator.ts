
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from "docx";
import { translateDocument } from "@/lib/ai/gemini";

/**
 * 📄 PDF 문서 번역기 (JSON Structure Mode v4.1 - Stability Patch)
 * 
 * v4.1 업데이트:
 * - JSON Truncation Repair: Gemini 응답이 길어서 잘릴 경우, 마지막 유효한 객체까지 살리고 닫아서 에러 방지
 * - Align / Merge / Border 로직 유지 및 강화
 */

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

export class PdfTranslator {
    private buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    async translate(targetLang: string): Promise<Buffer> {
        console.log("➡️ Loading PDF for Gemini Vision (JSON Mode v4.1 - Stability)...");

        let jsonContent = "[]";
        try {
            console.log("➡️ Asking Gemini to extract structure as JSON...");
            const rawResponse = await translateDocument(this.buffer, "application/pdf", targetLang);

            let cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            cleanJson = cleanJson.replace(/,(\s*[\}\]])/g, '$1'); // Trailing comma fix

            // ⚠️ JSON 끊김 현상(Truncation) 감지 및 복구
            if (!cleanJson.trim().endsWith("]")) {
                console.warn("⚠️ JSON output was truncated. Attempting auto-repair...");
                cleanJson = this.repairJson(cleanJson);
            }

            jsonContent = cleanJson;
            console.log(`✅ Gemini generated JSON (${jsonContent.length} chars)`);
        } catch (e: any) {
            console.error("❌ Gemini Vision Error:", e);
            throw new Error("Failed to extract content via Gemini Vision.");
        }

        try {
            const elements: DocElement[] = JSON.parse(jsonContent);
            return await this.generateDocxFromJson(elements);
        } catch (e) {
            console.error("❌ JSON Construction Error:", e);
            return await this.createFallbackDoc(jsonContent);
        }
    }

    /**
     * 끊긴 JSON 문자열을 복구하는 함수
     * 전략: 마지막으로 닫힌 객체('}')까지만 살리고, 배열 닫기(']')를 붙임.
     */
    private repairJson(jsonStr: string): string {
        try {
            // 1. 마지막 닫는 중괄호 위치 찾기
            const lastCurly = jsonStr.lastIndexOf("}");
            if (lastCurly === -1) return "[]"; // 객체가 하나도 없으면 빈 배열

            // 2. 그 뒤를 다 잘라버림
            let fixed = jsonStr.substring(0, lastCurly + 1);

            // 3. 배열로 닫아줌
            if (!fixed.endsWith("]")) {
                fixed += "]";
            }
            return fixed;
        } catch (e) {
            console.error("JSON Repair failed:", e);
            return "[]";
        }
    }

    private async generateDocxFromJson(elements: DocElement[]): Promise<Buffer> {
        console.log(`➡️ Constructing DOCX from ${elements.length} structure elements...`);

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

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        return await Packer.toBuffer(doc);
    }

    // --- Helper Methods ---

    private mapAlignment(align?: AlignString): any {
        if (align === "center") return AlignmentType.CENTER;
        if (align === "right") return AlignmentType.RIGHT;
        return AlignmentType.BOTH; // Default to Justified/Left
    }

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

    private createParagraph(text: string, align?: AlignString): Paragraph {
        return new Paragraph({
            children: [new TextRun({ text: text, font: "Malgun Gothic", size: 22 })],
            spacing: { after: 120 },
            alignment: this.mapAlignment(align)
        });
    }

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

    private createImagePlaceholder(text: string, align?: AlignString): Table {
        // 이미지는 여전히 박스로 표시하되, 정렬만 적용
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

    private createBullet(text: string): Paragraph {
        return new Paragraph({
            text: text,
            bullet: { level: 0 },
            spacing: { after: 100 }
        });
    }

    private async createFallbackDoc(content: string): Promise<Buffer> {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "JSON Parse Error (Still Failed)", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ children: [new TextRun({ text: content, font: "Consolas", size: 16 })] })
                ]
            }]
        });
        return await Packer.toBuffer(doc);
    }
}
