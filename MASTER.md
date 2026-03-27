# MASTER.md — Kârnet V2 Proje Anayasası
> Her session'da ilk okunan dosya bu dosyadır.
> Sadece bu dosyayı oku. Faz dosyalarını faz başlamadan okuma.
> Son güncelleme: 2026-03-28

---

## PROJE BİLGİLERİ

**Proje:** Kârnet — Türk e-ticaret satıcıları için kâr analizi SaaS
**Geliştirici:** Süleyman Hilmi İşbilir (solo)
**Kod aracı:** Claude Code (VS Code eklentisi)
**Deploy:** Vercel (GitHub push → otomatik deploy)
**Domain:** kârnet.com (punycode: xn--krnet-3qa.com)
**Supabase:** Aynı instance (v1 ile ortak, yeni DB açılmaz)

---

## TEKNOLOJİ YIĞINI

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15, App Router |
| Dil | TypeScript 5 (strict: true) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Veritabanı | Supabase (PostgreSQL + Auth + RLS) |
| Validasyon | Zod |
| Ödeme | PayTR (canlı mod) |
| Email | Brevo SMTP + nodemailer |
| Rate Limiting | Upstash Redis |
| Hosting | Vercel |

---

## 9 KATMANLI MİMARİ (ÖZET)

```
Katman 1 → app/                    UI — sadece görüntüler
Katman 2 → lib/validators/         Zod şemaları — validasyon
Katman 3 → lib/gateway/adapter     GatewayAdapter — proxy
Katman 4 → lib/gateway/global      GlobalService — yönlendirme
Katman 5 → lib/gateway/bridge      ServiceBridge — köprü
Katman 6 → services/               LogicService — iş mantığı
Katman 7 → lib/db/                 DBHelper — AES-256-GCM şifreleme
Katman 8 → repositories/           BaseRepository — DB erişimi
Katman 9 → lib/supabase/           Supabase bağlantısı
```

**Veri akışı her zaman yukarıdan aşağıya. Katman atlanamaz. Geri dönemez.**

Tam detay için: `CLAUDE.md`

---

## TEK KIRILMAZ KURAL

```
UI KATMANINDA (app/ ve components/):
- DB kodu olmaz
- DB dosya adı geçmez
- SQL sorgusu olmaz
- Repository importu olmaz
- Service importu olmaz
- Supabase importu olmaz

BU KURAL ASLA ÇİĞNENMEZ.
```

---

## KORUNAN DOSYALAR

```
🔒 app/api/paytr/callback/route.ts
🔒 app/api/paytr/create-payment/route.ts
🔒 app/api/verify-payment/route.ts
🔒 app/auth/callback/route.ts
🔒 middleware.ts
🔒 services/payment.logic.ts
🔒 repositories/payment.repository.ts
🔒 lib/supabase/admin.ts
```

Bu dosyalara **Hilmi onayı olmadan** dokunulamaz.

---

## FAZ DURUMU

| Faz | Dosya | Durum | Hangi Context Okunur |
|-----|-------|-------|---------------------|
| FAZ1 | faz1-skeleton.md | ⏳ Bekliyor | ENV-TEMPLATE.md, ERROR-REPORT.md |
| FAZ2 | faz2-infrastructure.md | ⏳ Bekliyor | — |
| FAZ3 | faz3-gateway.md | ⏳ Bekliyor | — |
| FAZ4 | faz4-services.md | ⏳ Bekliyor | KNOWLEDGE-BASE.md |
| FAZ5 | faz5-repository.md | ⏳ Bekliyor | DATABASE-SCHEMA.md |
| FAZ6 | faz6-api.md | ⏳ Bekliyor | — |
| FAZ7 | faz7-ui.md | ⏳ Bekliyor | COMPONENT-GUIDE.md |
| FAZ8 | faz8-payment.md | 🔒 En Son | — |

**Faz tamamlanınca bu tabloyu güncelle: ⏳ → ✅**

---

## ÇALIŞMA PROTOKOLÜ

```
1. MASTER.md oku (şu an yapıyorsun)
2. PIPELINE.md oku — aktif görevleri gör
3. PROMPT-RULES.md oku — davranış kuralları
4. "Ready. PIPELINE has [N] tasks..." yaz
5. Hilmi onayı bekle
6. Faz başlarsa: ilgili faz dosyasını oku
7. SPEC sun → onay al → build et → rapor ver
```

---

## TOKEN TASARRUFU KURALI

Context dosyaları sadece belirtilen fazda okunur:

```
ENV-TEMPLATE.md     → FAZ1'de okunur, başka zaman HAYIR
ERROR-REPORT.md     → FAZ1'de referans, başka zaman HAYIR
KNOWLEDGE-BASE.md   → FAZ4'te okunur, başka zaman HAYIR
DATABASE-SCHEMA.md  → FAZ5'te okunur, başka zaman HAYIR
COMPONENT-GUIDE.md  → FAZ7'de okunur, başka zaman HAYIR
```

Bu kural gereksiz token harcamasını önler.

---

## ÇALIŞMA SAATLERİ (TOKEN OPTİMİZASYON)

```
🟢 EN VERİMLİ — Off-Peak
   Hafta içi: 22:00 - 16:00 (TR saati)
   Hafta sonu: 7/24

🔴 KAÇIN — Peak (hızlı tüketim)
   Hafta içi: 16:00 - 22:00 (TR saati)
```

---

## KOD YAZIM STANDARTLARI

- TypeScript strict mode — `any` tipi kesinlikle yasak
- Her async fonksiyonda try/catch zorunlu
- Hatalar yutulmaz — throw veya return edilir
- Production'da `console.log` yasak
- Component max 150 satır — büyürse böl
- Hardcoded env variable yasak — her zaman `process.env`
- Yeni npm paketi → Hilmi'ye sor, onay al
- DB şema değişikliği → Hilmi'ye sor, onay al

---

## TÜRKÇE / LOCALE STANDARTLARI

```
Para birimi: 1.234,56 ₺ (Türkçe format)
Tarih: GG.AA.YYYY
KDV: %20 standart, %10 indirimli, %1 gıda
Kullanıcıya gösterilen tüm hata mesajları Türkçe
Türkçe karakter desteği: ş, ğ, ü, ö, ç, İ, ı
```

---

## ÖNEMLİ NOTLAR

- v1 canlıda çalışmaya devam eder — v2 hazır olunca DNS geçişi
- Supabase aynı kalır — yeni DB açılmaz
- PayTR lokal'de test edilemez (webhook gerektirir)
- DNS geçişi yalnızca FAZ8 tamamlandıktan sonra
- Kod v1'den taşınmaz — referans alınarak yeniden yazılır
