import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kârnet — Gerçek Net Kârını Hesapla",
    template: "%s | Kârnet",
  },
  description:
    "Türkiye'nin marketplace satıcılarının gerçek net kârını hesaplayan SaaS platformu. Trendyol, Hepsiburada, n11, Amazon TR desteği.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`dark ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="aurora-bg">
          <div className="aurora-orb orb-1" />
          <div className="aurora-orb orb-2" />
          <div className="aurora-orb orb-3" />
        </div>

        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
