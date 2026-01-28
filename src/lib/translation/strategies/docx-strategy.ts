import { Readable, PassThrough } from 'stream';
import { BaseTranslationStrategy } from './base-strategy';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { ContentAnalyzer } from '../../ai/content-analyzer';

/**
 * 📝 워드 문서 번역 전략 (PizZip + XML 핸들링 - Paragraph Mode)
 * 
 * 🎯 목적 (Purpose):
 * Word 문서의 텍스트를 '문단(Paragraph)' 단위로 병합하여 번역함으로써
 * 문맥 단절 및 잔여 텍스트(Residual Text) 문제를 근본적으로 해결합니다.
 * 
 * ⚠️ Trade-off:
 * 문단 내의 스타일(글자 색, 굵기 등)이 혼재된 경우, 
 * 번역 후에는 문단의 **첫 번째 스타일**로 통일될 수 있습니다.
 * 하지만 이는 "번역되지 않은 원문이 남는 것"보다 훨씬 나은 사용자 경험을 제공합니다.
 */
export class DocxTranslationStrategy extends BaseTranslationStrategy {
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[DocxStrategy] 📝 Word 번역 시작 (Paragraph Mode | 목표: ${targetLang})`);

        // 1️⃣ DOCX -> XML 추출
        const zip = new PizZip(fileBuffer);
        const xmlContent = zip.file('word/document.xml')?.asText();
        if (!xmlContent) {
            throw new Error('Word 문서 구조가 올바르지 않습니다 (document.xml 누락)');
        }

        // 2️⃣ XML 파싱
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

        // 3️⃣ 문단(Paragraph) 단위 데이터 추출
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        const batchRequests: { fullText: string; textNodes: Element[] }[] = [];

        // 각 문단을 순회하며 텍스트 수집
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const textNodes = Array.from(p.getElementsByTagName('w:t'));

            if (textNodes.length === 0) continue;

            // 문단 내 텍스트 병합 (Run Aggregation)
            // 예: ["제", "1", "조"] -> "제1조"
            const fullText = textNodes.map(node => node.textContent || '').join('');

            if (fullText.trim().length > 1) { // 1글자 이상의 유의미한 텍스트만
                batchRequests.push({ fullText, textNodes });
            }
        }

        console.log(`  ✅ 번역 대상 문단 발견: ${batchRequests.length}개`);

        // 4️⃣ 모델 분석 (첫 20개 문단 샘플링)
        if (batchRequests.length > 0) {
            const sampleText = batchRequests.slice(0, 20).map(r => r.fullText).join("\n");
            const analyzer = new ContentAnalyzer(process.env.GEMINI_API_KEY!);

            console.log("  🕵️ 문서 유형 분석 중...");
            const analysis = await analyzer.analyzeAndRecommend(sampleText);
            console.log(`  🔍 분석 결과: [${analysis.docType.toUpperCase()}] - ${analysis.reason}`);
            console.log(`  🤖 추천 모델: ${analysis.recommendedModel.name}`);

            this.setModel(analysis.recommendedModel);
        }

        // 5️⃣ 배치 처리 준비
        const MAX_BATCH_CHARS = 15000; // 문맥이 길어지므로 조금 더 보수적으로 잡음
        const MAX_BATCH_SEGMENTS = 100; // 문단 단위이므로 개수를 줄임

        const batches: { texts: string[]; requestIndices: number[] }[] = [];
        let currentBatchTexts: string[] = [];
        let currentBatchIndices: number[] = [];
        let currentBatchLength = 0;

        for (let i = 0; i < batchRequests.length; i++) {
            const text = batchRequests[i].fullText;

            if (currentBatchTexts.length > 0 &&
                (currentBatchLength + text.length > MAX_BATCH_CHARS || currentBatchTexts.length >= MAX_BATCH_SEGMENTS)) {

                batches.push({ texts: currentBatchTexts, requestIndices: currentBatchIndices });
                currentBatchTexts = [];
                currentBatchIndices = [];
                currentBatchLength = 0;
            }

            currentBatchTexts.push(text);
            currentBatchIndices.push(i);
            currentBatchLength += text.length;
        }

        if (currentBatchTexts.length > 0) {
            batches.push({ texts: currentBatchTexts, requestIndices: currentBatchIndices });
        }

        console.log(`  📊 배치 최적화: 총 ${batches.length}개 배치 (문단 ${batchRequests.length}개)`);

        // 6️⃣ 번역 실행 및 결과 주입
        for (let i = 0; i < batches.length; i++) {
            const { texts, requestIndices } = batches[i];

            // Throttling
            const delay = this.currentModelSpec.throttleDelayMs;
            if (i > 0 && delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`  🔬 Processing Batch ${i + 1}/${batches.length} (${texts.length} paragraphs)`);

            // 번역 호출
            const translatedBatch = await this.translateBatch(texts, targetLang);

            // 결과 주입 (Logic Check Re-injection)
            translatedBatch.forEach((translatedText, batchIndex) => {
                const originalRequestIdx = requestIndices[batchIndex];
                const { textNodes } = batchRequests[originalRequestIdx];

                // 🌟 핵심 로직: 첫 번째 노드에 몰아넣고 나머지는 비운다.
                if (textNodes.length > 0) {
                    // 1. 첫 번째 텍스트 노드에 번역본 전체 삽입
                    textNodes[0].textContent = translatedText;

                    // 2. 나머지 노드는 빈 문자열로 처리 (삭제하면 안됨, XML 구조 유지)
                    for (let k = 1; k < textNodes.length; k++) {
                        textNodes[k].textContent = "";
                    }
                }
            });
        }

        // 7️⃣ XML 재조립 및 반환
        const serializer = new XMLSerializer();
        const newXmlContent = serializer.serializeToString(xmlDoc);
        zip.file('word/document.xml', newXmlContent);

        const resultBuffer = zip.generate({ type: 'nodebuffer' });
        console.log(`  ✅ Word 번역 완료 (출력: ${resultBuffer.length} bytes)`);

        return resultBuffer;
    }
}
