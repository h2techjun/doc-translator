import { BaseTranslationStrategy } from './base-strategy';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { ContentAnalyzer } from '../../ai/content-analyzer';

/**
 * 📊 파워포인트 문서 번역 전략 (PizZip + XML 핸들링 - Perfect Preservation)
 * 
 * 🎯 목적 (Purpose):
 * PPTX 파일의 모든 객체(도형, 애니메이션, 차트)를 보존하면서 텍스트만 번역합니다.
 * 
 * 🏗️ 아키텍처 (Architecture):
 * - `ppt/slides/slide*.xml`: 각 슬라이드의 텍스트 처리
 * - `ppt/notesSlides/notesSlide*.xml`: 발표자 노트 처리 (선택적)
 * - `<a:t>` 태그: 실제 텍스트 콘텐츠
 */
export class PptxTranslationStrategy extends BaseTranslationStrategy {
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[PptxStrategy] 🎨 PPTX 시각적 최적화 모드 가동 (Font Scaling & Auto-fit)`);

        const zip = new PizZip(fileBuffer);
        const parser = new DOMParser();
        const serializer = new XMLSerializer();

        // 탐색 대상 파일 확장 (슬라이드 + 다이어그램 + 차트)
        const targetFiles = Object.keys(zip.files).filter(path =>
            (path.startsWith('ppt/slides/slide') ||
                path.startsWith('ppt/diagrams/data') ||
                path.startsWith('ppt/charts/chart')) &&
            path.endsWith('.xml')
        );

        const tasks: {
            original: string;
            nodes: Element[];
            pNode: Element; // Paragraph node for font scaling
            filePath: string;
        }[] = [];

        const xmlDocs: Record<string, Document> = {};

        for (const filePath of targetFiles) {
            const xml = zip.file(filePath)?.asText();
            if (!xml) continue;

            const doc = parser.parseFromString(xml, 'application/xml');
            xmlDocs[filePath] = doc;

            // <a:p> (Paragraph) 단위로 수집하여 문맥 보존
            const paragraphs = doc.getElementsByTagName('a:p');

            for (let i = 0; i < paragraphs.length; i++) {
                const pNode = paragraphs[i];
                const tNodes = pNode.getElementsByTagName('a:t');

                if (tNodes.length === 0) continue;

                // 문단 내 모든 텍스트 병합
                let fullText = '';
                const currentTNodes: Element[] = [];
                for (let j = 0; j < tNodes.length; j++) {
                    fullText += tNodes[j].textContent || '';
                    currentTNodes.push(tNodes[j]);
                }

                // 의미 있는 텍스트만 추출
                if (fullText.trim().length > 0 && !/^[\d\s\.\,\%\$\-]+$/.test(fullText)) {
                    tasks.push({
                        original: fullText,
                        nodes: currentTNodes,
                        pNode,
                        filePath
                    });
                }
            }
        }

        console.log(`  ✅ 번역 대상 추출: 총 ${tasks.length}개 문단 (SmartArt 포함)`);

        if (tasks.length === 0) {
            console.log('  ⚠️ 번역할 텍스트가 없습니다.');
            return fileBuffer;
        }

        // 배치 처리 로직
        const MAX_BATCH_CHARS = 10000;
        const batches: { texts: string[]; indices: number[] }[] = [];
        let currentBatchTexts: string[] = [];
        let currentBatchIndices: number[] = [];
        let currentBatchLength = 0;

        for (let i = 0; i < tasks.length; i++) {
            const text = tasks[i].original;
            if (currentBatchTexts.length > 0 && currentBatchLength + text.length > MAX_BATCH_CHARS) {
                batches.push({ texts: currentBatchTexts, indices: currentBatchIndices });
                currentBatchTexts = [];
                currentBatchIndices = [];
                currentBatchLength = 0;
            }
            currentBatchTexts.push(text);
            currentBatchIndices.push(i);
            currentBatchLength += text.length;
        }
        if (currentBatchTexts.length > 0) batches.push({ texts: currentBatchTexts, indices: currentBatchIndices });

        // 번역 실행
        for (let i = 0; i < batches.length; i++) {
            const { texts, indices } = batches[i];
            console.log(`  🔬 Processing Batch ${i + 1}/${batches.length}...`);
            const translatedBatch = await this.translateBatch(texts, targetLang);

            translatedBatch.forEach((translated, batchIndex) => {
                const taskIndex = indices[batchIndex];
                const task = tasks[taskIndex];

                // 1. 텍스트 주입
                if (task.nodes.length > 0) {
                    task.nodes[0].textContent = translated;
                    for (let n = 1; n < task.nodes.length; n++) {
                        task.nodes[n].textContent = '';
                    }
                }

                // 2. 🏁 [Pro] 시각적 최적화 (Visual Optimization)
                const ratio = translated.length / task.original.length;

                // (A) Font Shrinking: 번역문이 20% 이상 길어질 경우 폰트 크기 축소
                if (ratio > 1.2) {
                    const rPrs = task.pNode.getElementsByTagName('a:rPr');
                    for (let k = 0; k < rPrs.length; k++) {
                        const sz = rPrs[k].getAttribute('sz');
                        if (sz) {
                            const originalSize = parseInt(sz);
                            const shrinkFactor = Math.max(0.6, 1 / Math.sqrt(ratio));
                            rPrs[k].setAttribute('sz', Math.floor(originalSize * shrinkFactor).toString());
                        }
                    }
                }

                // (B) Auto-fit Injection: 도형 내 텍스트 넘침 방지 속성 강제 주입
                try {
                    let parent = task.pNode.parentNode;
                    while (parent && parent.nodeName !== 'p:txBody' && parent.nodeName !== 'p:sp') {
                        parent = parent.parentNode;
                    }

                    if (parent) {
                        const bodyPrs = (parent as Element).getElementsByTagName('a:bodyPr');
                        if (bodyPrs.length > 0) {
                            const bodyPr = bodyPrs[0];
                            const hasAutofit = bodyPr.getElementsByTagName('a:normAutofit').length > 0 ||
                                bodyPr.getElementsByTagName('a:spAutoFit').length > 0;

                            if (!hasAutofit) {
                                const normAutofit = xmlDocs[task.filePath].createElement('a:normAutofit');
                                normAutofit.setAttribute('fontScale', '80000'); // 80%
                                normAutofit.setAttribute('lnSpcReduction', '20000'); // 20%
                                bodyPr.appendChild(normAutofit);
                            }
                        }
                    }
                } catch (e) {
                    // Ignore errors in visual optimization
                }
            });
        }

        // 결과 저장
        for (const filePath in xmlDocs) {
            zip.file(filePath, serializer.serializeToString(xmlDocs[filePath]));
        }

        const resultBuffer = zip.generate({ type: 'nodebuffer' });
        console.log(`  ✅ PPTX 번역 및 최적화 완료 (출력: ${resultBuffer.length} bytes)`);

        return resultBuffer;
    }
}
