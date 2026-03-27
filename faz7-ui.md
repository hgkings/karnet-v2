# FAZ7 — UI Katmanı
> Ön koşul: FAZ6 tamamlandı (tüm API route'ları çalışıyor)
> Hedef: Tüm sayfalar ve bileşenler — mobile-first, Türkçe, sadece lib/api/ üzerinden veri
> ŞİMDİ OKU: COMPONENT-GUIDE.md (sadece bu fazda)
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: UI katmanını kur (Katman 1)
LAYERS: app/ (sayfalar), components/
FILES TO CREATE:
  Auth sayfaları:
  - app/(auth)/auth/page.tsx                  ← Giriş + kayıt (tek sayfa, toggle ile)
  - app/(auth)/auth/forgot-password/page.tsx  ← Şifremi unuttum
  - app/(auth)/auth/reset-password/page.tsx   ← Şifre sıfırlama
  - app/(auth)/auth/verify-email/page.tsx     ← Email doğrulama bekle

  Dashboard sayfaları:
  - app/(dashboard)/layout.tsx
  - app/(dashboard)/dashboard/page.tsx        ← KPI özeti
  - app/(dashboard)/analysis/page.tsx         ← Analiz listesi
  - app/(dashboard)/analysis/[id]/page.tsx    ← Analiz detayı
  - app/(dashboard)/products/page.tsx
  - app/(dashboard)/marketplace/page.tsx
  - app/(dashboard)/settings/page.tsx
  - app/(dashboard)/support/page.tsx
  - app/(dashboard)/billing/page.tsx

  Marketing sayfaları:
  - app/(marketing)/page.tsx                  ← Landing sayfası
  - app/(marketing)/pricing/page.tsx
  - app/(marketing)/blog/page.tsx
  - app/(marketing)/blog/[slug]/page.tsx
  - app/(marketing)/hakkimizda/page.tsx
  - app/(marketing)/iletisim/page.tsx

  Admin sayfaları:
  - app/admin/page.tsx
  - app/admin/users/page.tsx
  - app/admin/payments/page.tsx
  - app/admin/support/page.tsx
  - app/admin/comments/page.tsx

  Bileşenler:
  - components/layout/sidebar.tsx
  - components/layout/navbar.tsx
  - components/layout/dashboard-layout.tsx
  - components/shared/kpi-card.tsx
  - components/shared/pro-status-card.tsx
  - components/shared/pro-locked-section.tsx
  - components/shared/risk-badge.tsx
  - components/features/analysis/analysis-form.tsx
  - components/features/analysis/result-display.tsx
  - components/features/dashboard/products-table.tsx
  - [diğer bileşenler gerektiğinde]

  UI fetch helper'ları:
  - lib/api/client.ts                         ← Base fetch wrapper
  - lib/api/analyses.ts
  - lib/api/notifications.ts
  - lib/api/marketplace.ts
  - lib/api/support.ts

FILES NOT TOUCHED: services/, repositories/, lib/gateway/, lib/supabase/
RISK: Mobil taşma sorunları — her sayfayı 375px'de test et
→ Awaiting approval.
```

---

## KRİTİK KURALLAR

COMPONENT-GUIDE.md'yi tamamen oku.

UI katmanı VERİYİ SADECE `lib/api/client.ts` üzerinden getirir.
Supabase, service veya repository import'u kesinlikle yasak.

```typescript
// lib/api/client.ts — UI'ın veri getirdiği TEK yer
export const api = {
  get: async <T>(path: string): Promise<T> => {
    const res = await fetch(path)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  post: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

// Herhangi bir sayfada/bileşende:
const data = await api.get('/api/analyses')        // ✓ doğru
import { AnalysisLogic } from '@/services/...'     // ✗ YASAK
```

---

## V1 HATA DÜZELTMELERİ (her sayfada uygula)

ERROR-REPORT.md'den — v2 UI'ında bunları uygula:

**Mobil düzeltmeleri:**
- Tüm tablolar `overflow-x-auto` wrapper içinde
- Sidebar mobilde `Sheet` bileşeni kullanıyor (gizli değil)
- Tüm grid'ler `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N` kullanıyor
- Min dokunma hedefi her yerde 44px
- Minimum font boyutu mobilde 12px (text-xs)
- Modal'lar `max-h-[90vh] overflow-y-auto`

**UX düzeltmeleri:**
- Her silme işlemi onay dialog'u içeriyor
- Her form `disabled={loading}` submit butonu içeriyor
- Her tablo/liste yükleme skeleton'ı içeriyor
- Her tablo/liste boş durum içeriyor (ikon + mesaj + CTA)
- Zorunlu form alanları kırmızı yıldız (*) içeriyor
- Marketplace bağlantı kesme onay dialog'u içeriyor

---

## MOBİL KONTROL LİSTESİ (her sayfa için çalıştır)

```
□ 375px genişlikte test edildi?
□ Tablolar overflow-x-auto wrapper içinde?
□ Modal'lar max-h-[90vh] overflow-y-auto içeriyor?
□ Butonlar minimum h-10 (40px)?
□ Sidebar mobilde Sheet drawer ile gizli?
□ Metin taşması yok (truncate kullanıldı)?
□ Grid'ler mobile-first sıralamada?
```

---

## HER SAYFANIN İÇERMESİ GEREKENLER

- [ ] Yükleme durumu (skeleton, spinner değil)
- [ ] Boş durum (ikon + mesaj + CTA)
- [ ] Hata durumu (mesaj + tekrar dene butonu)
- [ ] 375px'de test edilmiş mobile layout

**Dashboard sayfası şunları göstermeli:**
- Net kâr (bu ay, toplam)
- Gelir - maliyet dağılımı
- En iyi performans gösteren ürünler
- Risk uyarıları (varsa)

---

## TESLİMAT KRİTERLERİ

- [ ] Tüm sayfalar konsol hatasız render ediyor
- [ ] Tüm sayfalar mobilde (375px) çalışıyor
- [ ] Auth akışı çalışıyor (giriş → dashboard → çıkış)
- [ ] Dashboard API'den gerçek veri gösteriyor
- [ ] Herhangi bir bileşende Supabase/service import'u yok
- [ ] Tüm silme işlemleri onay dialog'u içeriyor
- [ ] Tüm form'lar yükleme sırasında disabled
- [ ] TypeScript sıfır hatayla derleniyor

---

## SELF-REVIEW

```
□ Herhangi bir bileşen services/ veya repositories/'den import ediyor mu?  (HAYIR olmalı)
□ Herhangi bir bileşen lib/supabase/'dan import ediyor mu?  (HAYIR olmalı)
□ Her sayfanın yükleme/boş/hata durumu var mı?
□ Her sayfa 375px'de test edildi mi?
□ Kullanıcıya gösterilen tüm stringler Türkçe mi?
□ Tüm sayılar Türkçe locale ile formatlanmış mı?
□ Kâr yeşil, zarar kırmızı gösteriliyor mu?
□ Tüm silme işlemlerinde onay dialog'u var mı?
□ v1 mobil hata düzeltmeleri uygulandı mı?
```

---

## FAZ7 RAPOR FORMATI

```
FAZ7 TAMAMLANDI
Teslim edilenler: [liste]
Mobil test sonuçları: [her sayfa 375px test]
v1 hata düzeltmeleri: [uygulananlar]
Sonraki: FAZ8 — Ödeme Entegrasyonu (Hilmi onayı gerekli)
```
