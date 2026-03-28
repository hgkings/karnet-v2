import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/layout/footer"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "İletişim",
  description: "Kârnet iletişim bilgileri. Destek için bize ulaşın.",
}

export default function IletisimPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <Link href="/auth"><Button variant="outline" size="sm">Giriş Yap</Button></Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">İletişim</h1>
          <p className="text-muted-foreground mb-8">Sorularınız için bize ulaşabilirsiniz.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">E-posta</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Teknik destek ve genel sorularınız için:
                </p>
                <a href="mailto:karnet.destek@gmail.com" className="text-sm font-medium text-primary hover:underline">
                  karnet.destek@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-lg">WhatsApp</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Hızlı yanıt almak için:
                </p>
                <p className="text-sm font-medium">WhatsApp üzerinden iletişime geçin</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 rounded-lg border bg-muted/30 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              Hesabınız varsa destek talebi oluşturabilirsiniz.
            </p>
            <Link href="/support">
              <Button variant="outline">Destek Talebi Oluştur</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
