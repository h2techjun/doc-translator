import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Languages, User, LayoutDashboard, MessageSquare, LogOut, LogIn, FileText } from "lucide-react";
import { i18n, type Locale } from '@/lib/i18n/dictionaries';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from './language-switcher';
// @The-Nerd: Redirect utility for logout
import { redirect } from 'next/navigation';

/**
 * 🧭 네비게이션 바 (Navbar)
 * 
 * 모든 페이지 상단에 위치하며, 홈/대시보드/커뮤니티 이동 및 로그인/사용자 설정을 관리합니다.
 */
export default async function Navbar({ locale = 'ko' }: { locale?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const session = user ? { user } : null; // Compatibility layer for existing UI logic

    const dictionary = i18n[locale as Locale] || i18n.ko;
    const t = dictionary.nav;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-8">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
                        <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                            <Languages className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Translation AI
                        </span>
                    </Link>

                    {/* 주요 메뉴 */}
                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-primary">
                            홈
                        </Link>
                        <Link href="/community" className="transition-colors hover:text-primary flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {t.community}
                        </Link>
                        {session && (
                            <>
                                <Link href="/my-translations" className="transition-colors hover:text-primary flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    {t.myHistory}
                                </Link>
                                <Link href="/admin" className="transition-colors hover:text-primary flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4" />
                                    {t.adminDashboard}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* 언어 선택기 */}
                    <LanguageSwitcher />

                    {session ? (
                        /* 로그인된 경우: 사용자 프로필 드롭다운 */
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session.user?.user_metadata?.avatar_url || ""} alt={session.user?.email || ""} />
                                        <AvatarFallback className="bg-primary/5">
                                            <User className="h-5 w-5 text-primary" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border-border/50" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">{session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0]}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                    <Link href="/admin" className="w-full">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>내 대시보드</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <form action={async () => {
                                    "use server";
                                    const supabase = await createClient();
                                    await supabase.auth.signOut();
                                    redirect(`/${locale}/login`);
                                }}>
                                    <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:text-destructive p-0">
                                        <button className="w-full flex items-center px-2 py-1.5 focus:outline-none" type="submit">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>로그아웃</span>
                                        </button>
                                    </DropdownMenuItem>
                                </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        /* 로그인되지 않은 경우: 로그인 버튼 */
                        <Link href={`/${locale}/login`}>
                            <Button className="rounded-xl px-5 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                <LogIn className="mr-2 h-4 w-4" />
                                {t.login}
                            </Button>
                        </Link>
                    )}
                </div>
            </div >
        </nav >
    );
}
