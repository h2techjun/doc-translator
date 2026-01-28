import { BaseTranslationStrategy } from './base-strategy';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * 🇰🇷 HWPX (한글 표준) 번역 전략
 */
export class HwpxTranslationStrategy extends BaseTranslationStrategy {
    async translate(fileBuffer: Buffer, targetLang: string): Promise<Buffer> {
        console.log(`[HwpxStrategy] 🇰🇷 HWPX 번역 시작`);
        const zip = new PizZip(fileBuffer);

        // HWPX의 메인 텍스트는 Contents/section0.xml 등에 들어있음
        const sectionFiles = Object.keys(zip.files).filter(name => name.startsWith('Contents/section'));

        for (const fileName of sectionFiles) {
            const xmlContent = zip.file(fileName)?.asText();
            if (!xmlContent) continue;

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

            // HWPX의 텍스트 태그는 보통 <hp:t>
            const textElements = xmlDoc.getElementsByTagName('hp:t');
            const originalTexts: string[] = [];
            const validIndices: number[] = [];

            for (let i = 0; i < textElements.length; i++) {
                const text = textElements[i].textContent || '';
                if (text.trim().length > 0) {
                    originalTexts.push(text);
                    validIndices.push(i);
                }
            }

            if (originalTexts.length > 0) {
                const translatedBatch = await this.translateBatch(originalTexts, targetLang);
                translatedBatch.forEach((translated, index) => {
                    const targetIdx = validIndices[index];
                    textElements[targetIdx].textContent = translated;
                });

                const serializer = new XMLSerializer();
                zip.file(fileName, serializer.serializeToString(xmlDoc));
            }
        }

        return zip.generate({ type: 'nodebuffer' });
    }
}
