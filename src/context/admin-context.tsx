'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useGeoSmart } from './geo-smart-context';
import { createClient } from '@/lib/supabase/config';

export interface AdminPermissions {
    can_manage_users: boolean;
    can_manage_admins: boolean;
    can_manage_posts: boolean; // 커뮤니티
    can_view_audit_logs: boolean; // 작업 감시?
    can_access_security: boolean; // 보안 센터
    can_manage_system: boolean; // 시스템 설정
    can_manage_finance?: boolean; // 자금 관리 (DB 컬럼 없을 수 있음)
}

interface AdminContextType {
    permissions: AdminPermissions | null;
    isLoading: boolean;
    isMaster: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useGeoSmart();
    const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // MASTER Role Check + Whitelist Check Logic would be safer on server, 
    // but here we trust profile.role for UI rendering.
    // The actual security is enforced by Middleware and API RLS.
    const isMaster = profile?.role === 'MASTER';

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        
        // MASTER는 모든 권한 true (UI용)
        if (isMaster) {
            setPermissions({
                can_manage_users: true,
                can_manage_admins: true,
                can_manage_posts: true,
                can_view_audit_logs: true, 
                can_access_security: true,
                can_manage_system: true,
                can_manage_finance: true,
            });
            setIsLoading(false);
            return;
        }

        const fetchPermissions = async () => {
            try {
                const { data, error } = await supabase
                    .from('admin_permissions')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) {
                    console.warn('[AdminContext] Permission fetch error:', error);
                }

                if (data) {
                    setPermissions({
                        ...data,
                        // Mapping for missing columns or defaults:
                        can_manage_finance: false // 자금 관리는 Master 전용 (현재 DB 스키마상 컬럼 없음)
                    } as AdminPermissions);
                } else {
                    // 권한 레코드가 없는 경우
                    setPermissions(null);
                }
            } catch (err) {
                console.error('[AdminContext] Failed to fetch admin permissions', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPermissions();
    }, [user, isMaster, supabase]);

    return (
        <AdminContext.Provider value={{ permissions, isLoading, isMaster }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within an AdminProvider');
    return context;
}
