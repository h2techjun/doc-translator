'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Globe, Github, Sun, Moon, MessageSquare } from "lucide-react";
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { UserMenu } from './UserMenu';
import { useTheme } from 'next-themes';
import NotificationBell from '@/components/common/NotificationBell';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Locale } from '@/lib/i18n/dictionaries';
import { UI_LANGUAGES } from '@/lib/i18n/languages';

/**
 * 🧭 Global Navbar
 * Matches the requested screenshot style: DocTranslation Logo, Menus, Language, Social, Theme, and Profile.
 */
export function Navbar() {
    const { t, uiLang, setUiLang } = useGeoSmart();
    const { theme, setTheme } = useTheme();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-black/80">
            <div className="mx-auto flex flex-wrap items-center justify-between px-3 py-2 sm:px-6 lg:px-8">
                
                {/* 1. Logo Section (Always Left) */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90 mr-auto whitespace-nowrap">
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                        <img
                            src="/brand_logo.jpg"
                            alt="Logo"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:block">
                        {t.nav.brandName}
                    </span>
                </Link>

                {/* 2. Middle Nav Items (Row 2 on Mobile/Tablet, Center on Desktop) */}
                <div className="order-last w-full flex items-center justify-center gap-4 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 lg:order-none lg:w-auto lg:mt-0 lg:pt-0 lg:border-t-0 lg:mx-6">
                    <Link href="/community" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors whitespace-nowrap">
                        {t.nav.community}
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors whitespace-nowrap">
                        {t.nav.pricing}
                    </Link>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 p-0.5 rounded-full border border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                        <Select value={uiLang} onValueChange={(v) => setUiLang(v as Locale)}>
                            <SelectTrigger className="h-7 border-none bg-transparent shadow-none focus:ring-0 gap-1 px-2 min-w-[70px]">
                                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl">
                                {UI_LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-xs sm:text-sm">
                                        {lang.short}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 3. Right Side Actions (Row 1 Right) */}
                <div className="flex items-center gap-1 sm:gap-2 font-medium text-sm flex-shrink-0">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {/* Notification - Always Visible */}
                    <NotificationBell />

                    {/* User Profile Hook */}
                    <UserMenu />
                </div>

            </div>
        </nav>
    );
}
