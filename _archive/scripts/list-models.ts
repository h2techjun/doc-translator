
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found.");
    process.exit(1);
}

// REST API로 직접 모델 목록 조회 (라이브러리 의존성 배제)
async function listModels() {
    console.log(`🔑 Checking models with API Key: ${apiKey.substring(0, 5)}...`);

    // Google AI Studio API Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const errorBody = await response.text();
            console.error(`   Body: ${errorBody}`);
            return;
        }

        const data = await response.json();
        console.log("✅ Available Models:");
        (data as any).models?.forEach((m: any) => {
            console.log(`   - ${m.name} (Supported: ${m.supportedGenerationMethods?.join(', ')})`);
        });

    } catch (error: any) {
        console.error("❌ Network Error:", error.message);
    }
}

listModels();
