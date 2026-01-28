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
import { Users, Shield, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

type User = {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    tier: string;
    points: number;
    total_translations: number;
    signed_up_at: string;
    last_sign_in_at: string | null;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${pageNum}&limit=20`);
            if (res.ok) {
                const { data, pagination } = await res.json();
                setUsers(data);
                setTotalPages(Math.ceil(pagination.total / pagination.limit));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <h1 className="text-3xl font-black mb-2 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-500" />
                User Management
            </h1>
            <p className="text-muted-foreground mb-8">
                Manage platform users, roles, and points.
            </p>

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        List of all registered users on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead>Email / ID</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Translations</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading users...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.email || 'No Email'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                                                        {user.id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'ADMIN' ? (
                                                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
                                                        <Shield className="w-3 h-3" /> ADMIN
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-500">
                                                        USER
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${user.tier === 'MASTER' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : ''}
                                                    ${user.tier === 'GOLD' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : ''}
                                                    ${user.tier === 'SILVER' ? 'text-slate-400 border-slate-400/20 bg-slate-400/5' : ''}
                                                `}>
                                                    {user.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                                                {user.points?.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{user.total_translations}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(user.signed_up_at), { addSuffix: true, locale: ko })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
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
