import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background py-8 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Marka */}
          <div>
            <h3 className="font-bold text-lg text-primary mb-3">Kârnet</h3>
            <p className="text-sm text-muted-foreground">
              Türkiye&apos;nin marketplace satıcıları için gerçek net kâr hesaplama platformu.
            </p>
          </div>

          {/* Urun */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Ürün</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Sirket */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Şirket</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/hakkimizda" className="hover:text-foreground transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-foreground transition-colors">İletişim</Link></li>
              <li><Link href="/support" className="hover:text-foreground transition-colors">Destek</Link></li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Yasal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gizlilik-politikasi" className="hover:text-foreground transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-sartlari" className="hover:text-foreground transition-colors">Kullanım Şartları</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-foreground transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kârnet. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
