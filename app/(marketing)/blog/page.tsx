import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Footer } from "@/components/layout/footer"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "Kârnet blog — e-ticaret kârlılığı, komisyon oranları ve pazar yeri ipuçları.",
}

const POSTS = [
  {
    slug: "hepsiburada-gercek-karinizi-nasil-hesaplarsiniz",
    title: "Hepsiburada'da Gerçek Kârınızı Nasıl Hesaplarsınız?",
    description: "Hepsiburada komisyonları, kargo ve iade maliyetlerini hesaba katarak gerçek kârınızı öğrenin.",
    date: "2026-03-15",
    readTime: 8,
  },
  {
    slug: "trendyol-komisyon-oranlari-2026",
    title: "Trendyol Komisyon Oranları 2026 — Tam Liste",
    description: "Trendyol'un 2026 yılı güncel komisyon oranları, kategori bazlı detaylı tablo.",
    date: "2026-03-10",
    readTime: 6,
  },
  {
    slug: "trendyolda-gercek-karinizi-nasil-hesaplarsiniz",
    title: "Trendyol'da Gerçek Kârınızı Nasıl Hesaplarsınız?",
    description: "Trendyol satışlarınızın gerçek kârlılığını hesaplamak için bilmeniz gereken her şey.",
    date: "2026-03-05",
    readTime: 10,
  },
]

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">Giriş Yap</Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground mb-8">E-ticaret kârlılığı hakkında yazılar</p>

          <div className="space-y-6">
            {POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Intl.DateTimeFormat("tr-TR").format(new Date(post.date))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} dk okuma
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
