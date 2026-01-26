
import PizZip from "pizzip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { translateText } from "@/lib/ai/gemini";

/**
 * 📄 DOCX 문서 번역기 (문단 단위 처리)
 * 
 * 문단(<w:p>)을 기본 단위로 하여 번역하므로 문맥이 유지됩니다.
 */
export class DocxTranslator {
    private buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    /**
     * 대략적인 토큰 수 추정
     */
    private estimateTokens(text: string): number {
        if (/[\u3131-\uD79D]/.test(text)) {
            return text.length * 2;
        }
        return text.split(/\s+/).length * 1.3;
    }

    /**
     * 문단에서 모든 텍스트 추출
     */
    private extractParagraphText(paragraph: Element): string {
        const textNodes = paragraph.getElementsByTagName("w:t");
        let fullText = "";
        for (let i = 0; i < textNodes.length; i++) {
            fullText += textNodes[i].textContent || "";
        }
        return fullText;
    }

    /**
     * 문단에 번역된 텍스트 적용
     */
    private applyTranslationToParagraph(paragraph: Element, translatedText: string): void {
        const textNodes = paragraph.getElementsByTagName("w:t");

        if (textNodes.length === 0) return;

        // 첫 번째 텍스트 노드에 전체 번역 결과를 넣고, 나머지는 비움
        // (서식 유지를 위해 첫 번째 노드만 사용)
        textNodes[0].textContent = translatedText;

        for (let i = 1; i < textNodes.length; i++) {
            textNodes[i].textContent = "";
        }
    }

    /**
     * 문단 기반 청크 생성 (문단은 절대 쪼개지 않음)
     */
    private createParagraphChunks(
        paragraphs: { element: Element; text: string; index: number }[],
        maxTokensPerChunk: number = 2000
    ): { element: Element; text: string; index: number }[][] {
        const chunks: { element: Element; text: string; index: number }[][] = [];
        let currentChunk: { element: Element; text: string; index: number }[] = [];
        let currentTokens = 0;

        for (const para of paragraphs) {
            const paraTokens = this.estimateTokens(para.text);

            // 단일 문단이 너무 크면 별도 청크로
            if (paraTokens > maxTokensPerChunk) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = [];
                    currentTokens = 0;
                }
                chunks.push([para]);
                continue;
            }

            // 현재 청크에 추가하면 제한 초과
            if (currentTokens + paraTokens > maxTokensPerChunk && currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = [para];
                currentTokens = paraTokens;
            } else {
                currentChunk.push(para);
                currentTokens += paraTokens;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    async translate(targetLang: string): Promise<Buffer> {
        console.log("➡️ Loading DOCX...");
        const zip = new PizZip(this.buffer);

        const xmlContent = zip.file("word/document.xml")?.asText();
        if (!xmlContent) {
            throw new Error("Invalid DOCX: word/document.xml not found");
        }

        const doc = new DOMParser().parseFromString(xmlContent, "text/xml");
        const paragraphNodes = doc.getElementsByTagName("w:p");

        console.log(`➡️ Found ${paragraphNodes.length} paragraphs.`);

        // 문단 단위로 텍스트 수집
        const paragraphs: { element: Element; text: string; index: number }[] = [];

        for (let i = 0; i < paragraphNodes.length; i++) {
            const para = paragraphNodes[i] as Element;
            const text = this.extractParagraphText(para);

            if (text.trim().length > 0) {
                paragraphs.push({ element: para, text, index: i });
            }
        }

        if (paragraphs.length === 0) {
            console.log("⚠️ No text found in document.");
            return this.buffer;
        }

        console.log(`➡️ Translating ${paragraphs.length} paragraphs...`);

        // 문단 기반 청크 생성
        const chunks = this.createParagraphChunks(paragraphs, 2000);
        console.log(`➡️ Created ${chunks.length} paragraph-based chunks`);

        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
            const chunk = chunks[chunkIdx];
            const sourceTexts = chunk.map(p => p.text);

            console.log(`   Processing chunk ${chunkIdx + 1}/${chunks.length} (${chunk.length} paragraphs)...`);

            try {
                const prompt = `
You are a professional document translator.
Translate the following JSON array of paragraphs into "${targetLang}" language.
Each element is a complete paragraph. Maintain paragraph structure and meaning.
IMPORTANT: Return ONLY a raw JSON array of strings. No markdown, no explanations.
The output array must have exactly the same number of elements as the input.

Input JSON:
${JSON.stringify(sourceTexts)}
`;

                const rawResponse = await translateText(prompt, targetLang);
                const cleanedJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                let translatedArray: string[] = [];
                try {
                    translatedArray = JSON.parse(cleanedJson);
                } catch (jsonError) {
                    console.error("JSON Parse Error:", cleanedJson.substring(0, 300));
                    throw new Error("Failed to parse JSON");
                }

                if (!Array.isArray(translatedArray)) {
                    throw new Error("Response is not an array");
                }

                // 문단에 번역 적용
                chunk.forEach((para, idx) => {
                    const translated = translatedArray[idx];
                    if (translated) {
                        this.applyTranslationToParagraph(para.element, translated);
                    }
                });

            } catch (err: any) {
                console.error(`Chunk ${chunkIdx + 1} error:`, err.message);

                // 개별 문단 재시도
                console.log(`   🔄 Retrying paragraphs individually...`);

                for (const para of chunk) {
                    try {
                        const translated = await translateText(para.text, targetLang);
                        this.applyTranslationToParagraph(para.element, translated);
                    } catch (retryErr) {
                        console.error(`      ❌ Failed for paragraph ${para.index}`);
                        // 원문 유지 (이미 element에 있음)
                    }
                }
            }
        }

        const newXml = new XMLSerializer().serializeToString(doc);
        zip.file("word/document.xml", newXml);

        return zip.generate({ type: "nodebuffer" });
    }
}
