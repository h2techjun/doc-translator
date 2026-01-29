import { BaseFileTranslator } from '../engine_base';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { TranslatorService, MockTranslatorService } from '../service';

/**
 * @The-Nerd
 * XLSX 레이아웃 보존 번역기 (XML Injection)
 * 엑셀 파일의 텍스트는 대부분 'xl/sharedStrings.xml'에 모여 있습니다.
 * 이 파일만 번역하면 통합 문서 전체의 텍스트가 번역되면서,
 * 시트 내의 차트, 이미지, 스타일, 수식은 완벽하게 유지됩니다.
 */
export class XlsxTranslator extends BaseFileTranslator {
    private service: TranslatorService;

    constructor(service?: TranslatorService) {
        super();
        this.service = service || new MockTranslatorService();
    }

    async parse(buffer: Buffer): Promise<any> {
        const zip = new PizZip(buffer);

        // Shared Strings (공통 문자열 테이블)
        const sharedStringsXml = zip.file('xl/sharedStrings.xml')?.asText();

        // 일부 엑셀은 sharedStrings를 안 쓰고 inlineStr을 쓸 수도 있음 (드묾)
        // 여기서는 Standard한 SharedStrings 방식 우선 지원
        const hasSharedStrings = !!sharedStringsXml;

        return { zip, sharedStringsXml, hasSharedStrings };
    }

    async translate(content: any, targetLang: string): Promise<any> {
        const { zip, sharedStringsXml, hasSharedStrings } = content;

        if (!hasSharedStrings) {
            // TODO: Inline String 처리 로직 추가 (xl/worksheets/sheet*.xml 파싱 필요)
            console.warn('No sharedStrings.xml found. Inline strings implementation needed.');
            return { zip };
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(sharedStringsXml, 'text/xml');

        // <t> 태그가 문자열을 담고 있음
        const tNodes = Array.from(doc.getElementsByTagName('t'));

        // 텍스트 추출
        const texts: string[] = [];
        const nodesToTranslate: Element[] = [];

        tNodes.forEach((node: any) => {
            if (node.textContent && node.textContent.trim().length > 0) {
                texts.push(node.textContent);
                nodesToTranslate.push(node);
            }
        });

        if (texts.length === 0) return { zip };

        // 번역 실행
        const translatedTexts = await this.service.translateBatch(texts, targetLang);

        // 다시 주입
        nodesToTranslate.forEach((node, index) => {
            node.textContent = translatedTexts[index];
        });

        // 변경된 XML 저장
        return { zip, translatedDoc: doc };
    }

    async generate(content: any): Promise<Buffer> {
        const { zip, translatedDoc, hasSharedStrings } = content;

        if (hasSharedStrings && translatedDoc) {
            const serializer = new XMLSerializer();
            const newXml = serializer.serializeToString(translatedDoc);
            zip.file('xl/sharedStrings.xml', newXml);
        }

        return zip.generate({ type: 'nodebuffer' });
    }

    protected countPages(content: any): number {
        // 엑셀은 페이지 개념이 모호하므로 시트 개수나 파일 크기로 추산
        return 1;
    }

    protected countCharacters(content: any): number {
        return 1000;
    }
}
