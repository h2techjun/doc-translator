
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Document Translation AI',
    description: 'Translate your documents with high fidelity and ease.',
};


import Navbar from "@/components/layout/navbar";

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased min-h-screen bg-background text-foreground">
                <NextIntlClientProvider messages={messages}>
                    <Navbar locale={locale} />
                    {children}
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
