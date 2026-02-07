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
import { Users, Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface User {
    id: string;
    email: string | null;
    role: 'USER' | 'ADMIN' | 'MASTER';
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'MASTER';
    points: number;
    total_translations: number;
    created_at: string;
    signed_up_at?: string;
    last_sign_in_at: string | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'normal' | 'guest'>('normal');
    
    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkAction, setBulkAction] = useState<'grant_points' | 'update_role' | 'update_tier' | null>(null);
    const [bulkValue, setBulkValue] = useState<string>('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [tierFilter, setTierFilter] = useState('ALL');
    const [configError, setConfigError] = useState<string | null>(null);

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
        if (!window.confirm(`${selectedIds.size}명의 사용자에게 작업을 수행하시겠습니까?`)) return;

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
        setConfigError(null);
        setSelectedIds(new Set()); 
        try {
            const url = new URL('/api/admin/users', window.location.origin);
            url.searchParams.set('page', pageNum.toString());
            url.searchParams.set('limit', '20');
            url.searchParams.set('tab', activeTab);
            if (searchQuery) url.searchParams.set('search', searchQuery);
            if (roleFilter !== 'ALL') url.searchParams.set('role', roleFilter);
            if (tierFilter !== 'ALL') url.searchParams.set('tier', tierFilter);

            const res = await fetch(url.toString());
            const result = await res.json();

            if (res.ok) {
                setUsers(result.data || []);
                setTotalPages(Math.ceil((result.pagination?.total || 0) / (result.pagination?.limit || 20)));
            } else {
                if (result.error?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
                    setConfigError('시스템 설정 오류: SUPABASE_SERVICE_ROLE_KEY가 누락되었습니다.');
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page, roleFilter, tierFilter, activeTab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers(1);
    };

    useEffect(() => {
        setPage(1);
    }, [roleFilter, tierFilter, activeTab]);

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black mb-2 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        회원 관리 (User Management)
                    </h1>
                    <p className="text-muted-foreground">
                        플랫폼 회원, 역할 및 포인트 관리.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full md:w-auto">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-11">
                        <TabsTrigger 
                            value="normal" 
                            className="px-6 rounded-lg text-xs font-black uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                        >
                            정식 회원 (Bronze+)
                        </TabsTrigger>
                        <TabsTrigger 
                            value="guest" 
                            className="px-6 rounded-lg text-xs font-black uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                        >
                            게스트 (Guest)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {configError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500 animate-pulse">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <div className="text-sm font-bold">{configError}</div>
                </div>
            )}

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-border/10 bg-slate-50/30 dark:bg-slate-800/20 py-6">
                    <div>
                        <CardTitle className="text-xl font-black">{activeTab === 'normal' ? '정식 회원' : '게스트'} 목록</CardTitle>
                        <CardDescription className="text-xs font-medium">
                            {activeTab === 'normal' 
                                ? '이메일 인증이 완료된 정식 사용자의 목록입니다.' 
                                : '이메일 정보가 없는 익명 방문자 및 게스트 회원 목록입니다.'}
                        </CardDescription>
                    </div>
                    
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 mt-4 md:mt-0">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mr-2 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                {selectedIds.size}명 선택됨
                            </span>
                            <Select onValueChange={(v) => setBulkAction(v as any)}>
                                <SelectTrigger className="w-[140px] h-10 text-xs font-bold ring-offset-background focus:ring-2 focus:ring-indigo-500">
                                    <SelectValue placeholder="일괄 작업 선택" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    <SelectItem value="grant_points" className="font-medium">🎁 포인트 지급</SelectItem>
                                    <SelectItem value="update_role" className="font-medium">👑 역할 변경</SelectItem>
                                    <SelectItem value="update_tier" className="font-medium">💎 등급 변경</SelectItem>
                                </SelectContent>
                            </Select>

                            {bulkAction === 'update_tier' && (
                                <Select onValueChange={setBulkValue}>
                                    <SelectTrigger className="w-[120px] h-10 text-xs font-bold">
                                        <SelectValue placeholder="등급 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="BRONZE">BRONZE</SelectItem>
                                        <SelectItem value="SILVER">SILVER</SelectItem>
                                        <SelectItem value="GOLD">GOLD</SelectItem>
                                        <SelectItem value="DIAMOND">DIAMOND</SelectItem>
                                        <SelectItem value="MASTER">MASTER</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {bulkAction === 'grant_points' && (
                                <Input 
                                    placeholder="지급 포인트" 
                                    className="w-[120px] h-10 text-xs font-bold text-amber-600" 
                                    type="number"
                                    value={bulkValue}
                                    onChange={(e) => setBulkValue(e.target.value)}
                                />
                            )}

                            {bulkAction === 'update_role' && (
                                <Select onValueChange={setBulkValue}>
                                    <SelectTrigger className="w-[100px] h-10 text-xs font-bold">
                                        <SelectValue placeholder="역할" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="USER">USER</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            <Button 
                                size="sm" 
                                className="h-10 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 px-6 uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                                onClick={handleBulkAction}
                                disabled={isBulkProcessing || !bulkAction || !bulkValue}
                            >
                                {isBulkProcessing ? '처리 중...' : '확인'}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <form onSubmit={handleSearch} className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground mr-2" />
                            <Input 
                                placeholder="이메일 또는 ID로 검색... (엔터)" 
                                className="pl-10 h-11 text-sm font-bold bg-white dark:bg-slate-900 border-border/50 transition-all focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase text-muted-foreground px-2">Role</span>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-[110px] h-8 text-[11px] font-black border-none bg-transparent focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ALL">ALL ROLES</SelectItem>
                                        <SelectItem value="USER">USER</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        <SelectItem value="MASTER">MASTER</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase text-muted-foreground px-2">Tier</span>
                                <Select value={tierFilter} onValueChange={setTierFilter}>
                                    <SelectTrigger className="w-[110px] h-8 text-[11px] font-black border-none bg-transparent focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ALL">ALL TIERS</SelectItem>
                                        <SelectItem value="BRONZE">BRONZE</SelectItem>
                                        <SelectItem value="SILVER">SILVER</SelectItem>
                                        <SelectItem value="GOLD">GOLD</SelectItem>
                                        <SelectItem value="DIAMOND">DIAMOND</SelectItem>
                                        <SelectItem value="MASTER">MASTER</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 overflow-hidden shadow-inner bg-white dark:bg-transparent">
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40">
                                <TableRow className="border-b border-border/30">
                                    <TableHead className="w-[50px] pl-6">
                                        <input 
                                            type="checkbox" 
                                            className="accent-indigo-500 w-4 h-4 cursor-pointer rounded-sm"
                                            checked={users.length > 0 && selectedIds.size === users.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70">이메일 (Email)</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70 text-center">역할</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70 text-center">등급</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70 text-center">포인트</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70 text-center">번역수</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-70">활동일</TableHead>
                                    <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-tighter opacity-70">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-sm font-bold animate-pulse">
                                            데이터를 안전하게 동기화 중입니다...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                                            해당하는 회원이 존재하지 않습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className={`group hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all border-b border-border/20 ${selectedIds.has(user.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                            <TableCell className="pl-6">
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-indigo-500 w-4 h-4 cursor-pointer rounded-sm"
                                                    checked={selectedIds.has(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col py-1">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{user.email || '익명 게스트'}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono opacity-60">
                                                        UID: <span className="tracking-tighter">{user.id}</span>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    {user.role === 'MASTER' ? (
                                                        <Badge className="bg-rose-500 text-white border-none gap-1 font-black italic scale-90 px-3 hover:bg-rose-600 transition-colors">
                                                            MASTER
                                                        </Badge>
                                                    ) : user.role === 'ADMIN' ? (
                                                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-none gap-1 font-black scale-90 px-3">
                                                            <Shield className="w-3 h-3" /> ADMIN
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold scale-90 px-3">
                                                            USER
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Badge variant="outline" className={`font-black text-[10px] scale-90 px-3 py-0.5 rounded-full border-2 transition-all
                                                        ${user.tier === 'MASTER' ? 'bg-black text-white dark:bg-white dark:text-black border-purple-500 ring-2 ring-purple-500/20' : ''}
                                                        ${user.tier === 'DIAMOND' ? 'bg-indigo-600 text-white border-indigo-400' : ''}
                                                        ${user.tier === 'GOLD' ? 'text-yellow-600 border-yellow-500/40 bg-yellow-500/5' : ''}
                                                        ${user.tier === 'SILVER' ? 'text-blue-500 border-blue-500/40 bg-blue-500/5' : ''}
                                                        ${user.tier === 'BRONZE' ? 'text-zinc-500 border-zinc-200 bg-zinc-50' : ''}
                                                    `}>
                                                        {user.tier}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-amber-600 dark:text-amber-400 font-black text-xs">
                                                {user.points?.toLocaleString()}P
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="bg-slate-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-border/30">
                                                    {user.total_translations}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-[10px] text-muted-foreground font-medium">
                                                <div className="flex flex-col">
                                                    <span>{formatDistanceToNow(new Date(user.created_at || user.signed_up_at || new Date()), { addSuffix: true, locale: ko })}</span>
                                                    <span className="text-[9px] opacity-60">
                                                        최근: {user.last_sign_in_at ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true, locale: ko }) : '기록 없음'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                                    if (!open) setIsDialogOpen(false);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-4 text-[10px] font-black uppercase border-indigo-500/30 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm transition-all"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            관리
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-border shadow-2xl rounded-3xl p-8 focus:ring-0 ring-0 outline-none">
                                                        <DialogHeader className="mb-6">
                                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
                                                                <Shield className="w-6 h-6 text-indigo-600" />
                                                            </div>
                                                            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-indigo-600">권한 및 자산 수정</DialogTitle>
                                                            <DialogDescription className="text-xs font-bold opacity-70">
                                                                사용자 <span className="text-foreground underline underline-offset-4 decoration-indigo-500/30">{selectedUser?.email || selectedUser?.id}</span>의 데이터를 즉시 변경합니다.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        
                                                        <div className="grid gap-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase opacity-60 ml-1 tracking-widest text-indigo-600">포인트 (Points Balance)</Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        className="h-14 bg-slate-50 dark:bg-slate-950/50 border-border/50 text-amber-500 font-black text-2xl pl-12 rounded-2xl transition-all focus:ring-2 focus:ring-amber-500"
                                                                        defaultValue={selectedUser?.points}
                                                                        id={`points-${user.id}`}
                                                                    />
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-500/40 italic">P</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase opacity-60 ml-1 tracking-widest text-indigo-600">등급 (Tier Plan)</Label>
                                                                    <Select defaultValue={selectedUser?.tier} onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, tier: v as any } : null)}>
                                                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-border/50 font-black text-xs rounded-xl">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="rounded-2xl border-border/50">
                                                                            <SelectItem value="BRONZE" className="text-xs font-bold">BRONZE</SelectItem>
                                                                            <SelectItem value="SILVER" className="text-xs font-bold">SILVER</SelectItem>
                                                                            <SelectItem value="GOLD" className="text-xs font-bold text-yellow-600">GOLD</SelectItem>
                                                                            <SelectItem value="DIAMOND" className="text-xs font-bold text-indigo-600">DIAMOND</SelectItem>
                                                                            <SelectItem value="MASTER" className="text-xs font-black italic text-rose-600">MASTER</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black uppercase opacity-60 ml-1 tracking-widest text-indigo-600">역할 (User Role)</Label>
                                                                    <Select defaultValue={selectedUser?.role} onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, role: v as any } : null)}>
                                                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-border/50 font-black text-xs rounded-xl">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="rounded-2xl border-border/50">
                                                                            <SelectItem value="USER" className="text-xs font-bold">USER</SelectItem>
                                                                            <SelectItem value="ADMIN" className="text-xs font-black text-indigo-600">ADMIN</SelectItem>
                                                                            <SelectItem value="MASTER" className="text-xs font-black text-rose-600">MASTER</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <DialogFooter className="mt-8 flex gap-3">
                                                            <Button
                                                                variant="ghost"
                                                                className="h-12 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground hover:bg-slate-100 rounded-xl"
                                                                onClick={() => setIsDialogOpen(false)}
                                                            >
                                                                취소
                                                            </Button>
                                                            <Button
                                                                className="h-12 flex-1 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 rounded-xl transition-all active:scale-95"
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
                                                                {isUpdating ? '데이터 갱신 중...' : '변경 사항 저장'}
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

                    <div className="flex items-center justify-between py-6">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                            DOC-TRANSLATION ADMIN CORE
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center px-4 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black tracking-tighter">
                                <span className="text-indigo-600">{page}</span>
                                <span className="mx-2 opacity-20">/</span>
                                <span className="opacity-50">{totalPages}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl border-border/50 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
