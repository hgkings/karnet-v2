import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/footer"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Kârnet hakkında — Türkiye'nin marketplace satıcıları için kâr analizi platformu.",
}

export default function HakkimizdaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <Link href="/auth"><Button variant="outline" size="sm">Giriş Yap</Button></Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Hakkımızda</h1>
            <p className="text-lg text-muted-foreground">
              Kârnet, Türkiye&apos;deki e-ticaret satıcılarının gerçek net kârını hesaplamalarına
              yardımcı olan bir SaaS platformudur.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Misyonumuz</h2>
            <p className="text-muted-foreground">
              Marketplace satıcılarının göremediği gizli maliyetleri yüzeye çıkarmak.
              Komisyon, kargo, iade, reklam ve KDV farkları gibi kalemleri hesaba katarak
              satıcıların doğru kararlar almasını sağlamak.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Neden Kârnet?</h2>
            <p className="text-muted-foreground">
              Birçok satıcı, ürünlerinin kârlı olduğunu düşünür. Ancak tüm maliyetler hesaba
              katıldığında, kârlı sandıkları ürünlerin aslında zararda olduğunu keşfederler.
              Kârnet bu &quot;aha anını&quot; yaşatır — ve satıcıların bilinçli kararlar almasını sağlar.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Desteklenen Pazaryerleri</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Trendyol (API entegrasyonu)</li>
              <li>Hepsiburada (API entegrasyonu)</li>
              <li>n11 (manuel analiz)</li>
              <li>Amazon TR (manuel analiz)</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
