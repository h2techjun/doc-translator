
'use client';

import AdminSidebar from './_components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans">
            <AdminSidebar />
            <main className="flex-grow h-screen overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0f172a]">
                {children}
            </main>
        </div>
    );
}
