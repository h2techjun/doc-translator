'use client';

import {
    LogOut, ChevronDown, Coins, Star,
    Settings, LayoutDashboard, Zap, Shield
} from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useGeoSmart } from '@/hooks/use-geo-smart';

export function UserMenu() {
    const { t, user, profile, isLoading } = useGeoSmart();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success(t.nav.loggedOut);
        window.location.href = '/';
    };

    if (isLoading) {
        return <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/signin">
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                        {t.nav.login}
                    </Button>
                </Link>
                <Link href="/signup">
                    <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                        {t.nav.signup}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto flex items-center gap-2 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-full transition-all duration-300 shadow-sm ml-2">
                    <div className="flex items-center gap-2 px-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            profile?.tier === 'MASTER' ? 'bg-black text-white dark:bg-white dark:text-black border border-purple-500' :
                            profile?.tier === 'DIAMOND' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            profile?.tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-600' :
                            profile?.tier === 'SILVER' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                            profile?.tier === 'BRONZE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-zinc-100 text-zinc-500 dark:bg-zinc-800' // GUEST
                        }`}>
                            {profile?.tier || 'GUEST'}
                        </span>
                        <div className="flex items-center text-[11px] text-zinc-600 dark:text-zinc-400 font-bold">
                            <Coins className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            {profile?.points || 0}
                        </div>
                    </div>
                    <div className="relative ml-1">
                        <Avatar className="h-7 w-7 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                                {(user.email?.[0] || 'G').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors mr-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 p-2 border-border/50 bg-background/95 backdrop-blur-md shadow-xl" align="end">
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.email || 'Guest User'}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                            {t.nav.pointsHold}: <span className="text-amber-500 font-bold">{profile?.points || 0}P</span>
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 bg-border/50" />
                {(profile?.role === 'ADMIN' || profile?.role === 'MASTER') && (
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-purple-500/10 focus:text-purple-600">
                        <Link href="/admin/dashboard" className="flex items-center w-full">
                            <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            <span>{t.nav.adminDashboard}</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600">
                    <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>대시보드</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600">
                    <Link href="/my-translations" className="flex items-center w-full">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>{t.nav.myHistory}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600">
                    <Link href="/settings/profile" className="flex items-center w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        <span>프로필 설정</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600">
                    <Star className="w-4 h-4 text-emerald-500" />
                    <span>{t.nav.betaBenefits}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                {(profile?.points || 0) < 10 && (
                    <div className="px-2 py-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-current" />
                                {t.nav.boostTitle}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-tight whitespace-pre-line">
                                {t.nav.boostDesc}
                            </p>
                            <Link href="/">
                                <Button size="sm" className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white mt-1">
                                    {t.nav.watchAd}
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                <DropdownMenuSeparator className="my-2 bg-border/50" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 py-2.5 rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.logout}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
