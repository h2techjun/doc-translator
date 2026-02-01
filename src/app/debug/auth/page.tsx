import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import ClientAuthDebug from "./client-debug";

export default async function AuthDebugPage() {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // --- Token Validation Logic (Server Logic) ---
    let tokenValidationResult: any = "Initializing...";

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1] || 'unknown';
        const cookieName = `sb-${projectId}-auth-token`;
        const cookie = allCookies.find(c => c.name === cookieName);

        if (!cookie) {
            tokenValidationResult = "No Auth Cookie Found";
        } else {
            // Parse Cookie Value
            let tokenValue;
            try {
                const json = JSON.parse(cookie.value);
                tokenValue = json.access_token;
            } catch {
                try {
                    const decoded = decodeURIComponent(cookie.value);
                    const json = JSON.parse(decoded);
                    tokenValue = json.access_token;
                } catch (e) {
                    tokenValidationResult = `Failed to parse cookie JSON: ${e}`;
                }
            }

            if (tokenValue) {
                // Decode JWT
                const parts = tokenValue.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    const exp = payload.exp * 1000;
                    const now = Date.now();
                    const timeLeft = (exp - now) / 1000;

                    // [Deep Check] Verify with Supabase API
                    let apiCheckResult = "Skipped";
                    let manualSessionResult = "Skipped";

                    if (timeLeft > 0) {
                        try {
                            // 1. API Check
                            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
                                headers: {
                                    'Authorization': `Bearer ${tokenValue}`,
                                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                                }
                            });
                            const verifyJson = await verifyRes.json();
                            apiCheckResult = verifyRes.ok
                                ? "✅ API Accepts Token"
                                : `❌ API Rejects: ${verifyRes.status} ${verifyJson.msg || verifyJson.error_description || JSON.stringify(verifyJson)}`;

                            // 2. Manual SetSession Check
                            let manualPayload: any = {};
                            try {
                                manualPayload = JSON.parse(cookie.value);
                            } catch {
                                try { manualPayload = JSON.parse(decodeURIComponent(cookie.value)); } catch { }
                            }

                            const { data: { session: manualSession }, error: manualError } = await supabase.auth.setSession({
                                access_token: tokenValue,
                                refresh_token: manualPayload.refresh_token || ''
                            });

                            if (manualError) {
                                manualSessionResult = `❌ setSession Failed: ${manualError.message}`;
                            } else if (manualSession) {
                                manualSessionResult = `✅ setSession Succeeded (User: ${manualSession.user.email})`;

                                // If manual worked, but automatic failed, we found the bug.
                                // Overwrite the user display for debugging
                                if (!user) {
                                    // Hack to show it worked
                                    manualSessionResult += " [NOTE: Automatic Cookie Parse Failed!]";
                                }
                            }

                        } catch (err: any) {
                            apiCheckResult = `Network Error: ${err.message}`;
                        }
                    }

                    tokenValidationResult = {
                        Token_Exp_Time: new Date(exp).toLocaleString(),
                        Current_Server_Time: new Date(now).toLocaleString(),
                        Is_Expired: timeLeft < 0 ? "❌ YES (Expired)" : "✅ NO (Valid)",
                        Time_Left_Seconds: timeLeft,
                        User_Id_In_Token: payload.sub,
                        Audience: payload.aud,
                        Issuer: payload.iss,
                        API_Verification: apiCheckResult,
                        Manual_SetSession_Attempt: manualSessionResult
                    };
                } else {
                    tokenValidationResult = "Invalid JWT format";
                }
            } else if (typeof tokenValidationResult !== 'string') {
                tokenValidationResult = "No access_token found inside cookie structure";
            }
        }
    } catch (e) {
        tokenValidationResult = `Token Check Error: ${e}`;
    }

    // --- Environment Logic ---
    const envCheckResult = (() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectId = url.match(/https?:\/\/([^.]+)\./)?.[1] || 'unknown';
        const expectedCookie = `sb-${projectId}-auth-token`;
        const hasCookie = allCookies.some(c => c.name === expectedCookie);

        return {
            SUPABASE_URL_HOST: url.split('://')[1]?.split('.')[0] + '...',
            Extracted_Project_ID: projectId,
            Expected_Cookie_Name: expectedCookie,
            Cookie_Found: hasCookie ? "✅ YES" : "❌ NO (Server ignores auth!)",
            Note: "If Cookie_Found is NO, auth will never work."
        };
    })();


    return (
        <div className="p-8 space-y-8 bg-black min-h-screen text-white font-mono">
            <h1 className="text-3xl font-bold text-emerald-400 border-b border-gray-700 pb-4">
                🔐 Authentication Debugger
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Server Side State */}
                <section className="space-y-4 border border-blue-500/30 p-6 rounded-lg bg-blue-950/10">
                    <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        🖥️ Server-Side State
                        <span className="text-xs px-2 py-1 bg-blue-500/20 rounded">RSC / Middleware Logic</span>
                    </h2>

                    {/* PRIORITY DEBUG INFO */}
                    <div className="space-y-2 border border-yellow-500/50 p-4 rounded bg-yellow-900/10">
                        <h3 className="font-bold text-yellow-400">🚨 CRITICAL DEBUG INFO</h3>
                        <pre className="p-4 rounded bg-gray-900 text-xs text-yellow-300 font-mono whitespace-pre-wrap">
                            {typeof tokenValidationResult === 'string'
                                ? tokenValidationResult
                                : JSON.stringify({
                                    FINAL_VERDICT: tokenValidationResult.API_Verification?.includes('✅') ? "TOKEN IS VALID" : "TOKEN IS INVALID",
                                    API_Verification: tokenValidationResult.API_Verification,
                                    Manual_SetSession: tokenValidationResult.Manual_SetSession_Attempt,
                                    Is_Expired: tokenValidationResult.Is_Expired,
                                    Cookie_First_Chars: allCookies.find(c => c.name.includes('auth-token'))?.value.substring(0, 15) || "N/A",
                                    Cookie_Start_Char_Code: allCookies.find(c => c.name.includes('auth-token'))?.value.charCodeAt(0) || "N/A"
                                }, null, 2)}
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-400">User Status:</h3>
                        <pre className={`p-4 rounded overflow-auto text-sm ${user ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                            {JSON.stringify({
                                isAuthenticated: !!user,
                                userId: user?.id,
                                email: user?.email,
                                role: user?.role,
                                error: error?.message
                            }, null, 2)}
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-400">Received Cookies ({allCookies.length}):</h3>
                        <div className="bg-gray-900 p-4 rounded overflow-auto max-h-[400px] text-xs">
                            {allCookies.map(c => (
                                <div key={c.name} className="mb-2 border-b border-gray-800 pb-2">
                                    <span className="text-yellow-400">{c.name}</span>
                                    <br />
                                    <span className="text-gray-500 truncate block">{c.value.substring(0, 50)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-800 pt-4 mt-4">
                        <h3 className="font-bold text-gray-400">Token Validation Check:</h3>
                        <pre className="p-4 rounded bg-gray-900 text-xs text-yellow-300">
                            {typeof tokenValidationResult === 'string'
                                ? tokenValidationResult
                                : JSON.stringify(tokenValidationResult, null, 2)}
                        </pre>
                    </div>

                    <div className="space-y-2 border-t border-gray-800 pt-4 mt-4">
                        <h3 className="font-bold text-gray-400">Environment & Config Check:</h3>
                        <pre className="p-4 rounded bg-gray-900 text-xs text-blue-300">
                            {JSON.stringify(envCheckResult, null, 2)}
                        </pre>
                    </div>
                </section>

                {/* Client Side State */}
                <ClientAuthDebug />
            </div>
        </div>
    );
}
