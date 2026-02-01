
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?status=${statusFilter}`);
            if (res.ok) setReports(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
        try {
            const res = await fetch('/api/admin/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: id,
                    status,
                    resolution_notes: status === 'RESOLVED' ? '조치 완료' : '관리자에 의해 기각됨'
                })
            });

            if (res.ok) {
                toast.success(`신고가 ${status === 'RESOLVED' ? '처리' : '기각'}되었습니다`);
                fetchReports();
            } else {
                toast.error('업데이트 실패');
            }
        } catch (e) {
            toast.error('시스템 오류');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <Flag className="w-10 h-10 text-orange-500" />
                신고 관리 대기열 (Moderation Queue)
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                사용자 신고를 검토하고 처리합니다.
            </p>

            <Tabs defaultValue="PENDING" onValueChange={setStatusFilter} className="w-full">
                <TabsList className="bg-slate-900/50 border border-slate-800">
                    <TabsTrigger value="PENDING">검토 대기</TabsTrigger>
                    <TabsTrigger value="RESOLVED">처리 완료</TabsTrigger>
                    <TabsTrigger value="DISMISSED">기각됨</TabsTrigger>
                </TabsList>

                <Card className="mt-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead>신고자</TableHead>
                                    <TableHead>신고 대상</TableHead>
                                    <TableHead>사유</TableHead>
                                    <TableHead>날짜</TableHead>
                                    {statusFilter === 'PENDING' && <TableHead className="text-right">관리</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            신고 내역이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.map((report) => (
                                        <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-mono text-xs">{report.reporter_id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Badge variant="outline" className="w-fit mb-1">{report.target_type}</Badge>
                                                    <span className="font-mono text-xs text-muted-foreground">{report.target_id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-orange-400">{report.reason}</div>
                                                <div className="text-xs text-muted-foreground max-w-md truncate">{JSON.stringify(report.details)}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(report.created_at), 'MM-dd HH:mm')}
                                            </TableCell>
                                            {statusFilter === 'PENDING' && (
                                                <TableCell className="text-right space-x-2">
                                                    <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => handleResolve(report.id, 'RESOLVED')}>
                                                        <CheckCircle className="w-4 h-4 mr-2" /> 승인/처리
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => handleResolve(report.id, 'DISMISSED')}>
                                                        <XCircle className="w-4 h-4 mr-2" /> 기각(무시)
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
