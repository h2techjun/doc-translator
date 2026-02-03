'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useGeoSmart } from '@/hooks/use-geo-smart';

const TIMEOUT_MS = 60 * 60 * 1000; // 1시간
const WARNING_MS = 59 * 60 * 1000; // 59분 (1분 전 경고)

export function AutoLogoutTimer() {
    const supabase = createClient();
    const router = useRouter();
    const { user } = useGeoSmart(); // useGeoSmart 훅 사용
    const [timeLeft, setTimeLeft] = useState<number>(TIMEOUT_MS);
    const [showWarning, setShowWarning] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 활동 감지 및 타이머 리셋
    const resetTimer = () => {
        lastActivityRef.current = Date.now();
        setTimeLeft(TIMEOUT_MS);
        setShowWarning(false);
    };

    useEffect(() => {
        if (!user) return; // 로그인하지 않은 경우 타이머 실행 안 함

        // 이벤트 리스너 등록
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));

        // 타이머 체크
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const remaining = TIMEOUT_MS - elapsed;

            if (remaining <= 0) {
                // 타임아웃 발생
                handleLogout();
            } else if (remaining <= (TIMEOUT_MS - WARNING_MS)) {
                // 경고 표시 시점 (예: 1분 남음)
                setShowWarning(true);
            }
            
            // 디버깅용: 남은 시간 상태 업데이트 (필요 시 UI 표시 가능)
            // setTimeLeft(remaining); 

        }, 1000);

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.error('장시간 비활동으로 자동 로그아웃되었습니다.');
        router.push('/signin?reason=inactivity');
        setShowWarning(false);
    };

    const handleExtendSession = () => {
        resetTimer();
        toast.success('세션이 연장되었습니다.');
    }

    return (
        <Dialog open={showWarning} onOpenChange={setShowWarning}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>자동 로그아웃 안내</DialogTitle>
                    <DialogDescription>
                        장시간 활동이 없어 1분 후 자동으로 로그아웃됩니다.
                        로그인을 유지하시겠습니까?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={handleLogout}>
                        로그아웃
                    </Button>
                    <Button type="button" onClick={handleExtendSession}>
                        로그인 유지
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
