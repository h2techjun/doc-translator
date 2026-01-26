import { BaseFileTranslator } from '../engine';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { TranslatorService, MockTranslatorService } from '../service';

export class PptxTranslator extends BaseFileTranslator {
    private service: TranslatorService;

    constructor(service?: TranslatorService) {
        super();
        this.service = service || new MockTranslatorService();
    }

    async parse(buffer: Buffer): Promise<any> {
        const zip = new PizZip(buffer);

        // ppt/slides/slide1.xml, slide2.xml ... 
        // 파일 목록에서 slide로 시작하는 XML 찾기
        const slideFiles = Object.keys(zip.files).filter(path =>
            path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
        );

        return { zip, slideFiles };
    }

    async translate(content: any, targetLang: string): Promise<any> {
        const { zip, slideFiles } = content;
        const parser = new DOMParser();
        const serializer = new XMLSerializer();

        // 모든 슬라이드의 텍스트 수집
        let allTexts: string[] = [];
        const textNodesMap: { file: string; nodes: Element[] }[] = [];

        for (const fileName of slideFiles) {
            const xml = zip.file(fileName)?.asText();
            if (!xml) continue;

            const doc = parser.parseFromString(xml, 'text/xml');
            // PPTX 텍스트는 <a:t> 태그에 있음
            const nodes = Array.from(doc.getElementsByTagName('a:t'));

            const fileNodes: Element[] = [];
            nodes.forEach((node: any) => {
                if (node.textContent && node.textContent.trim().length > 0) {
                    allTexts.push(node.textContent);
                    fileNodes.push(node);
                }
            });
            textNodesMap.push({ file: fileName, nodes: fileNodes });
        }

        // 일괄 번역
        if (allTexts.length === 0) return { zip };
        const translatedTexts = await this.service.translateBatch(allTexts, targetLang);

        // 다시 주입
        let globalIndex = 0;
        for (const { file, nodes } of textNodesMap) {
            // 해당 파일의 XML을 다시 파싱해서 수정해야 함 (혹은 메모리에 들고 있던 doc 재사용)
            // 여기서는 간단히 다시 읽어서 처리 (XML Doc 객체 유지가 더 효율적이지만 구조상 zip을 update해야 하므로)
            const xml = zip.file(file)?.asText();
            const doc = parser.parseFromString(xml!, 'text/xml');
            const xmlNodes = Array.from(doc.getElementsByTagName('a:t'));

            let localIndex = 0;
            // 순서가 보장된다고 가정 (getElementsByTagName 순서)
            // 실제로는 nodes를 element ref로 들고 있어도 되지만, DOMParser 특성상 직렬화 전까지 유지됨

            // 주의: 위에서 필터링한 node와 순서 매칭이 중요. 
            // 간단 구현: 다시 순회하며 텍스트 있는 것만 매칭
            xmlNodes.forEach((node: any) => {
                if (node.textContent && node.textContent.trim().length > 0) {
                    node.textContent = translatedTexts[globalIndex++];
                }
            });

            const newXml = serializer.serializeToString(doc);
            zip.file(file, newXml);
        }

        return { zip };
    }

    async generate(content: any): Promise<Buffer> {
        const { zip } = content;
        return zip.generate({ type: 'nodebuffer' });
    }

    protected countPages(content: any): number {
        return content.slideFiles.length;
    }

    protected countCharacters(content: any): number {
        return 1000; // Mock
    }
}
