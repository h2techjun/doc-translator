
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found.");
    process.exit(1);
}

const variants = [
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash", // 최신 실험적
    "gemini-2.5-flash", // 사용자가 언급한 것
    "gemini-3-flash",   // 사용자가 언급한 것
    "gemini-2.5-flash-lite",
    "gemma-3-12b"       // 사용자 언급
];

async function checkModel(modelName: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
        contents: [{ parts: [{ text: "Hi" }] }]
    });

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });

        if (res.ok) {
            console.log(`✅ [${modelName}] SUCCESS!`);
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log(`❌ [${modelName}] Failed: ${res.status} ${res.statusText}`);
            if (res.status === 400) {
                const err = await res.json();
                console.log(`   Reason: ${err.error?.status} - ${err.error?.message}`);
            }
            return false;
        }
    } catch (e: any) {
        console.log(`❌ [${modelName}] Network Error: ${e.message}`);
        return false;
    }
}

async function main() {
    console.log(`🔑 Testing API Key with various model names...`);

    for (const model of variants) {
        await checkModel(model);
    }
}

main();
