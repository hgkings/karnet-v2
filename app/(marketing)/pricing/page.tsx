import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/layout/footer"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description: "Kârnet fiyatlandırma planları. Ücretsiz, Starter ve Pro.",
}

const PLANS = [
  {
    name: "Ücretsiz",
    price: "0",
    period: "",
    description: "Başlamak için ideal",
    cta: "Ücretsiz Başla",
    href: "/auth",
    highlight: false,
    features: [
      { text: "3 ürün analizi", included: true },
      { text: "2 pazaryeri", included: true },
      { text: "Risk değerlendirmesi", included: true },
      { text: "CSV dışa aktarma", included: false },
      { text: "Duyarlılık analizi", included: false },
      { text: "Başabaş hesaplama", included: false },
      { text: "API entegrasyonu", included: false },
      { text: "PDF raporlar", included: false },
    ],
  },
  {
    name: "Starter",
    price: "399",
    period: "/ay",
    description: "Büyüyen satıcılar için",
    cta: "Starter Planı Seç",
    href: "/auth",
    highlight: false,
    features: [
      { text: "25 ürün analizi", included: true },
      { text: "4 pazaryeri", included: true },
      { text: "CSV/JSON dışa aktarma", included: true },
      { text: "Pro muhasebe modu", included: true },
      { text: "Duyarlılık analizi", included: true },
      { text: "Başabaş hesaplama", included: true },
      { text: "Aylık 5 PDF rapor", included: true },
      { text: "API entegrasyonu", included: false },
    ],
  },
  {
    name: "Pro",
    price: "799",
    period: "/ay",
    description: "Profesyonel satıcılar için",
    cta: "Pro Planı Seç",
    href: "/auth",
    highlight: true,
    features: [
      { text: "Sınırsız analiz", included: true },
      { text: "Sınırsız pazaryeri", included: true },
      { text: "Tüm dışa aktarma", included: true },
      { text: "API entegrasyonu (Trendyol, HB)", included: true },
      { text: "Nakit akış analizi", included: true },
      { text: "Sınırsız PDF rapor", included: true },
      { text: "Haftalık e-posta raporu", included: true },
      { text: "Öncelikli destek", included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <Link href="/auth"><Button variant="outline" size="sm">Giriş Yap</Button></Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold">Fiyatlandırma</h1>
            <p className="text-muted-foreground mt-2">İhtiyacınıza uygun planı seçin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={plan.highlight ? "border-primary shadow-lg relative" : ""}>
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">En Popüler</Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price} ₺</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={plan.href} className="block">
                    <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-sm">
                        {f.included ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={f.included ? "" : "text-muted-foreground"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
