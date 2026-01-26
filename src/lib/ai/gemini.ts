
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const getModel = () => {
    if (!model) {
        const apiKey = process.env.GEMINI_API_KEY!;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.");

        genAI = new GoogleGenerativeAI(apiKey);
        // Quota 문제로 다른 모델 시도
        const modelName = process.env.GEMINI_MODEL || "gemini-pro";
        model = genAI.getGenerativeModel({ model: modelName });
    }
    return model;
};

/**
 * 🤖 Gemini 텍스트 번역 함수
 * ...
 */
export const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || text.trim().length === 0) return text;

    const generativeModel = getModel();

    // 언어 코드를 실제 언어 이름으로 변환 (Gemini가 더 잘 이해함)
    const languageMap: Record<string, string> = {
        'en': 'English',
        'ko': 'Korean',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'ru': 'Russian',
        'hi': 'Hindi'
    };

    const targetLanguageName = languageMap[targetLang] || targetLang;

    // 프롬프트 엔지니어링: 서식 유지 및 정확한 번역 요청
    const prompt = `
Translate the following text into ${targetLanguageName}.
Maintain the original tone and formatting (if any).
Do not add any explanations or notes. Just provide the translated text.

Text:
"${text}"
`;

    try {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("❌ Gemini Translation Error:", error);
        // 에러 발생 시 원문 반환 (Graceful Degradation) 또는 에러 throw
        // 여기서는 에러를 throw하여 재시도하게 함
        throw error;
    }
};

/**
 * 📄 문서(PDF/이미지) 통째로 보고 번역 (멀티모달)
 * 
 * 파일의 바이너리 데이터를 직접 Gemini에게 전송하여,
 * OCR과 구조 인식을 동시에 수행합니다.
 */
export const translateDocument = async (
    fileBuffer: Buffer,
    mimeType: string,
    targetLang: string
): Promise<string> => {
    try {
        const generativeModel = getModel();

        // Base64 인코딩
        const base64Data = fileBuffer.toString('base64');

        const prompt = `
You are an expert professional document translator and developer.
I will provide a document file (${mimeType}).

Your Task:
1. **Analyze**: Visually analyze the document layout, tables, and content.
2. **Translate**: Translate content into "${targetLang}".
3. **Structure Extraction (JSON)**:
   - Instead of HTML, output a **JSON Array** representing the document structure elements in order.
   - Use the following schema for elements:
     - **Headings**: { "type": "heading", "level": 1|2|3, "text": "...", "align": "left"|"center"|"right" }
     - **Paragraphs**: { "type": "paragraph", "text": "...", "align": "left"|"center"|"right" }
     - **Tables**: { 
         "type": "table", 
         "col_widths_percent": [25, 25, 25, 25], // Use the max number of columns in the grid
         "has_border": true, // false if it's a layout table without visible lines
         "rows": [ 
           [ { "text": "Cell 1", "row_span": 1, "col_span": 1, "align": "center" }, { "text": "Merged", "col_span": 3, "align": "left" } ] 
         ] 
       }
     - **Images**: { "type": "image_placeholder", "text": "[Image: Description]", "align": "center" }
     - **Lists**: { "type": "bullet_list", "items": ["Item 1", "Item 2"] }

   - **Critical Rules**:
     - **Complex Tables**: Identify the maximum number of columns in the table structure. Calculate col_span based on that grid.
     - **Invisible Tables**: If a section (like header info) looks like a table but has no lines, use "type": "table" with "has_border": false.
     - **Alignment**: Visually detect text alignment. Default to "left".
     - **JSON Validity**: Your output MUST be valid JSON.

Output Format:
- Return ONLY the raw JSON string.
- Example:
[
  { "type": "paragraph", "text": "(1 / 1)", "align": "right" },
  { "type": "table", "has_border": true, "col_widths_percent": [20, 80], "rows": [...] }
]
`;

        // 멀티모달 요청 전송
        const result = await generativeModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        return result.response.text();
    } catch (error) {
        console.error("Gemini Document Translation Error:", error);
        throw error;
    }
};
