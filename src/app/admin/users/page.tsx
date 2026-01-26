import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Server Action for User Management
async function manageUser(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const userId = formData.get('userId') as string;
    const action = formData.get('action') as string;
    const value = formData.get('value') as string;

    // Verify Admin (Double Check)
    /* const { data: { user } } = await supabase.auth.getUser();
       if (!isAdmin(user)) throw new Error("Unauthorized"); */

    if (action === 'ban') {
        await supabase.from('users').update({ status: 'banned' }).eq('id', userId);
    } else if (action === 'mute') {
        await supabase.from('users').update({ status: 'muted' }).eq('id', userId);
    } else if (action === 'grant_points') {
        const points = parseInt(value);
        // Transactional logic needed ideally
        await supabase.rpc('increment_credit', { user_id: userId, amount: points });
        await supabase.from('transactions').insert({
            user_id: userId,
            amount: points,
            type: 'manual_adjustment',
            description: 'Admin Grant'
        });
    }
}

export default async function UserManagementPage() {
    const supabase = await createClient();
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                        {users?.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{user.full_name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.credit_balance}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={manageUser} className="inline-flex space-x-2">
                                        <input type="hidden" name="userId" value={user.id} />
                                        <button name="action" value="ban" className="text-red-600 hover:text-red-900">Ban</button>
                                        <button name="action" value="mute" className="text-yellow-600 hover:text-yellow-900">Mute</button>
                                        <div className="flex items-center border rounded px-1">
                                            <input name="value" type="number" placeholder="Pt" className="w-12 text-xs bg-transparent border-none focus:ring-0" />
                                            <button name="action" value="grant_points" className="text-blue-600 hover:text-blue-900 ml-1">Give</button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
