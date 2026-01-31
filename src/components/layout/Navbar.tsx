'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Globe, Github, Sun, Moon } from "lucide-react";
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
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-6 lg:px-8">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 transition-opacity hover:opacity-90">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <img
                            src="/brand_logo.jpg"
                            alt="Logo"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hidden md:block">
                        {t.nav.brandName}
                    </span>
                </Link>

                {/* Right Side Items */}
                <div className="flex items-center gap-1 sm:gap-4 font-medium text-sm">
                    {/* Main Nav Links */}
                    <div className="hidden md:flex items-center gap-6 mr-2">
                        <Link href="/community" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                            {t.nav.community}
                        </Link>
                        <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                            {t.nav.pricing}
                        </Link>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 p-0.5 sm:p-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                        <Select value={uiLang} onValueChange={(v) => setUiLang(v as Locale)}>
                            <SelectTrigger className="h-7 sm:h-8 border-none bg-transparent shadow-none focus:ring-0 gap-1 sm:gap-2 px-1.5 sm:px-3 min-w-[60px] sm:min-w-[80px]">
                                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl">
                                {UI_LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                                        {lang.short}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-9 w-9"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <div className="hidden sm:block">
                        <NotificationBell />
                    </div>

                    {/* User Profile Hook */}
                    <UserMenu />
                </div>
            </div>
        </nav>
    );
}
