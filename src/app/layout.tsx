import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GeoSmartProvider } from "@/context/geo-smart-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from 'react';
import AdSense from "@/components/ads/AdSense";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://doctranslation.co"),
  title: "DocTranslation - 100% Formatting Preservation AI Translation",
  description: "AI-powered document translation that preserves tables, charts, and styles perfectly.",
  keywords: ["document translation", "AI translation", "preserve formatting", "DOCX translation", "PPTX translation"],
  openGraph: {
    title: "DocTranslation",
    description: "Perfect AI Translation with 100% Layout Preservation",
    url: "https://doctranslation.co",
    siteName: "DocTranslation",
    type: "website",
    images: ["/brand_logo.jpg"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GeoSmartProvider>
            <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </Suspense>
            <Toaster richColors expand position="top-center" />
          </GeoSmartProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <AdSense />
      </body>
    </html>
  );
}
