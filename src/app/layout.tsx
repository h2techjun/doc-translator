import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GeoSmartProvider } from "@/context/geo-smart-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocTranslation - 서식 보존 번역",
  description: "AI 기반 서식 보존 문서 번역 서비스",
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
            {children}
            <Toaster richColors expand position="top-center" />
          </GeoSmartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
