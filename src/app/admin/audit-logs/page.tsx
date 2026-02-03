'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Shield, User, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AuditLog {
    id: string;
    admin_id: string;
    action_type: string;
    target_user_id?: string;
    details: any;
    created_at: string;
    admin_name?: string;
    admin_email?: string;
    target_name?: string;
    target_email?: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/audit-logs?page=${page}`);
            const result = await res.json();
            if (result.data) {
                // Flatten data from joined profile structure if necessary
                const flattened = result.data.map((log: any) => ({
                    ...log,
                    admin_name: log.admin?.full_name,
                    admin_email: log.admin?.email,
                    target_name: log.target?.full_name,
                    target_email: log.target?.email
                }));
                setLogs(flattened);
                setTotal(result.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const getActionBadgeColor = (action: string) => {
        if (action.includes('BAN')) return 'bg-rose-500';
        if (action.includes('SUSPEND')) return 'bg-amber-500';
        if (action.includes('PERMISSION')) return 'bg-indigo-500';
        if (action.includes('UPDATE')) return 'bg-blue-500';
        return 'bg-slate-500';
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tighter uppercase">
                        <Shield className="w-10 h-10 text-indigo-500" />
                        감사 로그 (Audit Logs)
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground mt-1">시스템 관리자의 모든 활동이 기록됩니다.</p>
                </div>
            </div>

            <Card className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-border/50 shadow-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-black italic tracking-tight uppercase">활동 내역</CardTitle>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="관리자 또는 사용자 검색..." 
                                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                <TableRow>
                                    <TableHead className="w-[180px] font-black uppercase text-[10px] tracking-widest">일시</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">관리자</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">동작</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">대상</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">상세 내용</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center italic text-muted-foreground animate-pulse">
                                            로그 데이터를 불러오는 중...
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center italic text-muted-foreground">
                                            기록된 활동이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="text-[11px] font-medium text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-indigo-500">{log.admin_name || '알 수 없음'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{log.admin_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] font-black uppercase px-2 py-0.5 border-none ${getActionBadgeColor(log.action_type)}`}>
                                                    {log.action_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {log.target_user_id ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold">{log.target_name || '사용자'}</span>
                                                        <span className="text-[10px] text-muted-foreground">{log.target_email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground font-bold italic">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[300px] truncate group relative">
                                                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                                        {JSON.stringify(log.details)}
                                                    </span>
                                                    <div className="hidden group-hover:block absolute z-50 p-2 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-2xl text-[10px] whitespace-pre-wrap max-w-md">
                                                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            총 {total}개의 로그
                        </p>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="h-8 px-3 text-[11px] font-black"
                            >
                                이전
                            </Button>
                            <span className="text-xs font-black px-3">{page}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={logs.length < 50}
                                onClick={() => setPage(p => p + 1)}
                                className="h-8 px-3 text-[11px] font-black"
                            >
                                다음
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
