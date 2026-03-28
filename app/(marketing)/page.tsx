import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Fiyatlandırma</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Blog</Link>
            <Link href="/auth">
              <Button variant="outline" size="sm">Giriş Yap</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-4 md:px-6 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Gerçek Net Kârınızı{" "}
              <span className="text-primary">Hesaplayın</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Trendyol, Hepsiburada, n11, Amazon TR — komisyonlar, kargo, iade, reklam ve KDV dahil
              gerçek kârlılığınızı görün.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <Button size="lg">
                  Ücretsiz Hesap Oluştur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">Fiyatlandırma</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ozellikler */}
        <section className="py-16 px-4 md:px-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center mb-10">Neden Kârnet?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BarChart3, title: "Gerçek Kâr Analizi", desc: "Komisyon, KDV, kargo, iade ve reklam maliyetlerini hesaba katarak birim başına net kârınızı görün." },
                { icon: Shield, title: "Risk Değerlendirmesi", desc: "Her ürünün risk puanını otomatik hesaplayın. Düşük marj, yüksek iade ve reklam bağımlılığını tespit edin." },
                { icon: Zap, title: "Pazaryeri Entegrasyonu", desc: "Trendyol ve Hepsiburada API entegrasyonu ile ürün ve sipariş verilerinizi otomatik senkronize edin." },
              ].map((f) => (
                <div key={f.title} className="rounded-lg border bg-card p-6 space-y-3">
                  <f.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 md:px-6 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold">Karlı Sandığınız Ürünler Gerçekten Karlı mı?</h2>
            <p className="text-muted-foreground">
              Kârnet ile gizli maliyetleri keşfedin. Ücretsiz plan ile 3 ürüne kadar analiz yapabilirsiniz.
            </p>
            <Link href="/auth">
              <Button size="lg">
                Hemen Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
