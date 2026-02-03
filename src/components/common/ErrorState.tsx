'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message = '문제를 불러오는 중 오류가 발생했습니다.', onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">오류가 발생했습니다</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
                {message}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    다시 시도
                </Button>
            )}
        </div>
    );
}
