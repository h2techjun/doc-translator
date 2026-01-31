
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const { user } = useGeoSmart();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async (signal?: AbortSignal) => {
        // 🛡️ Pre-emptive checks to avoid 401
        if (!user) return;

        // Don't fetch on public auth pages
        if (pathname === '/signin' || pathname === '/signup') return;

        // Extra check: Ensure the actual auth cookie exists
        if (typeof document !== 'undefined' && !document.cookie.includes('sb-')) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const supabase = createClient();
        // Use a more thorough check: getSession() then verify user existence
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.user || (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000))) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            const res = await fetch('/api/notifications', {
                signal,
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });

            if (res.status === 401) {
                // Silently clear and stop if unauthorized
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (e) {
            // Silently fail in dev/dev-poll to avoid console clutter
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        if (user) {
            // Delay initial fetch slightly to ensure session is ready
            const timeout = setTimeout(() => fetchNotifications(controller.signal), 800);

            const interval = setInterval(() => {
                if (user) fetchNotifications(controller.signal);
            }, 60000);

            return () => {
                controller.abort();
                clearTimeout(timeout);
                clearInterval(interval);
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, pathname]);

    const markAsRead = async (id?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(id ? { id } : { all: true })
            });
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#0f172a] border-slate-800 text-slate-200" align="end">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-sm">알림 센터</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 text-xs text-blue-400 hover:text-blue-300" onClick={() => markAsRead()}>
                            모두 읽음
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            새로운 알림이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 hover:bg-slate-800/50 transition-colors ${!n.is_read ? 'bg-slate-800/20' : ''}`}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">{n.title}</p>
                                            <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-slate-600">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}
                                                </span>
                                                {n.link && (
                                                    <Link href={n.link} className="text-[10px] text-emerald-400 hover:underline">
                                                        바로가기 &rarr;
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
