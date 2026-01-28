import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const envPath = path.resolve(__dirname, "../.env");
const result = dotenv.config({ path: envPath });

console.log("--- Debug Translation Script ---");
console.log(`Loading .env from: ${envPath}`);

if (result.error) {
    console.error("❌ Error loading .env file:", result.error);
} else {
    console.log("✅ .env loaded successfully");
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in process.env");
    process.exit(1);
} else {
    console.log(`✅ GEMINI_API_KEY found (Length: ${apiKey.length})`);
    console.log(`   Key starts with: ${apiKey.substring(0, 5)}...`);
}

async function testConnection() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey!);
        const modelName = "gemini-2.0-flash";
        console.log(`\nTesting model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        console.log("   Sending simple prompt...");
        const result = await model.generateContent("Hello, are you translations ready?");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Model response received:");
        console.log("   " + text.substring(0, 100).replace(/\n/g, " ") + "...");
    } catch (error: any) {
        console.error("\n❌ API Test Failed:");
        console.error("   Error Name:", error.name);
        console.error("   Error Message:", error.message);

        if (error.message.includes("404")) {
            console.error("\n[Analysis] 404 Error usually means the model name is incorrect or your API key doesn't have access to it.");
        } else if (error.message.includes("400")) {
            console.error("\n[Analysis] 400 Error usually means invalid argument or prompt.");
        } else if (error.message.includes("403")) {
            console.error("\n[Analysis] 403 Error usually means API key is invalid or quota exceeded.");
        }
    }
}

testConnection();
