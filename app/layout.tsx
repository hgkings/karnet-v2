import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AlertProvider } from '@/contexts/alert-context';
import { Toaster } from 'sonner';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Kârnet — Gerçek Net Kârını Hesapla',
    template: '%s | Kârnet',
  },
  description:
    "Türkiye'nin marketplace satıcılarının gerçek net kârını hesaplayan SaaS platformu. Trendyol, Hepsiburada, n11, Amazon TR desteği.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://karnet.com',
    title: 'Kârnet',
    description: "Ürün portföyünüzün anlık kârlılık ve risk durumu.",
    siteName: 'Kârnet',
    images: [
      {
        url: '/brand/og.png',
        width: 1200,
        height: 630,
        alt: 'Kârnet Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kârnet',
    description: "Ürün portföyünüzün anlık kârlılık ve risk durumu.",
    images: ['/brand/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <div className="aurora-bg">
          <div className="aurora-orb orb-1" />
          <div className="aurora-orb orb-2" />
          <div className="aurora-orb orb-3" />
        </div>

        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <AuthProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              style={{ pointerEvents: 'none' }}
              toastOptions={{
                duration: 3000,
                style: { pointerEvents: 'auto' },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
