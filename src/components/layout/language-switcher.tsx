"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTransition } from "react";

import { UI_LANGUAGES } from "@/lib/i18n/languages";

export function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const [isPending, startTransition] = useTransition();

    const handleFormatChange = (newLocale: string) => {
        // 현재 경로에서 로케일 부분만 교체
        // 예: /ko/about -> /en/about
        // 예: /ko -> /en

        // pathname이 없으면 홈으로
        if (!pathname) {
            router.push(`/${newLocale}`);
            return;
        }

        const segments = pathname.split('/');
        // segments[0] is empty string because pathname starts with /
        // segments[1] is the locale
        segments[1] = newLocale;
        const newPath = segments.join('/');

        startTransition(() => {
            router.replace(newPath);
            router.refresh(); // 서버 컴포넌트 데이터 갱신을 위해 새로고침
        });
    };

    return (
        <Select value={locale} onValueChange={handleFormatChange} disabled={isPending}>
            <SelectTrigger className="w-[130px] h-9 rounded-xl border-none bg-secondary/50 hover:bg-secondary/80 focus:ring-offset-0 focus:ring-transparent transition-colors">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground opacity-70" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl min-w-[130px]">
                {UI_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-sm font-medium">
                        {lang.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
