'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGeoSmart } from '@/context/geo-smart-context';

const PERMISSION_TYPES = [
    { id: 'MANAGE_USERS', label: '사용자 관리', description: '사용자 정보 수정 및 제재 권한' },
    { id: 'MANAGE_POSTS', label: '게시물 관리', description: '커뮤니티 게시물 및 댓글 삭제 권한' },
    { id: 'VIEW_AUDIT_LOGS', label: '감사 로그 조회', description: '관리자 활동 로그 조회 권한' },
    { id: 'SYSTEM_SETTINGS', label: '시스템 설정', description: '글로벌 파라미터 변경 권한 (위험)' },
];

export default function PermissionsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useGeoSmart();

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/permissions', {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });
            
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            const data = await res.json();
            if (Array.isArray(data)) {
                setAdmins(data);
            }
        } catch (error: any) {
            console.error("[Permissions] Fetch Failed:", error);
            toast.error(`데이터 로드 실패: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleTogglePermission = async (userId: string, permissionType: string, currentStatus: boolean) => {
        if (profile?.role !== 'MASTER') {
            toast.error('총 관리자(MASTER)만 권한을 수정할 수 있습니다.');
            return;
        }

        try {
            // UI 즉시 반영 (Optimistic Update)
            setAdmins(prev => prev.map(admin => {
                if (admin.id === userId) {
                    const newPerms = currentStatus 
                        ? admin.permissions.filter((p: string) => p !== permissionType)
                        : [...admin.permissions, permissionType];
                    return { ...admin, permissions: newPerms };
                }
                return admin;
            }));

            const res = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    permissions: currentStatus 
                        ? admins.find(a => a.id === userId).permissions.filter((p: string) => p !== permissionType)
                        : [...admins.find(a => a.id === userId).permissions, permissionType]
                })
            });

            if (!res.ok) throw new Error('권한 저장에 실패했습니다.');
            toast.success('권한 설정이 변경되었습니다.');
        } catch (error: any) {
            toast.error(error.message);
            fetchPermissions(); // 실패 시 롤백용 재조회
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tighter uppercase dark:text-white">
                        <Key className="w-10 h-10 text-indigo-500" />
                        관리자 권한 설정
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground mt-1">
                        등록된 관리자들에게 세부 권한을 부여하거나 회수할 수 있습니다.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20">
                    <CardContent className="pt-6 flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">주의사항</p>
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mt-1">
                                권한 변경은 즉시 적용됩니다. 신규 관리자 임명은 <span className="underline font-bold">회원 관리</span> 페이지에서 역할을 수정해 주세요.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-border/50 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-xl font-black italic tracking-tight uppercase">관리자 권한 대시보드</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase opacity-60">현재 시스템에 등록된 모든 관리자 목록</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest pl-8">관리자 정보</TableHead>
                                    {PERMISSION_TYPES.map(p => (
                                        <TableHead key={p.id} className="text-center font-black uppercase text-[10px] tracking-widest">
                                            {p.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={PERMISSION_TYPES.length + 1} className="h-40 text-center italic text-muted-foreground animate-pulse">
                                            데이터를 불러오는 중...
                                        </TableCell>
                                    </TableRow>
                                ) : admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={PERMISSION_TYPES.length + 1} className="h-40 text-center italic text-muted-foreground">
                                            등록된 관리자가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    admins.map((admin) => (
                                        <TableRow key={admin.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${admin.is_master ? 'bg-amber-100 dark:bg-amber-900' : 'bg-indigo-100 dark:bg-indigo-900'} flex items-center justify-center`}>
                                                        <ShieldCheck className={`w-4 h-4 ${admin.is_master ? 'text-amber-600' : 'text-indigo-500'}`} />
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-black dark:text-white truncate max-w-[120px]">{admin.full_name}</span>
                                                            {admin.is_master && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-black italic uppercase">MASTER</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{admin.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {PERMISSION_TYPES.map(p => (
                                                <TableCell key={p.id} className="text-center">
                                                    <Checkbox 
                                                        checked={admin.permissions?.includes(p.id)}
                                                        onCheckedChange={() => handleTogglePermission(admin.id, p.id, admin.permissions?.includes(p.id))}
                                                        className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                        disabled={profile?.role !== 'MASTER' || admin.is_master}
                                                    />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
