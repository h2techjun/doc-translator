import { BaseTranslationStrategy } from './base-strategy';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { ContentAnalyzer } from '../../ai/content-analyzer';

/**
 * 📊 엑셀 문서 번역 전략 (PizZip + XML 핸들링 - Perfect Preservation)
 * 
 * 🎯 목적 (Purpose):
 * Excel 파일의 텍스트(셀 내용, 시트 이름)만 정밀하게 번역하고,
 * 나머지 XML 구조(도형, 차트, 매크로, 스타일)는 건드리지 않아 100% 보존합니다.
 */
export class XlsxTranslationStrategy extends BaseTranslationStrategy {
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[XlsxStrategy] 📊 Excel 번역 시작 (XML Mode | 목표: ${targetLang})`);

        const zip = new PizZip(fileBuffer);
        const parser = new DOMParser();
        const serializer = new XMLSerializer();

        // 번역 대상 수집
        // 1. Shared Strings (대부분의 셀 텍스트)
        // 2. Workbook (시트 이름)
        // 3. Worksheets (인라인 텍스트)

        const tasks: {
            type: 'sharedString' | 'sheetName' | 'inlineString';
            node: Element;
            text: string;
            file: string;
        }[] = [];

        // ---------------------------------------------------------
        // 1️⃣ Shared Strings 처리 (xl/sharedStrings.xml)
        // ---------------------------------------------------------
        const sharedStringsXml = zip.file('xl/sharedStrings.xml')?.asText();
        let sharedStringsDoc: Document | null = null;

        if (sharedStringsXml) {
            sharedStringsDoc = parser.parseFromString(sharedStringsXml, 'application/xml');
            // <t> 태그 수집. 단, <rPh> (발음 기호) 내부의 <t>는 제외해야 함.
            // 보통 <si><t>...</t></si> 또는 <si><r><t>...</t></r></si> 구조임.
            const textNodes = sharedStringsDoc.getElementsByTagName('t');

            for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                // 부모가 <rPh> (발음 가이드)인 경우 스킵
                if (node.parentNode?.nodeName === 'rPh') continue;

                const text = node.textContent || '';
                if (text.trim().length > 0) {
                    tasks.push({ type: 'sharedString', node, text, file: 'xl/sharedStrings.xml' });
                }
            }
        }

        // ---------------------------------------------------------
        // 2️⃣ Workbook 처리 (시트 이름) (xl/workbook.xml)
        // ---------------------------------------------------------
        const workbookXml = zip.file('xl/workbook.xml')?.asText();
        let workbookDoc: Document | null = null;

        if (workbookXml) {
            workbookDoc = parser.parseFromString(workbookXml, 'application/xml');
            const sheets = workbookDoc.getElementsByTagName('sheet');

            for (let i = 0; i < sheets.length; i++) {
                const sheet = sheets[i];
                const name = sheet.getAttribute('name');
                if (name && name.trim().length > 0) {
                    // 시트 이름도 번역 대상 (단, XML 속성이므로 Element가 아닌 별도 처리 필요하지만
                    // 여기서는 편의상 Element에 임시 마킹하거나, 나중에 setAttribute로 처리)
                    // tasks 구조를 유연하게 사용하기 위해 node는 sheet Element로, 
                    // text는 name 값으로 저장.
                    tasks.push({ type: 'sheetName', node: sheet, text: name, file: 'xl/workbook.xml' });
                }
            }
        }

        // ---------------------------------------------------------
        // 3️⃣ Worksheets 처리 (Inline Strings) (xl/worksheets/sheet*.xml)
        // ---------------------------------------------------------
        // 파일 목록 중 xl/worksheets/sheet*.xml 패턴 찾기
        const worksheetFiles = Object.keys(zip.files).filter(path => path.startsWith('xl/worksheets/sheet') && path.endsWith('.xml'));
        const worksheetDocs: Record<string, Document> = {};

        for (const filePath of worksheetFiles) {
            const xml = zip.file(filePath)?.asText();
            if (!xml) continue;

            const doc = parser.parseFromString(xml, 'application/xml');
            worksheetDocs[filePath] = doc;

            // <is><t>...</t></is> 패턴 찾기
            // 'is' 태그 아래의 't' 태그
            const isTags = doc.getElementsByTagName('is');
            for (let i = 0; i < isTags.length; i++) {
                const tTags = isTags[i].getElementsByTagName('t');
                for (let j = 0; j < tTags.length; j++) {
                    const node = tTags[j];
                    const text = node.textContent || '';
                    if (text.trim().length > 0) {
                        tasks.push({ type: 'inlineString', node, text, file: filePath });
                    }
                }
            }
        }

        console.log(`  ✅ 번역 대상 추출 완료: 총 ${tasks.length}개 항목`);

        if (tasks.length === 0) {
            console.log('  ⚠️ 번역할 텍스트가 없습니다. 원본 반환.');
            return fileBuffer;
        }

        // ---------------------------------------------------------
        // 4️⃣ 배치 번역 실행 (Smart Batching) - DocxStrategy와 동일 로직
        // ---------------------------------------------------------
        const MAX_BATCH_CHARS = 10000; // 엑셀은 텍스트가 짧고 많으므로 조금 줄임
        const MAX_BATCH_SEGMENTS = 150;

        const batches: { texts: string[]; indices: number[] }[] = [];
        let currentBatchTexts: string[] = [];
        let currentBatchIndices: number[] = [];
        let currentBatchLength = 0;

        for (let i = 0; i < tasks.length; i++) {
            const text = tasks[i].text;

            // 숫자만 있는 셀, 날짜 등은 번역 제외 (휴리스틱)
            if (/^[\d\s\.\,\%\$\-]+$/.test(text)) continue;

            if (currentBatchTexts.length > 0 &&
                (currentBatchLength + text.length > MAX_BATCH_CHARS || currentBatchTexts.length >= MAX_BATCH_SEGMENTS)) {

                batches.push({ texts: currentBatchTexts, indices: currentBatchIndices });
                currentBatchTexts = [];
                currentBatchIndices = [];
                currentBatchLength = 0;
            }

            currentBatchTexts.push(text);
            currentBatchIndices.push(i); // tasks 배열의 인덱스 저장
            currentBatchLength += text.length;
        }

        if (currentBatchTexts.length > 0) {
            batches.push({ texts: currentBatchTexts, indices: currentBatchIndices });
        }

        console.log(`  📊 배치 최적화: ${batches.length}개 배치`);

        // 실행
        for (let i = 0; i < batches.length; i++) {
            const { texts, indices } = batches[i];

            // Throttling
            const delay = this.currentModelSpec.throttleDelayMs;
            if (i > 0 && delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`  🔬 Processing Batch ${i + 1}/${batches.length} (${texts.length} items)`);
            const translatedBatch = await this.translateBatch(texts, targetLang);

            // 결과 적용
            translatedBatch.forEach((translated, batchIndex) => {
                const taskIndex = indices[batchIndex];
                const task = tasks[taskIndex];

                if (task.type === 'sheetName') {
                    // 시트 이름은 길이 제한(31자) 및 특수문자 제한이 있음
                    // 안전하게 처리: 31자 자르기, 특수문자(: \ / ? * [ ]) 제거
                    let safeName = translated.replace(/[:\\\/\?\*\[\]]/g, '_').substring(0, 31);
                    (task.node as Element).setAttribute('name', safeName);
                } else {
                    // 일반 텍스트 (<t> 태그)
                    task.node.textContent = translated;
                }
            });
        }

        // ---------------------------------------------------------
        // 5️⃣ XML 저장 및 ZIP 재압축
        // ---------------------------------------------------------

        // Shared Strings 저장
        if (sharedStringsDoc) {
            zip.file('xl/sharedStrings.xml', serializer.serializeToString(sharedStringsDoc));
        }

        // Workbook 저장
        if (workbookDoc) {
            zip.file('xl/workbook.xml', serializer.serializeToString(workbookDoc));
        }

        // Worksheets 저장
        for (const filePath in worksheetDocs) {
            zip.file(filePath, serializer.serializeToString(worksheetDocs[filePath]));
        }

        const resultBuffer = zip.generate({ type: 'nodebuffer' });
        console.log(`  ✅ Excel 번역 완료 (출력: ${resultBuffer.length} bytes)`);

        return resultBuffer;
    }
}
