import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // TODO: Add strict admin role check (Temporary bypass for development)

    // Fetch Metrics
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });

    // Mock Revenue Data (Phase 1: AdSense only)
    const revenue = (docCount || 0) * 0.1; // $0.1 per conversion (Assumption)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <span className="text-sm text-gray-500">Global DocTranslator Operations</span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{userCount || 0}</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Docs Processed</h3>
                    <p className="text-3xl font-bold mt-2">{docCount || 0}</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Est. Revenue (Ads)</h3>
                    <p className="text-3xl font-bold mt-2 text-green-600">${revenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Recent Activity Log (Placeholder) */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold">System Logs</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 text-center py-10">No logs available yet.</p>
                </div>
            </div>
        </div>
    );
}
