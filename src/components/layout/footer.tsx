"use client";

import Link from "next/link";
import { useLanguage } from "@/context/geo-smart-context";
import { i18n } from "@/lib/i18n/dictionaries";

export const Footer = () => {
    const { lang } = useLanguage();
    const t = i18n[lang];

    return (
        <footer className="w-full border-t border-border bg-background/50 backdrop-blur-md py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {t.nav.brandName}. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm">
                    <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
};
