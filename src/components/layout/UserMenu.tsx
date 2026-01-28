'use client';

import { useState, useEffect } from 'react';
import {
    User, LogOut, ChevronDown, Coins, Star,
    Settings, LayoutDashboard, LogIn, Zap, Shield
} from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/config';
import { toast } from 'sonner';
import { useGeoSmart } from '@/hooks/use-geo-smart';

export function UserMenu() {
    const { t } = useGeoSmart();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);
            }
            setIsLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('profiles').select('*').eq('id', session.user.id).single()
                    .then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

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
                <Button variant="ghost" className="relative h-12 w-auto flex items-center gap-3 px-3 hover:bg-white/5 border border-white/5 rounded-full transition-all duration-300 shadow-sm">
                    <div className="flex flex-col items-end hidden sm:flex justify-center h-full py-1">
                        <span className="text-xs font-black leading-tight text-white tracking-tight">
                            {profile?.email?.split('@')[0] || 'Guest User'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${profile?.tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500' :
                                profile?.tier === 'SILVER' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-emerald-500/10 text-emerald-500/80 border border-emerald-500/20'
                                }`}>
                                {profile?.tier === 'GOLD' ? t.nav.tierGold :
                                    profile?.tier === 'SILVER' ? t.nav.tierSilver :
                                        t.nav.tierBronze}
                            </span>
                            <div className="flex items-center text-[10px] text-slate-400 font-bold ml-0.5">
                                <Coins className="w-3 h-3 mr-1 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                {profile?.points || 0}
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Avatar className="h-8 w-8 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-black">
                                {(user.email?.[0] || 'G').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
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
                {profile?.role === 'ADMIN' && (
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-purple-500/10 focus:text-purple-600">
                        <Link href="/admin/dashboard" className="flex items-center w-full">
                            <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            <span>{t.nav.adminDashboard}</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600">
                    <Link href="/my-translations" className="flex items-center w-full">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>{t.nav.myHistory}</span>
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
