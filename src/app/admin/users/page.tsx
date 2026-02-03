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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

type User = {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'MASTER';
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // 🌟 Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkAction, setBulkAction] = useState<'grant_points' | 'update_role' | null>(null);
    const [bulkValue, setBulkValue] = useState<string>('');

    const toggleSelectAll = () => {
        if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(users.map(u => u.id)));
        }
    };

    const toggleSelectUser = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size}명의 사용자에게 작업을 수행하시겠습니까?`)) return;

        setIsBulkProcessing(true);
        try {
            const res = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userIds: Array.from(selectedIds),
                    action: bulkAction,
                    value: bulkValue
                })
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(result.message || '일괄 처리가 완료되었습니다.');
                setSelectedIds(new Set());
                setBulkAction(null);
                setBulkValue('');
                fetchUsers(page);
            } else {
                toast.error(`작업 실패: ${result.error}`);
            }
        } catch (error) {
            toast.error('일괄 처리 중 오류 발생');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleUpdateUser = async (updatedData: Partial<User>) => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                toast.success('회원 정보가 업데이트되었습니다');
                fetchUsers(page);
                setIsDialogOpen(false);
            } else {
                const err = await res.json();
                toast.error(`업데이트 실패: ${err.error}`);
            }
        } catch (error) {
            toast.error('예기치 않은 오류가 발생했습니다');
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchUsers = async (pageNum: number) => {
        setLoading(true);
        setSelectedIds(new Set()); // 페이지 변경 시 선택 초기화
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
                회원 관리 (User Management)
            </h1>
            <p className="text-muted-foreground mb-8">
                플랫폼 회원, 역할 및 포인트 관리.
            </p>

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>전체 회원 목록</CardTitle>
                        <CardDescription>
                            플랫폼에 등록된 모든 사용자의 목록입니다.
                        </CardDescription>
                    </div>
                    
                    {/* Bulk Action Toolbar */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-xs font-bold text-muted-foreground mr-2">
                                {selectedIds.size}명 선택됨
                            </span>
                            <Select onValueChange={(v) => setBulkAction(v as any)}>
                                <SelectTrigger className="w-[140px] h-9 text-xs font-bold">
                                    <SelectValue placeholder="일괄 작업 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grant_points">🎁 포인트 지급</SelectItem>
                                    <SelectItem value="update_role">👑 역할 변경</SelectItem>
                                </SelectContent>
                            </Select>

                            {bulkAction === 'grant_points' && (
                                <Input 
                                    placeholder="지급 포인트 (예: 1000)" 
                                    className="w-[120px] h-9 text-xs" 
                                    type="number"
                                    value={bulkValue}
                                    onChange={(e) => setBulkValue(e.target.value)}
                                />
                            )}

                            {bulkAction === 'update_role' && (
                                <Select onValueChange={setBulkValue}>
                                    <SelectTrigger className="w-[100px] h-9 text-xs font-bold">
                                        <SelectValue placeholder="역할 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">USER</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            <Button 
                                size="sm" 
                                className="h-9 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white"
                                onClick={handleBulkAction}
                                disabled={isBulkProcessing || !bulkAction || !bulkValue}
                            >
                                {isBulkProcessing ? '처리 중...' : '적용'}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <input 
                                            type="checkbox" 
                                            className="accent-indigo-500 w-4 h-4 cursor-pointer"
                                            checked={users.length > 0 && selectedIds.size === users.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>이메일 / ID</TableHead>
                                    <TableHead>역할</TableHead>
                                    <TableHead>등급 (Tier)</TableHead>
                                    <TableHead>포인트</TableHead>
                                    <TableHead>작업 수</TableHead>
                                    <TableHead>가입일</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            회원 정보 로딩 중...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            회원이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${selectedIds.has(user.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                            <TableCell>
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                                                    checked={selectedIds.has(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.email || '이메일 없음'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px] opacity-50">
                                                        {user.id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'MASTER' ? (
                                                    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 gap-1 font-black italic">
                                                        MASTER
                                                    </Badge>
                                                ) : user.role === 'ADMIN' ? (
                                                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1 font-bold">
                                                        <Shield className="w-3 h-3" /> ADMIN
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 font-medium">
                                                        USER
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-bold
                                                    ${user.tier === 'GOLD' ? 'text-yellow-600 border-yellow-500/20 bg-yellow-500/5' : ''}
                                                    ${user.tier === 'SILVER' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : ''}
                                                    ${user.tier === 'BRONZE' ? 'text-slate-400 border-slate-400/20 bg-slate-400/5' : ''}
                                                `}>
                                                    {user.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-amber-600 dark:text-amber-400 font-black">
                                                {user.points?.toLocaleString()}P
                                            </TableCell>
                                            <TableCell className="font-bold opacity-70">{user.total_translations}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground opacity-60">
                                                {formatDistanceToNow(new Date(user.signed_up_at), { addSuffix: true, locale: ko })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                                    if (!open) setIsDialogOpen(false);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-3 text-[10px] font-black uppercase border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 shadow-sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            수정
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-border/50 shadow-2xl rounded-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase text-indigo-600">마스터 권한 수정</DialogTitle>
                                                            <DialogDescription className="text-xs font-bold opacity-70">
                                                                <span className="text-foreground">{selectedUser?.email}</span> 계정에 대한 관리자 변경을 적용합니다.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-6 py-6">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label className="text-right text-xs font-black uppercase opacity-60">포인트</Label>
                                                                <Input
                                                                    type="number"
                                                                    className="col-span-3 h-10 bg-slate-50 dark:bg-slate-950/50 border-border/50 text-amber-500 font-black text-lg"
                                                                    defaultValue={selectedUser?.points}
                                                                    id={`points-${user.id}`}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label className="text-right text-xs font-black uppercase opacity-60">등급</Label>
                                                                <Select defaultValue={selectedUser?.tier} onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, tier: v as any } : null)}>
                                                                    <SelectTrigger className="col-span-3 h-10 bg-slate-50 dark:bg-slate-950/50 border-border/50 font-bold">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-xl">
                                                                        <SelectItem value="BRONZE">BRONZE (기본)</SelectItem>
                                                                        <SelectItem value="SILVER">SILVER (프리미엄)</SelectItem>
                                                                        <SelectItem value="GOLD">GOLD (VIP)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label className="text-right text-xs font-black uppercase opacity-60">역할</Label>
                                                                <Select defaultValue={selectedUser?.role} onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, role: v as any } : null)}>
                                                                    <SelectTrigger className="col-span-3 h-10 bg-slate-50 dark:bg-slate-950/50 border-border/50 font-bold">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-xl">
                                                                        <SelectItem value="USER">USER</SelectItem>
                                                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                                        <SelectItem value="MASTER">MASTER</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="gap-2 sm:gap-0">
                                                            <Button
                                                                variant="ghost"
                                                                className="h-10 text-xs font-bold"
                                                                onClick={() => setIsDialogOpen(false)}
                                                            >
                                                                취소
                                                            </Button>
                                                            <Button
                                                                className="h-10 text-xs font-black uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 px-6"
                                                                onClick={() => {
                                                                    const pointsInput = document.getElementById(`points-${user.id}`) as HTMLInputElement;
                                                                    const points = parseInt(pointsInput.value);
                                                                    handleUpdateUser({
                                                                        points,
                                                                        tier: selectedUser?.tier || user.tier,
                                                                        role: selectedUser?.role || user.role
                                                                    });
                                                                }}
                                                                disabled={isUpdating}
                                                            >
                                                                {isUpdating ? '동기화 중...' : '권한 적용'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
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
                            페이지 {page} / {totalPages}
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
