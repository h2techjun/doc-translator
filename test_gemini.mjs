import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Testing Gemini API (ESM Mode)...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API key found!');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, translate 'Verification Protocol' into Korean.");
        const response = await result.response;
        console.log('Result:', response.text());
        console.log('✅ API Connection Successful!');
    } catch (e) {
        console.error('❌ API Test Failed:', e.message);
    }
}

test();
