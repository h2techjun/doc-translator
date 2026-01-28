import Link from 'next/link';
import { Languages } from 'lucide-react';
import { useGeoSmart } from '@/hooks/use-geo-smart';

export function Footer() {
    const { t } = useGeoSmart();
    return (
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Languages className="w-6 h-6" />
                        <span className="font-bold text-lg">{t.nav.brandName}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Professional Document Translation<br />
                        Preserving Layout & Formatting
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><Link href="/translate/en-to-ko/docx" className="hover:text-black dark:hover:text-white">Word Translator</Link></li>
                        <li><Link href="/translate/en-to-ko/xlsx" className="hover:text-black dark:hover:text-white">Excel Translator</Link></li>
                        <li><Link href="/translate/en-to-ko/pptx" className="hover:text-black dark:hover:text-white">PPT Translator</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Community</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><Link href="/community?tab=free" className="hover:text-black dark:hover:text-white">Forum</Link></li>
                        <li><Link href="/community?tab=inquiry" className="hover:text-black dark:hover:text-white">Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><Link href="/privacy" className="hover:text-black dark:hover:text-white">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-black dark:hover:text-white">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Global {t.nav.brandName}. All rights reserved.
            </div>
        </footer>
    );
}
