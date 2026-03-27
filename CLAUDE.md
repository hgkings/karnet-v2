# CLAUDE.md — Kârnet V2 Sistem Mimarisi ve Değişmez Kurallar
> v4.0 · 9 Katmanlı · Production-Grade · Security-First
> Bu dosya Kârnet'in anayasasıdır. Hiçbir kural hiçbir gerekçeyle çiğnenemez.
> Yazar: Süleyman Hilmi İşbilir
> Son güncelleme: 2026-03-28

---

## ⚠️ DEĞİŞMEZ TEMEL KURAL

```
UI KATMANINDA HİÇBİR ZAMAN:
- Veritabanı kodu olmaz
- Veritabanı dosya adı geçmez
- Veritabanı bağlantısı olmaz
- SQL sorgusu olmaz
- Tablo adı olmaz
- Repository importu olmaz
- Service importu olmaz
- DB adapter importu olmaz

BU KURAL DÜNYA YANSA DEĞİŞMEZ.
```

---

## 9 KATMANLI MİMARİ AKIŞ

```
┌─────────────────────────────────────────────────────┐
│  KATMAN 1 — SUNUM KATMANI                           │
│  Next.js App Router Pages + Components              │
│  app/ + components/                                 │
│                                                     │
│  ✅ Sadece UI kodu (React, Tailwind, shadcn/ui)     │
│  ✅ Sadece fetch('/api/...') çağrısı                │
│  ✅ Sadece lib/api/ helper'ları                     │
│  ✅ types/ tip tanımları                            │
│  ✅ config/ sabit değerleri                         │
│  ❌ DB, SQL, Service, Repository — KESİNLİKLE YASAK │
│  ❌ DB adapter importu — KESİNLİKLE YASAK           │
└─────────────────────┬───────────────────────────────┘
                      ↓ fetch('/api/...')
┌─────────────────────────────────────────────────────┐
│  KATMAN 2 — ŞEMA KATMANI                            │
│  Zod Schema Collections                             │
│  lib/validators/schemas/                            │
│                                                     │
│  • analysis.schema.ts                               │
│  • user.schema.ts                                   │
│  • product.schema.ts                                │
│  • payment.schema.ts                                │
│  • support.schema.ts                                │
│  • marketplace.schema.ts                            │
│                                                     │
│  Tüm veri tipleri ve validasyon burada.             │
│  API'ye girmeden her veri burada doğrulanır.        │
└─────────────────────┬───────────────────────────────┘
                      ↓ schema.safeParse(data)
┌─────────────────────────────────────────────────────┐
│  KATMAN 3 — PROXY KATMANI (GATEWAY)                 │
│  GatewayAdapter                                     │
│  lib/gateway/gateway.adapter.ts                     │
│                                                     │
│  • Tüm istekler buradan geçer                       │
│  • DB'ye HİÇBİR ZAMAN doğrudan gitmez              │
│  • Trace ID üretir (her istek izlenir)              │
│  • Rate limit kontrolü yapar                        │
│  • Auth token doğrular                              │
│  • Hataları merkezi yakalar ve loglar               │
│  • GlobalService'i çağırır                          │
└─────────────────────┬───────────────────────────────┘
                      ↓ gateway.handle(traceId, request)
┌─────────────────────────────────────────────────────┐
│  KATMAN 4 — GLOBAL SERVİS KATMANI                   │
│  GlobalService                                      │
│  lib/gateway/global.service.ts                      │
│                                                     │
│  • İstekleri doğru LogicService'e yönlendirir       │
│  • Servisler arası koordinasyonu sağlar             │
│  • Trace ID'yi her katmana taşır                    │
│  • GlobalService.callService() ana metot            │
└─────────────────────┬───────────────────────────────┘
                      ↓ globalService.callService(name, payload)
┌─────────────────────────────────────────────────────┐
│  KATMAN 5 — SERVİS KÖPRÜSÜ                          │
│  ServiceBridge                                      │
│  lib/gateway/service.bridge.ts                      │
│                                                     │
│  • Her LogicService'i kayıt altında tutar           │
│  • İsme göre doğru servisi çağırır                  │
│  • Servisler arası bağımlılığı keser                │
│  • Hata durumunda fallback sağlar                   │
└─────────────────────┬───────────────────────────────┘
                      ↓ bridge.call(serviceName, method, args)
┌─────────────────────────────────────────────────────┐
│  KATMAN 6 — MANTIK SERVİSİ                          │
│  LogicService (İş Mantığı + Trace)                  │
│  services/                                          │
│                                                     │
│  • analysis.logic.ts     → Kâr hesaplama, risk      │
│  • user.logic.ts         → Profil, tercihler        │
│  • payment.logic.ts      → Ödeme akışı 🔒           │
│  • notification.logic.ts → Email bildirimleri       │
│  • marketplace.logic.ts  → Trendyol/Hepsiburada     │
│  • risk.logic.ts         → Risk puanı hesaplama     │
│  • commission.logic.ts   → Komisyon yönetimi        │
│  • support.logic.ts      → Destek talepleri         │
│  • pdf.logic.ts          → PDF rapor üretimi        │
│  • blog.logic.ts         → Blog ve yorumlar         │
│                                                     │
│  Her işlem Trace ID ile loglanır.                   │
│  İş mantığının döndüğü TEK yer.                     │
│  DBHelper'ı çağırır, Supabase'i doğrudan görmez.   │
└─────────────────────┬───────────────────────────────┘
                      ↓ logic.process(traceId, data)
┌─────────────────────────────────────────────────────┐
│  KATMAN 7 — VERİTABANI YARDIMCISI                   │
│  DBHelper (AES-256-GCM)                             │
│  lib/db/db.helper.ts                                │
│                                                     │
│  • Hassas verileri şifreler (AES-256-GCM)           │
│  • Marketplace API key'lerini şifreler              │
│  • Şifreli veriyi BaseRepository'ye verir           │
│  • Şifreli veriyi çözer                             │
│  • Audit log kaydı oluşturur                        │
│  • Şifreleme formatı: {iv, ciphertext, tag, version}│
└─────────────────────┬───────────────────────────────┘
                      ↓ dbHelper.encrypt(data) → repo.save()
┌─────────────────────────────────────────────────────┐
│  KATMAN 8 — REPOSITORY KATMANI                      │
│  BaseRepository + Özel Repository'ler               │
│  repositories/                                      │
│                                                     │
│  • base.repository.ts         → Generic CRUD        │
│  • analysis.repository.ts     → Analiz sorguları    │
│  • user.repository.ts         → Kullanıcı sorguları │
│  • product.repository.ts      → Ürün sorguları      │
│  • payment.repository.ts      → Ödeme kayıtları 🔒  │
│  • support.repository.ts      → Destek talepleri    │
│  • notification.repository.ts → Bildirimler         │
│  • marketplace.repository.ts  → Bağlantılar         │
│  • commission.repository.ts   → Komisyon oranları   │
│  • blog.repository.ts         → Blog yorumları      │
│                                                     │
│  Veri erişiminin TEK noktası.                       │
│  Tüm sorgular parametrize — SQL injection imkansız. │
│  JSONB alanlar desteklenir.                         │
│  İş mantığı YOKTUR.                                 │
└─────────────────────┬───────────────────────────────┘
                      ↓ repository.query(params)
┌─────────────────────────────────────────────────────┐
│  KATMAN 9 — VERİTABANI                              │
│  Supabase PostgreSQL                                │
│                                                     │
│  • RLS (Row Level Security) her tabloda zorunlu     │
│  • audit_logs tablosu (tüm işlemler kayıt altında)  │
│  • Supabase Migrations (sürüm kontrolü)             │
│  • Automated Backups (günlük)                       │
│  • Supabase Auth (JWT tabanlı)                      │
│  • Supabase Storage (dosya yükleme)                 │
└─────────────────────────────────────────────────────┘
```

---

## KATMAN ↔ ORİJİNAL MİMARİ EŞLEŞMESİ

| # | Orijinal | Kârnet Karşılığı | Teknoloji |
|---|----------|-----------------|-----------|
| 1 | Next.js Custom Pages | Next.js App Router | Aynı |
| 2 | Payload CMS Collections | Zod Schema Collections | Zod (tip güvenli) |
| 3 | CustomDatabaseAdapter (PROXY) | GatewayAdapter (PROXY) | TypeScript |
| 4 | GlobalService.fetchFromPython() | GlobalService.callService() | TypeScript (Python yok) |
| 5 | PythonBridge (gRPC) | ServiceBridge (internal) | TypeScript (gRPC yok) |
| 6 | LogicService (İş + Trace) | LogicService (İş + Trace) | Aynı mantık |
| 7 | DBHelper (AES-GCM) | DBHelper (AES-256-GCM) | Aynı |
| 8 | BaseRepo (JSONB) | BaseRepository (JSONB) | Aynı |
| 9 | PostgreSQL | Supabase PostgreSQL | Aynı |

---

## KATMAN SORUMLULUK TABLOSU

| Katman | Klasör | Yapabilir | Yapamaz |
|--------|--------|-----------|---------|
| 1 — UI | app/, components/ | fetch(), useState, UI render | Supabase, Service, Repository, SQL |
| 2 — Şema | lib/validators/ | Zod şema, tip tanımı | İş mantığı, DB bağlantısı |
| 3 — Gateway | lib/gateway/adapter | Auth, rate limit, trace, route | DB, iş mantığı |
| 4 — Global | lib/gateway/global | Servis yönlendirme, koordinasyon | HTTP, DB |
| 5 — Bridge | lib/gateway/bridge | Servis çözümleme, fallback | HTTP, DB, iş mantığı |
| 6 — Logic | services/ | İş mantığı, hesaplama | HTTP, Supabase direkt |
| 7 — DBHelper | lib/db/ | Şifreleme, audit log | İş mantığı |
| 8 — Repository | repositories/ | Ham CRUD, parametrize sorgu | İş mantığı, HTTP |
| 9 — DB | lib/supabase/ | Bağlantı yönetimi | İş mantığı |

---

## KLASÖR YAPISI

```
karnet-v2/
│
├── app/                              # KATMAN 1 — UI
│   ├── (auth)/
│   │   └── auth/
│   │       ├── page.tsx
│   │       ├── forgot-password/page.tsx
│   │       ├── reset-password/page.tsx
│   │       ├── verify-email/page.tsx
│   │       └── callback/route.ts    # 🔒 DOKUNULAMAZ
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── analysis/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── products/page.tsx
│   │   ├── marketplace/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── support/page.tsx
│   │   └── billing/page.tsx
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── hakkimizda/page.tsx
│   │   └── iletisim/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── support/page.tsx
│   │   └── comments/page.tsx
│   └── api/
│       ├── analyses/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── count/route.ts
│       ├── user/
│       │   └── profile/route.ts
│       ├── marketplace/
│       │   ├── trendyol/route.ts
│       │   ├── hepsiburada/route.ts
│       │   └── cron/route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   ├── [id]/read/route.ts
│       │   └── read-all/route.ts
│       ├── support/
│       │   └── tickets/
│       │       ├── route.ts
│       │       └── [id]/route.ts
│       ├── blog/
│       │   └── comments/route.ts
│       ├── pdf/
│       │   └── analysis/[id]/route.ts
│       ├── admin/
│       │   ├── stats/route.ts
│       │   ├── users/route.ts
│       │   ├── payments/route.ts
│       │   ├── activate-payment/route.ts
│       │   ├── support/tickets/[id]/route.ts
│       │   └── blog-comments/route.ts
│       ├── cron/
│       │   ├── check-expiry/route.ts
│       │   └── weekly-report/route.ts
│       ├── email/
│       │   └── test/route.ts
│       ├── paytr/                    # 🔒 DOKUNULAMAZ
│       │   ├── callback/route.ts
│       │   └── create-payment/route.ts
│       └── verify-payment/route.ts  # 🔒 DOKUNULAMAZ
│
├── lib/
│   ├── validators/                   # KATMAN 2 — ŞEMA
│   │   └── schemas/
│   │       ├── analysis.schema.ts
│   │       ├── user.schema.ts
│   │       ├── product.schema.ts
│   │       ├── payment.schema.ts
│   │       ├── support.schema.ts
│   │       └── marketplace.schema.ts
│   │
│   ├── gateway/                      # KATMAN 3-5
│   │   ├── gateway.adapter.ts
│   │   ├── global.service.ts
│   │   ├── service.bridge.ts
│   │   └── types.ts
│   │
│   ├── db/                           # KATMAN 7
│   │   ├── db.helper.ts
│   │   └── types.ts
│   │
│   ├── supabase/                     # KATMAN 9 bağlantısı
│   │   ├── client.ts                 # Browser client (anon key)
│   │   ├── server.ts                 # SSR client (cookies)
│   │   ├── admin.ts                  # 🔒 Admin client (service role)
│   │   └── middleware.ts             # Session refresh helper
│   │
│   ├── security/
│   │   ├── rate-limit.ts             # Upstash Redis
│   │   └── audit.ts                  # Audit logger
│   │
│   ├── email/
│   │   ├── smtp.ts                   # Brevo bağlantı
│   │   ├── send.ts                   # sendEmail() fonksiyonu
│   │   └── templates/
│   │       ├── base.ts               # Ortak HTML şablon
│   │       ├── welcome.ts
│   │       ├── email-verify.ts
│   │       ├── password-reset.ts
│   │       ├── pro-activated.ts
│   │       ├── pro-expiry-warning.ts
│   │       ├── pro-expired.ts
│   │       ├── weekly-report.ts
│   │       ├── risk-alert.ts
│   │       ├── margin-alert.ts
│   │       └── ticket-reply.ts       # v1'de eksikti — v2'de eklendi
│   │
│   └── api/                          # UI fetch helper'ları (KATMAN 1 kullanır)
│       ├── client.ts                 # Base fetch wrapper
│       ├── analyses.ts
│       ├── notifications.ts
│       ├── marketplace.ts
│       └── support.ts
│
├── services/                         # KATMAN 6 — MANTIK
│   ├── analysis.logic.ts
│   ├── user.logic.ts
│   ├── payment.logic.ts              # 🔒
│   ├── notification.logic.ts
│   ├── marketplace.logic.ts
│   ├── risk.logic.ts
│   ├── commission.logic.ts
│   ├── support.logic.ts
│   ├── pdf.logic.ts
│   └── blog.logic.ts
│
├── repositories/                     # KATMAN 8 — VERİ ERİŞİM
│   ├── base.repository.ts
│   ├── analysis.repository.ts
│   ├── user.repository.ts
│   ├── product.repository.ts
│   ├── payment.repository.ts         # 🔒
│   ├── support.repository.ts
│   ├── notification.repository.ts
│   ├── marketplace.repository.ts
│   ├── commission.repository.ts
│   └── blog.repository.ts
│
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── dashboard-layout.tsx
│   ├── features/
│   │   ├── analysis/
│   │   ├── dashboard/
│   │   ├── marketplace/
│   │   └── admin/
│   └── shared/
│       ├── kpi-card.tsx
│       ├── pro-status-card.tsx
│       ├── pro-locked-section.tsx
│       └── risk-badge.tsx
│
├── types/
│   ├── database.types.ts             # Supabase'den generate
│   └── index.ts
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       └── send-notification-email/
│
└── .claude/
    ├── CLAUDE.md                     # Bu dosya
    ├── MASTER.md                     # Genel kurallar + faz listesi
    ├── PIPELINE.md                   # Görev yönetimi
    ├── PROMPT-RULES.md               # Davranış kuralları
    ├── ENV-TEMPLATE.md               # Env değişkenleri (FAZ1)
    ├── COMPONENT-GUIDE.md            # UI kuralları (FAZ7)
    ├── KNOWLEDGE-BASE.md             # İş mantığı referansı (FAZ4)
    ├── DATABASE-SCHEMA.md            # DB yapısı (FAZ5)
    ├── ERROR-REPORT.md               # Düzeltilecekler (FAZ1 referans)
    ├── faz1-skeleton.md
    ├── faz2-infrastructure.md
    ├── faz3-gateway.md
    ├── faz4-services.md
    ├── faz5-repository.md
    ├── faz6-api.md
    ├── faz7-ui.md
    └── faz8-payment.md
```

---

## YENİ ÖZELLİK EKLEME KURALI

### ADIM 0 — Başlamadan Önce (PIPELINE)
Yeni özellik doğrudan kodla başlamaz.

```
1. PIPELINE.md → INBOX'a ekle:
   - [ ] #XXX | FEATURE | [özellik adı]

2. Claude Code tek bir SPEC sunar — tüm 7 adımı kapsayan

3. Hilmi onaylar → Claude Code tüm katmanları sırayla uygular
```

SPEC formatı (7 adımın tamamı için):

```
TASK: [özellik adı]
TYPE: FEATURE

ROUTING:
  Adım 1 → KATMAN 2   | lib/validators/schemas/[x].schema.ts
  Adım 2 → KATMAN 3-5 | lib/gateway/
  Adım 3 → KATMAN 6   | services/[x].logic.ts
  Adım 4 → KATMAN 8   | repositories/[x].repository.ts
  Adım 5 → KATMAN 1   | app/api/v1/[x]/route.ts
  Adım 6 → KATMAN 1   | lib/api/[x].ts
  Adım 7 → KATMAN 1   | app/.../[x]/page.tsx + components/

APPROACH: [2-3 cümle]
RISK: [edge case, yan etki]
→ Awaiting approval.
```

---

## KORUNAN DOSYALAR

Bu dosyalara **izin olmadan kesinlikle dokunulamaz:**

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

Korunan dosyaya ihtiyaç duyulursa:
1. HEMEN DUR
2. Hilmi'ye söyle — hangi satır, neden
3. Onay gel → devam et
4. Onay gelmeden → devam etme

---

## DEĞİŞİKLİK KURALLARI

### 🟢 Serbest (direkt yapılabilir)
UI bileşen değişikliği, stil, metin, yeni marketing sayfası

### 🟡 Önce rapor, sonra yap
Yeni katman dosyası, API endpoint, DB migration, npm paketi, güvenlik değişikliği

### 🔴 İzinsiz asla
Korunan 🔒 dosyalar, RLS silme, auth bypass, admin client UI'da

---

## ÇALIŞMA PROTOKOLÜ (SPEC-FIRST)

Hiçbir görevde direkt koda geçilmez. Her zaman bu sıra:

```
1. SPEC   → Hangi dosyalar, hangi katmanlar, neden — yaz ve bekle
2. ONAY   → Hilmi "go" demeden tek satır kod yazılmaz
3. BUILD  → Sadece onaylanan scope içinde çalış
4. REVIEW → Bitince kendi kodunu eleştir
5. RAPOR  → PIPELINE.md güncelle, görevi DONE'a taşı
```

SPEC formatı:
```
TASK: [ne yapılacak]
LAYERS: [hangi katmanlar etkilenecek]
FILES TO CHANGE: [liste]
FILES TO CREATE: [liste]
FILES NOT TOUCHED: [yakın ama dokunulmayacaklar]
APPROACH: [2-3 cümle]
RISK: [edge case, yan etki, belirsizlik]
→ Awaiting approval.
```

---

## SCOPE KİLİDİ

Görev başladıktan sonra kural:

```
"Sadece listelediğim dosyalara dokunuyorum. Başka hiçbir şeye."
```

Listelenmemiş bir dosyaya dokunmak gerekirse:
```
→ DUR
→ Hilmi'ye söyle: "X dosyasına da dokunmam gerekiyor, onaylıyor musun?"
→ Onay gel → devam et
→ Onay gelmeden → devam etme
```

Korunan (🔒) dosyaya ihtiyaç duyulursa:
```
→ HEMEN DUR
→ Hilmi'ye söyle
→ Onay olmadan kesinlikle devam etme
```

---

## PROMPT ŞABLONU (ZORUNLU)

```
[BAŞLANGIÇ RAPORU]
- Ne yapılacak?
- Hangi katmanlar etkilenecek?
- Hangi dosyalar değişecek?
- Korunan dosya var mı?

[İŞLEM]
...

[BİTİŞ RAPORU]
- Ne yapıldı?
- Katman kuralları ihlal edildi mi?
- Test sonucu?
- Dikkat edilmesi gereken?
```

---

## SESSION BAŞLANGIÇ RİTÜELİ

Her yeni session'da şu sırayla oku:
```
1. CLAUDE.md       → Bu dosya (mimari + kurallar)
2. PIPELINE.md     → Aktif ve bekleyen görevler
3. PROMPT-RULES.md → Davranış kuralları
```

Okuduktan sonra şunu yaz — kod yazmaya başlama:
```
Ready. PIPELINE has [N] tasks in INBOX.
Top priority: #XXX — [description]
Routing proposal:
  Layers : [etkilenen katmanlar]
  Files  : [değişecek/oluşturulacak dosyalar]
Awaiting approval.
```

---

## HATA YÖNETİMİ STANDARDI

```typescript
// ✗ YASAK — hatayı yutmak
try {
  await operation()
} catch (e) {
  console.log(e) // sessizce geçer
}

// ✓ ZORUNLU — hatayı yüzey et
try {
  await operation()
} catch (error) {
  throw new ServiceError('İşlem tamamlanamadı', { cause: error })
}
```

- Kullanıcıya gösterilen tüm hata mesajları **Türkçe**
- Stack trace veya teknik detay kullanıcıya **asla** gösterilmez
- Her catch bloğu ya throw eder ya return eder — ikisi de yoksa yasak

---

## SELF-REVIEW KONTROL LİSTESİ

Her görev bitmeden önce bu listeyi çalıştır:
```
□ Sadece onaylanan dosyalara dokunuldu mu?
□ any tipi kullanıldı mı?                    → kullanılmamalı
□ Hata yakalanıp yutuldu mu?                → yutulmamalı
□ Hardcoded env variable var mı?             → olmamalı
□ app/ içinde Supabase/Service/Repository import var mı? → olmamalı
□ console.log production'a gitti mi?         → gitmemeli
□ tsc --noEmit sıfır hata veriyor mu?
□ Türkçe locale uygulandı mı?
□ PIPELINE.md güncellendi mi?
```

Tüm kutular geçmedikçe görev **DONE sayılmaz**.

---

## TEKNOLOJİ YIĞINI

| Kategori | Teknoloji |
|----------|-----------|
| UI | Next.js 15, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui, Framer Motion |
| Şema | Zod |
| Gateway | TypeScript class (GatewayAdapter) |
| Bridge | TypeScript internal (ServiceBridge) |
| Şifreleme | AES-256-GCM |
| Veritabanı | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (JWT) |
| Rate Limit | Upstash Redis |
| Email | Brevo SMTP + nodemailer |
| Ödeme | PayTR 🔒 |
| Deploy | Vercel |

---

## YASAK TEKNOLOJİLER

```
❌ Pages Router
❌ any tipi TypeScript'te
❌ console.log production'da
❌ MD5 / SHA1 şifreleme
❌ localStorage'da hassas veri
❌ eval() / new Function()
❌ Direkt Supabase çağrısı UI'dan
❌ Service import UI'da
❌ Repository import UI'da
❌ DB tablo adı UI'da
❌ Hardcoded API key veya secret
```

---

*Bu mimari Kârnet'in temelidir.*
*Değişmez. Silinmez. Unutulmaz.*
*Dünya yansa bu kurallar geçerlidir.*
*© 2026 Kârnet — Süleyman Hilmi İşbilir*
