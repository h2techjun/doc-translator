
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { translateText } from "@/lib/ai/gemini";

/**
 * 📊 PowerPoint 문서 번역기 (토큰 기반 청킹)
 * 
 * 슬라이드 내 텍스트 노드를 추출하여 번역하되, 토큰 수를 고려하여 청크를 생성합니다.
 */
export class PptxTranslator {
    private buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    /**
     * 토큰 수 추정
     */
    private estimateTokens(text: string): number {
        if (/[\u3131-\uD79D]/.test(text)) {
            return text.length * 2;
        }
        return text.split(/\s+/).length * 1.3;
    }

    /**
     * 토큰 기반 청크 생성
     */
    private createTokenBasedChunks(
        textNodes: { slideIndex: number; nodeIndex: number; text: string; globalIndex: number }[],
        maxTokensPerChunk: number = 1500
    ): { slideIndex: number; nodeIndex: number; text: string; globalIndex: number }[][] {
        const chunks: { slideIndex: number; nodeIndex: number; text: string; globalIndex: number }[][] = [];
        let currentChunk: { slideIndex: number; nodeIndex: number; text: string; globalIndex: number }[] = [];
        let currentTokens = 0;

        for (const node of textNodes) {
            const nodeTokens = this.estimateTokens(node.text);

            // 단일 노드가 최대 토큰을 초과하는 경우 별도 청크로
            if (nodeTokens > maxTokensPerChunk) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = [];
                    currentTokens = 0;
                }
                chunks.push([node]);
                continue;
            }

            // 현재 청크에 추가하면 최대 토큰을 초과하는 경우
            if (currentTokens + nodeTokens > maxTokensPerChunk && currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = [node];
                currentTokens = nodeTokens;
            } else {
                currentChunk.push(node);
                currentTokens += nodeTokens;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    async translate(targetLang: string): Promise<Buffer> {
        console.log("➡️ Loading PPTX Archive...");
        const zip = new PizZip(this.buffer);

        // 슬라이드 파일 목록 추출
        const slideFiles = Object.keys(zip.files).filter(name =>
            name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        );

        if (slideFiles.length === 0) {
            console.log("⚠️ No slides found in PPTX.");
            return this.buffer;
        }

        console.log(`➡️ Found ${slideFiles.length} slides.`);

        // 1. 모든 슬라이드에서 텍스트 노드 수집
        const allTextNodes: {
            slideIndex: number;
            nodeIndex: number;
            text: string;
            globalIndex: number;
        }[] = [];

        const slideData: {
            filename: string;
            xmlDoc: Document;
            textNodes: Element[];
        }[] = [];

        for (let i = 0; i < slideFiles.length; i++) {
            const slideFile = slideFiles[i];
            const xmlContent = zip.file(slideFile)?.asText();
            if (!xmlContent) continue;

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));

            slideData.push({
                filename: slideFile,
                xmlDoc: xmlDoc,
                textNodes: textNodes
            });

            textNodes.forEach((node, idx) => {
                const text = node.textContent?.trim() || '';
                if (text.length > 0) {
                    allTextNodes.push({
                        slideIndex: i,
                        nodeIndex: idx,
                        text: text,
                        globalIndex: allTextNodes.length
                    });
                }
            });
        }

        if (allTextNodes.length === 0) {
            console.log("⚠️ No text nodes found in slides.");
            return this.buffer;
        }

        console.log(`➡️ Found ${allTextNodes.length} text nodes across all slides.`);

        // 2. 토큰 기반 청크 생성
        const chunks = this.createTokenBasedChunks(allTextNodes, 1500);
        const translatedMap: Record<number, string> = {};

        console.log(`➡️ Created ${chunks.length} token-based chunks`);

        // 3. 청크별 번역 (Bulk JSON + Retry)
        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
            const chunk = chunks[chunkIdx];
            const sourceTexts = chunk.map(c => c.text);

            console.log(`   Processing chunk ${chunkIdx + 1}/${chunks.length} (${chunk.length} nodes)...`);

            try {
                const prompt = `
You are a professional presentation translator.
Translate the following JSON array of text nodes into "${targetLang}" language.
Maintain terminology and formatting appropriate for presentations.
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
                    console.error("JSON Parse Error:", cleanedJson.substring(0, 200));
                    throw new Error("JSON Parse Failed");
                }

                if (!Array.isArray(translatedArray)) {
                    throw new Error("Not Array");
                }

                chunk.forEach((item, idx) => {
                    if (translatedArray[idx]) {
                        translatedMap[item.globalIndex] = translatedArray[idx];
                    } else {
                        translatedMap[item.globalIndex] = item.text;
                    }
                });

            } catch (err: any) {
                console.error(`Chunk ${chunkIdx + 1} error:`, err.message);

                // 개별 노드 재시도
                console.log(`   🔄 Retrying nodes individually...`);

                for (const node of chunk) {
                    try {
                        const translated = await translateText(node.text, targetLang);
                        translatedMap[node.globalIndex] = translated;
                    } catch (retryErr) {
                        console.error(`      ❌ Failed for node at slide ${node.slideIndex}`);
                        translatedMap[node.globalIndex] = node.text;
                    }
                }
            }
        }

        // 4. 번역 결과를 XML에 적용
        allTextNodes.forEach((item) => {
            if (translatedMap[item.globalIndex]) {
                const slide = slideData[item.slideIndex];
                const node = slide.textNodes[item.nodeIndex];
                if (node) {
                    node.textContent = translatedMap[item.globalIndex];
                }
            }
        });

        // 5. 수정된 XML을 ZIP에 다시 저장
        slideData.forEach((slide) => {
            const serializer = new XMLSerializer();
            const updatedXml = serializer.serializeToString(slide.xmlDoc);
            zip.file(slide.filename, updatedXml);
        });

        // 6. 최종 Buffer 생성
        const newBuffer = zip.generate({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        console.log("✅ PPTX translation complete.");
        return newBuffer;
    }
}
