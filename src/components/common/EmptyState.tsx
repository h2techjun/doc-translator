'use client';

import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
    description?: string;
}

export function EmptyState({ 
    message = '내용이 없습니다.', 
    description = '관련된 데이터가 아직 생성되지 않았습니다.' 
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-16 min-h-[400px] text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-full mb-4">
                <FileSearch className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {message}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">
                {description}
            </p>
        </div>
    );
}
