'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

type Job = {
    id: string;
    original_filename: string;
    user_email: string;
    file_type: string;
    target_lang: string;
    status: string;
    progress: number;
    created_at: string;
    translated_file_url: string | null;
    error_message: string | null;
};

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchJobs = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/jobs?page=${pageNum}&limit=20`);
            if (res.ok) {
                const { data, pagination } = await res.json();
                setJobs(data);
                setTotalPages(Math.ceil(pagination.total / pagination.limit));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs(page);
    }, [page]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">COMPLETED</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">FAILED</Badge>;
            case 'TRANSLATING':
                return <Badge className="bg-blue-500/10 text-blue-600 animate-pulse">TRANSLATING</Badge>;
            case 'PROCESSING':
            case 'UPLOADING':
                return <Badge className="bg-indigo-500/10 text-indigo-600 animate-pulse">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-3xl font-black mb-2 dark:text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-500" />
                Jobs Inspector
            </h1>
            <p className="text-muted-foreground mb-8">
                Monitor and manage translation jobs across the system.
            </p>

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Global Jobs Feed</CardTitle>
                    <CardDescription>
                        Real-time feed of all translation activities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead>Filename / ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Lang</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading jobs...
                                        </TableCell>
                                    </TableRow>
                                ) : jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No jobs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate max-w-[200px]" title={job.original_filename}>
                                                        {job.original_filename}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                                                        {job.id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{job.user_email || 'Unknown User'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {job.target_lang || 'EN'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(job.status)}
                                                {job.error_message && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={job.error_message}>
                                                        <AlertCircle className="w-3 h-3" />
                                                        {job.error_message}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${job.progress || 0}%` }} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{job.progress}%</span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ko })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {job.translated_file_url && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => window.open(job.translated_file_url!, '_blank')}>
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
