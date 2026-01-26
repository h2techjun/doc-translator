
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("❌ Failed to load .env file");
    process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
console.log(`🔑 Testing API Key: ${apiKey?.substring(0, 5)}...${apiKey?.substring(apiKey.length - 4)} (Length: ${apiKey?.length})`);

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

async function testModel(modelName: string) {
    console.log(`\n🤖 Testing Model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey!);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = "Hello, reply with 'OK'.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`✅ Success! Response: ${response.text()}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function main() {
    // Test 1: gemini-1.5-flash (Current)
    const r1 = await testModel("gemini-1.5-flash");

    // Test 2: gemini-pro (Stable)
    const r2 = await testModel("gemini-pro");

    // Test 3: gemini-1.5-pro
    const r3 = await testModel("gemini-1.5-pro");

    if (!r1 && !r2 && !r3) {
        console.error("\n💀 All models failed. The API Key might be invalid or has no permissions.");
    }
}

main();
