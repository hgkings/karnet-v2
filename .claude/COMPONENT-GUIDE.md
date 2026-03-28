# COMPONENT-GUIDE.md — UI ve Bileşen Standartları
> Sadece FAZ7'de oku. Başka fazda açma.
> Bu kurallar Kârnet'teki her UI elementinin nasıl görüneceğini ve davranacağını tanımlar.
> Son güncelleme: 2026-03-28

---

## TEMEL UI PRENSİPLERİ

1. **Mobile-first** — 375px için tasarla, yukarı ölçekle. Tersi değil.
2. **Türk kullanıcılar** — TL para birimi, Türkçe tarih, Türkçe hata mesajları
3. **Veri-yoğun** — Satıcıların sayılara hızlı erişmesi gerekir, dekoratif dolgu yok
4. **Güven sinyalleri** — Ödeme, veri, güvenlik güvenli hissettirmeli
5. **Kâr = yeşil, Zarar = kırmızı** — Her zaman. Tasarım nedeniyle asla istisna yok.

---

## TEKNOLOJİ YIĞINI (UI)

- **Framework:** Next.js 15 App Router
- **Stil:** Tailwind CSS v4 (utility-first, zorunlu olmadıkça custom CSS yok)
- **Bileşenler:** shadcn/ui (temel) — özelleştir, değiştirme
- **İkonlar:** Lucide React (shadcn ile geliyor)
- **Grafikler:** Recharts (kâr/zarar görselleştirmeleri için)
- **Animasyonlar:** Framer Motion (ağır animasyonlarda kullan)
- **Fontlar:** Sistem font yığını — performans için Google Fonts yok

---

## RENK PALETİ

```css
/* Marka Renkleri */
--karnet-green:   #16a34a   /* kâr, başarı, pozitif */
--karnet-red:     #dc2626   /* zarar, hata, tehlike */
--karnet-orange:  #ea580c   /* uyarı, dikkat */
--karnet-blue:    #2563eb   /* bilgi, linkler, CTA */
--karnet-gold:    #f59e0b   /* Pro rozeti, premium */

/* Nötrler (açık mod) */
--bg-primary:     #ffffff
--bg-secondary:   #f9fafb
--bg-tertiary:    #f3f4f6
--border:         #e5e7eb
--text-primary:   #111827
--text-secondary: #6b7280
--text-muted:     #9ca3af

/* Nötrler (koyu mod) */
--bg-primary:     #0f172a
--bg-secondary:   #1e293b
--bg-tertiary:    #334155
--border:         #475569
--text-primary:   #f8fafc
--text-secondary: #94a3b8
--text-muted:     #64748b
```

---

## TİPOGRAFİ SKALASI

```
text-xs    (12px) — etiketler, rozetler, zaman damgaları (mobilde minimum)
text-sm    (14px) — ikincil metin, tablo hücreleri, açıklamalar
text-base  (16px) — gövde metni, form inputları
text-lg    (18px) — kart başlıkları, bölüm başlıkları
text-xl    (20px) — sayfa bölüm başlıkları
text-2xl   (24px) — sayfa başlıkları
text-3xl   (30px) — dashboard kahraman sayıları (kâr/zarar KPI'ları)
text-4xl+         — YASAK (veri-yoğun UI için çok büyük)
```

**Mobilde minimum font boyutu: 12px (text-xs)**
- `text-[10px]` veya `text-[9px]` sadece masaüstünde kullanılabilir
- Responsive: `text-[10px] md:text-[10px]` — mobilde `text-xs` olmalı

**Font ağırlığı:**
- `font-normal` (400) — gövde metni
- `font-medium` (500) — etiketler, ikincil başlıklar
- `font-semibold` (600) — kart başlıkları, önemli değerler
- `font-bold` (700) — KPI sayıları, sayfa başlıkları

---

## BOŞLUK SİSTEMİ

Sadece Tailwind boşluk kullan. Custom değer yok.

```
Kartların içindeki boşluk:  p-4 (16px)
Kartlar arası boşluk:       gap-4 (16px)
Bölüm dolgusu:              py-6 px-4 (mobil) → py-8 px-6 (masaüstü)
Form alanı boşluğu:         space-y-4
Tablo hücresi dolgusu:      px-4 py-3
```

---

## MOBİL KURALLARI (v1 hatalarından öğrenildi)

v1'de olan ve v2'de **TEKRAR ETMEYECEK** sorunlar:

```
✗ Sidebar mobilde içeriğin üzerine geliyor
✗ Tablolar yatay scroll olmadan taşıyor
✗ Modal'lar viewport'tan uzun
✗ Butonlar çok küçük (min dokunma hedefi: 44x44px)
✗ Küçük ekranlarda metin çok küçük
✗ 4 sütunlu grid mobilde sığmıyor
```

**Mobil için her zaman:**
```
□ Tüm tablolar: overflow-x-auto içinde sarılı
□ Tüm modal'lar: max-h-[90vh] overflow-y-auto
□ Tüm butonlar: minimum h-10 (40px) mobilde
□ Sidebar: mobilde gizli, Sheet bileşeni ile drawer
□ Grid'ler: grid-cols-1 sm:grid-cols-2 lg:grid-cols-N
□ Her sayfayı 375px genişlikte test et
```

---

## BİLEŞEN KALIPları

### KPI Kartı (Kâr/Zarar Gösterimi)
```tsx
// Kullanım: net kâr, gelir, iade oranı, reklam harcaması
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Net Kâr
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-green-600">
      1.234,56 ₺
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Bu ay • 142 sipariş
    </p>
  </CardContent>
</Card>
```

### Veri Tablosu
```tsx
// shadcn Table bileşenini kullan
// Her zaman şunları içer: yükleme durumu, boş durum, hata durumu
// Mobilde max sütun: 3 (ürün adı, kâr, durum)
// Masaüstünde: tüm sütunlar
// Sıralanabilir sütunlar: lucide'den ArrowUpDown ikonu
// ZORUNLU: overflow-x-auto wrapper
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

### Form Alanları
```tsx
// shadcn Form + React Hook Form + Zod kullan
// Her alan şunları içermeli: etiket, input, hata mesajı
// Hata mesajları: Türkçe, özel ("Geçerli bir e-posta adresi girin")
// Asla: "Invalid input" veya kullanıcıya İngilizce hata
// Zorunlu alanlar kırmızı yıldız (*) ile işaretlenmeli
```

### Yükleme Durumları
```tsx
// İçerik alanları için: skeleton — spinner değil
// Buton tıklama aksiyonları için: spinner
import { Skeleton } from "@/components/ui/skeleton"

// Kart yükleme:
<Skeleton className="h-[120px] w-full rounded-xl" />

// Tablo yükleme:
{Array.from({length: 5}).map((_, i) => (
  <Skeleton key={i} className="h-12 w-full" />
))}

// Buton yükleme:
<Button disabled={loading}>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Kaydet
</Button>
```

### Boş Durumlar
```tsx
// Her liste/tablo boş durum içermeli
// Yapı: ikon + başlık + açıklama + CTA
<div className="flex flex-col items-center justify-center py-12 text-center">
  <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="font-semibold text-lg">Henüz ürün yok</h3>
  <p className="text-muted-foreground text-sm mt-1 mb-4">
    İlk ürününüzü ekleyerek başlayın.
  </p>
  <Button>Ürün Ekle</Button>
</div>
```

### Hata Durumları
```tsx
// Ağ/API hataları: mesaj + tekrar dene butonu
// Kullanıcıya asla ham hata mesajı veya stack trace gösterme
<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
  <p className="text-sm text-destructive">
    Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
  </p>
  <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
    Tekrar Dene
  </Button>
</div>
```

### Silme Onay Dialog'u
```tsx
// Silme işlemlerinde ZORUNLU — v1'de yoktu, v2'de ekle
// Kullanım: analiz silme, marketplace bağlantısı kesme vb.
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
      <AlertDialogDescription>
        Bu analizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Vazgeç</AlertDialogCancel>
      <AlertDialogAction onClick={onConfirm} className="bg-destructive">
        Sil
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## SAYFA LAYOUT YAPISI

```tsx
// Standart dashboard sayfası
export default function PageName() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Sayfa Başlığı */}
      <div>
        <h1 className="text-2xl font-bold">Sayfa Başlığı</h1>
        <p className="text-muted-foreground text-sm">Alt açıklama</p>
      </div>

      {/* KPI Satırı */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI Kartları */}
      </div>

      {/* Ana İçerik */}
      <Card>
        {/* Tablo veya Grafik */}
      </Card>
    </div>
  )
}
```

---

## PRO / FREE KATMANı UI

```tsx
// Kilitli özellikler: blur ile içerik + yükseltme istemi göster
// Asla: özellikleri tamamen gizleme (kullanıcılar keşfedemez)
// Bileşen: ProLockedSection wrapper

<ProLockedSection featureName="Gelişmiş Analiz">
  {/* yükseltme overlay'inin arkasında bulanık içerik */}
</ProLockedSection>
```

---

## BİLDİRİM / TOAST

```tsx
// shadcn Toast'ı useToast hook ile kullan
// Başarı: yeşil, 3 saniye
// Hata: kırmızı, 5 saniye (okuma süresi için daha uzun)
// Uyarı: turuncu, 4 saniye
// Her zaman Türkçe mesajlar

toast({ title: "Kaydedildi", description: "Değişiklikler başarıyla kaydedildi." })
toast({ title: "Hata", description: "İşlem tamamlanamadı.", variant: "destructive" })
```

---

## İSİMLENDİRME KURALLARI

```
Sayfalar:       app/(dashboard)/[özellik]/page.tsx
Layout'lar:     app/(dashboard)/layout.tsx
Bileşenler:     components/[özellik]/BilesenAdi.tsx
Paylaşımlı UI:  components/shared/BilesenAdi.tsx
Hook'lar:       hooks/use-ozellik-adi.ts
Tipler:         types/ozellik.types.ts
```

**Bileşen isimlendirme:**
- Bileşenler için PascalCase
- Hook'lar ve yardımcılar için camelCase
- Dosya adları için kebab-case

---

## YAPILMAYACAKLAR (UI)

```
✗ Hardcoded renkler (CSS değişkenleri / Tailwind kullan)
✗ Inline stiller (Tailwind class'larını kullan)
✗ Kullanıcıya görünen İngilizce metin
✗ Kullanıcıya ham hata mesajı gösterme
✗ CTA'sız boş durumlar
✗ Skeleton'sız yükleme durumları
✗ Yatay scroll olmadan tablolar
✗ Kapat butonu olmadan modal'lar
✗ Validasyon geri bildirimi olmadan formlar
✗ Türkçe locale formatlaması olmadan sayılar
✗ Onay dialog'u olmadan silme işlemleri
✗ Yükleme sırasında disabled olmayan submit butonlar
```

---

## HER SAYFANIN İÇERMESİ GEREKENLER

```
□ Yükleme durumu (skeleton bileşeni)
□ Boş durum (ikon + mesaj + CTA)
□ Hata durumu (mesaj + tekrar dene butonu)
□ 375px genişlikte test edildi
□ Silme/destructive işlemler için onay dialog'u
□ Form alanlarında zorunlu alan göstergesi (*)
□ Türkçe hata ve başarı mesajları
```
