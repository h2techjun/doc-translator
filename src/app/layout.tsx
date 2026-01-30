import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GeoSmartProvider } from "@/context/geo-smart-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8134930906845147" crossOrigin="anonymous"></script>
        {/* Ad Block Recovery Scripts */}
        <script async src="https://fundingchoicesmessages.google.com/i/pub-8134930906845147?ers=1"></script>
        <script dangerouslySetInnerHTML={{
          __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GeoSmartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster richColors expand position="top-center" />
          </GeoSmartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
