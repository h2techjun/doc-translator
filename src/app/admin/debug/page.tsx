'use client';

import { createClient } from '@/lib/supabase/config';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDebugPage() {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookies] = useState<string>('');
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            setSession(session);
            setUser(user);
            setCookies(document.cookie);
            setLoading(false);

            console.log('Session:', session);
            console.log('User:', user);
            console.log('Cookies:', document.cookie);
        };

        checkSession();
    }, []);

    const refreshSession = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.refreshSession();
        if (error) alert(`Refresh Error: ${error.message}`);
        else alert('Session Refreshed!');
        window.location.reload();
    };

    return (
        <div className="p-10 container mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6 text-emerald-400">🔍 Admin Session Debugger</h1>
            
            <div className="grid gap-6">
                <Card className="bg-slate-900 border-slate-700">
                    <CardHeader><CardTitle className="text-white">User Status</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <div className="animate-pulse">Loading...</div> : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">Is Authenticated:</span>
                                    <span className={user ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                        {user ? "YES" : "NO"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">Role (Metadata):</span>
                                    <span className="text-yellow-400 font-mono">
                                        {user?.user_metadata?.role || user?.app_metadata?.role || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">User ID:</span>
                                    <span className="text-slate-200 font-mono text-xs">{user?.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">Email:</span>
                                    <span className="text-slate-200">{user?.email}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Cookie Inspection</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-slate-400 text-sm mb-2">Browser Cookies:</p>
                        <div className="bg-black p-4 rounded-lg overflow-x-auto">
                            <pre className="text-xs text-green-300 whitespace-pre-wrap break-all">
                                {cookies.split(';').map(c => c.trim()).join('\n')}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button onClick={refreshSession} className="bg-blue-600 hover:bg-blue-500">
                        Force Refresh Session
                    </Button>
                    <Button onClick={() => window.location.href = '/admin/dashboard'} variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">
                        Try Access Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
