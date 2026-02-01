'use client';

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function ClientAuthDebug() {
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [browserCookies, setBrowserCookies] = useState<string>('');

    useEffect(() => {
        const supabase = createClient();

        // Check Session
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        // Check User
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        // Check Document Cookies
        setBrowserCookies(document.cookie);
    }, []);

    return (
        <section className="space-y-4 border border-purple-500/30 p-6 rounded-lg bg-purple-950/10">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                🌐 Client-Side State
                <span className="text-xs px-2 py-1 bg-purple-500/20 rounded">Browser / LocalStorage</span>
            </h2>

            <div className="space-y-2">
                <h3 className="font-bold text-gray-400">Supabase Client SDK:</h3>
                <pre className={`p-4 rounded overflow-auto text-sm ${user ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                    {loading ? 'Loading...' : JSON.stringify({
                        isAuthenticated: !!user,
                        userId: user?.id,
                        email: user?.email,
                        hasSession: !!session,
                        accessToken: session?.access_token ? 'Present (Hidden)' : 'Missing'
                    }, null, 2)}
                </pre>
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-gray-400">Browser Cookies (document.cookie):</h3>
                <div className="bg-gray-900 p-4 rounded overflow-auto max-h-[400px] text-xs text-gray-300 break-all">
                    {browserCookies.split('; ').map((c, i) => (
                        <div key={i} className="mb-2 border-b border-gray-800 pb-2">
                            {c}
                        </div>
                    )) || 'No cookies accessible via JS'}
                </div>
            </div>
        </section>
    );
}
