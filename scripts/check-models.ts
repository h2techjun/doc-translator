
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log(`[Script] Querying: ${url.replace(apiKey, 'HIDDEN')}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[Script] HTTP Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log('[Script] Available Models:');
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(` - ${m.name} (${m.version}) [Supports: ${m.supportedGenerationMethods?.join(', ')}]`);
            });
        } else {
            console.log(data);
        }

    } catch (error) {
        console.error('[Script] Failed:', error);
    }
}

run();
