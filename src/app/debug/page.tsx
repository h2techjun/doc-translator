'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const check = async () => {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            setUser(user);
            if (authError) setError(authError.message);

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
                if (error) setError(prev => prev + ' | ' + error.message);
            }
        };
        check();
    }, []);

    return (
        <div className="p-10 text-white bg-slate-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Auth & Profile</h1>
            <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded">
                    <h2 className="font-bold text-emerald-400">Auth User</h2>
                    <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
                </div>
                <div className="p-4 bg-slate-800 rounded">
                    <h2 className="font-bold text-cyan-400">Profile (DB)</h2>
                    <pre className="text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
                </div>
                {error && (
                    <div className="p-4 bg-red-900/50 text-red-200 rounded">
                        <h2 className="font-bold">Error</h2>
                        <pre>{error}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
