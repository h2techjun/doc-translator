
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, User, Search, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS, ja, zhCN, es, fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Conversation {
    partnerId: string;
    partnerName: string;
    lastMessage: string;
    lastDate: string;
    isRead: boolean;
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export default function InboxPage() {
    const { user, t, locale } = useGeoSmart();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // date-fns locale mapping
    const getDateLocale = () => {
        switch (locale) {
            case 'ko': return ko;
            case 'ja': return ja;
            case 'zh': return zhCN;
            case 'es': return es;
            case 'fr': return fr;
            default: return enUS;
        }
    };

    // Auto-scroll ref
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/messages');
                if (res.ok) setConversations(await res.json());
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // 2. Fetch Messages when partner selected
    useEffect(() => {
        if (!selectedPartnerId) return;

        const fetchMessages = async () => {
            const res = await fetch(`/api/messages?partner_id=${selectedPartnerId}`);
            if (res.ok) setMessages(await res.json());
        };

        fetchMessages();
        // Polling (simple realtime)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedPartnerId]);

    // 3. Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!selectedPartnerId || !newMessage.trim()) return;
        setSending(true);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiver_id: selectedPartnerId,
                    content: newMessage
                })
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages([...messages, msg]);
                setNewMessage('');
            } else {
                toast.error(t.inbox.errorSend);
            }
        } catch (e) {
            toast.error(t.inbox.errorSystem);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin w-8 h-8 opacity-50" /></div>;

    return (
        <div className="container mx-auto py-8 max-w-6xl h-[calc(100vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">

                {/* Left: Conversation List */}
                <Card className="md:col-span-1 border-input bg-background/50 backdrop-blur flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-bold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> {t.inbox.title}
                        </h2>
                    </div>
                    <ScrollArea className="flex-1">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                {t.inbox.noMessages}
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.partnerId}
                                    onClick={() => setSelectedPartnerId(conv.partnerId)}
                                    className={`p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors ${selectedPartnerId === conv.partnerId ? 'bg-accent' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border">
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-medium text-sm truncate">{conv.partnerName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 text-right">
                                                {formatDistanceToNow(new Date(conv.lastDate), { addSuffix: true, locale: getDateLocale() })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </Card>

                {/* Right: Chat Room */}
                <Card className="md:col-span-3 border-input bg-background/50 backdrop-blur flex flex-col h-full overflow-hidden shadow-xl">
                    {selectedPartnerId ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b bg-card/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="font-bold">{t.inbox.chatting}</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-800 rounded-bl-none'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 border-t bg-card/50">
                                <form
                                    className="flex gap-2"
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                >
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t.inbox.placeholder}
                                        className="flex-1 bg-background/80"
                                        disabled={sending}
                                    />
                                    <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <MessageSquare className="w-16 h-16 mb-4" />
                            <p>{t.inbox.emptySelect}</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
