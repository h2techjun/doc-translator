
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, AlertTriangle, ShieldAlert, Megaphone } from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial Fetch
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (e) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Update Handler
    const updateSetting = async (key: string, value: any) => {
        setSaving(true);
        // Optimistic update
        setSettings((prev: any) => ({ ...prev, [key]: value }));

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (!res.ok) throw new Error('Failed');
            toast.success('System configuration updated');
        } catch (e) {
            toast.error('Update failed');
            fetchSettings(); // Revert
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 animate-pulse font-mono">Loading Neural Configuration...</div>;

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <h1 className="text-4xl font-black mb-2 dark:text-white flex items-center gap-3 italic tracking-tighter uppercase">
                <Settings className="w-10 h-10 text-indigo-500" />
                System Configuration
            </h1>
            <p className="text-muted-foreground mb-8 font-bold italic opacity-70 uppercase text-xs">
                Global parameters and emergency controls.
            </p>

            <div className="grid gap-6">
                {/* 1. Maintenance Mode */}
                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-red-600 dark:text-red-400 font-black italic uppercase">🚨 Emergency Protocol</CardTitle>
                            <CardDescription className="text-red-600/70 font-bold">Manage global maintenance mode.</CardDescription>
                        </div>
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/20">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Maintenance Mode</Label>
                                <p className="text-xs text-muted-foreground">
                                    When enabled, only Admins can access the site. All other users will see a maintenance screen.
                                </p>
                            </div>
                            <Switch
                                checked={settings.MAINTENANCE_MODE === true}
                                onCheckedChange={(checked: boolean) => updateSetting('MAINTENANCE_MODE', checked)}
                                className="data-[state=checked]:bg-red-600"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Announcement Banner */}
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-black italic uppercase text-indigo-600">
                            <Megaphone className="w-5 h-5" />
                            Global Announcement
                        </CardTitle>
                        <CardDescription className="font-bold">Top banner visible to all users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Banner Text (Leave empty to disable)</Label>
                            <Input
                                placeholder="e.g., 'Server maintenance scheduled for 10 PM'"
                                defaultValue={settings.ANNOUNCEMENT_BANNER?.text || ''}
                                onBlur={(e) => {
                                    const val = e.target.value;
                                    const currentObj = settings.ANNOUNCEMENT_BANNER || {};
                                    if (val !== currentObj.text) {
                                        updateSetting('ANNOUNCEMENT_BANNER', { ...currentObj, text: val });
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Link URL</Label>
                                <Input
                                    placeholder="/pricing"
                                    defaultValue={settings.ANNOUNCEMENT_BANNER?.link || ''}
                                    onBlur={(e) => {
                                        const val = e.target.value;
                                        const currentObj = settings.ANNOUNCEMENT_BANNER || {};
                                        if (val !== currentObj.link) {
                                            updateSetting('ANNOUNCEMENT_BANNER', { ...currentObj, link: val });
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Theme Color</Label>
                                <div className="flex gap-2">
                                    {['indigo', 'emerald', 'amber', 'red'].map((color) => (
                                        <div
                                            key={color}
                                            onClick={() => updateSetting('ANNOUNCEMENT_BANNER', { ...settings.ANNOUNCEMENT_BANNER, color })}
                                            className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${settings.ANNOUNCEMENT_BANNER?.color === color ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#ef4444' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
