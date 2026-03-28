# PIPELINE.md — Kârnet V2 Görev Yönetimi
> Tüm değişiklikler bu dosyadan geçer.
> Claude Code her session başında bu dosyayı okur.
> Son güncelleme: 2026-03-28

---

## KULLANIM

**Hilmi (görev eklerken):**
```
Durum seç: INBOX
Format: - [ ] #XXX | TÜR | Kısa açıklama
Türler: BUG / FEATURE / REFACTOR / HOTFIX / SETUP
```

**Claude Code (session başında):**
```
1. INBOX'ı oku — en öncelikli görevi seç
2. Routing öner (hangi katmanlar, hangi dosyalar)
3. Hilmi onayını bekle
4. Görevi IN PROGRESS'e taşı
5. Uygula → DONE'a taşı (özet ile)
```

---

## ROUTING KURALLARI

| Görev Türü | Hedef Katman | Dosyalar |
|------------|-------------|----------|
| UI görsel hata | Katman 1 | `app/`, `components/` |
| UI logic hatası | Katman 1 + API check | `app/`, `lib/api/` |
| Form validasyonu | Katman 2 | `lib/validators/schemas/` |
| Gateway sorunu | Katman 3-5 | `lib/gateway/` |
| İş mantığı hatası | Katman 6 | `services/` |
| Yeni iş mantığı | Katman 6 | `services/` |
| DB / sorgu sorunu | Katman 8 | `repositories/` |
| Yeni API endpoint | Katman 6 + app/api/ | `services/`, `app/api/` |
| Auth / middleware | middleware | `middleware.ts` (Hilmi'ye sor) |
| Güvenlik / rate limit | lib/security/ | `lib/security/` |
| Email şablonu | lib/email/ | `lib/email/templates/` |
| Yeni Zod şeması | Katman 2 | `lib/validators/` |
| Ödeme 🔒 | FAZ8 | **DUR — Hilmi'ye söyle** |

---

## ROUTING ÖNERI FORMATI

Her görev öncesi Claude Code şunu çıktılar:

```
GÖREV #XXX — [açıklama]
TÜR: [BUG / FEATURE / REFACTOR]

ROUTING ÖNERİSİ:
  Etkilenen katmanlar : [örn. Katman 6 + Katman 8]
  Değiştirilecekler   : [explicit liste]
  Oluşturulacaklar    : [explicit liste]
  Okunacaklar         : [referans dosyalar]
  Dokunulmayacaklar   : [yakın ama dokunulmayacak dosyalar]

YAKLAŞIM:
  [2-3 cümle plan]

RİSK:
  [Edge case, yan etki, belirsizlik]

Onay için "go" yazın.
```

---

## INBOX
> Yeni görevler buraya. En öncelikli en üstte.

_(Tum fazlar tamamlandi. DNS gecisi icin staging test bekleniyor.)_

---

## IN PROGRESS
> Şu an üzerinde çalışılan görevler.



---

## BLOCKED
> İlerleyemeyen görevler — sebebi belirtilmiş.



---

## DONE
> Tamamlanan görevler. Her çeyrekte arşivle.

- [x] #000 | SETUP | Tüm .claude/ MD dosyaları yazıldı (2026-03-28)
- [x] #001 | SETUP | FAZ1 — Proje iskeleti kuruldu (2026-03-28)
- [x] #002 | SETUP | FAZ2 — Altyapı katmanı: Supabase client/server, rate-limit, email, middleware (2026-03-28)
- [x] #003 | SETUP | FAZ3 — Gateway katmanı: GatewayAdapter, GlobalService, ServiceBridge, types (2026-03-28)
- [x] #004 | SETUP | FAZ4 — Servis katmanı: 9 LogicService + registry (2026-03-28)
- [x] #005 | SETUP | FAZ5 — Repository katmanı: DBHelper, BaseRepository, 10 repository + admin client (2026-03-28)
- [x] #006 | SETUP | FAZ6 — API katmanı: 23 route, 6 Zod şema, 5 lib/api helper (2026-03-28)
- [x] #007 | REFACTOR | Service-Repository DI bağlantısı: 43 TODO(FAZ5) kaldırıldı, 8 servis + registry refactor (2026-03-28)
- [x] #008 | SETUP | FAZ7a — Layout + Auth: navbar, sidebar, footer, dashboard-layout, 4 auth sayfa, callback, shared components (2026-03-28)
- [x] #009 | SETUP | FAZ7b — Dashboard + Analiz: dashboard, analysis list/detail, products, marketplace, settings, billing (2026-03-28)
- [x] #010 | SETUP | FAZ7c — Marketing + Admin + Destek: landing, pricing, blog, hakkimizda, iletisim, support, admin (6 sayfa) (2026-03-28)
- [x] #011 | SETUP | FAZ8 — PayTR odeme: create-payment, callback (HMAC), verify-payment, payment.logic, billing UI (2026-03-28)

---

## SELF-REVIEW KONTROL LİSTESİ
> Claude Code her tamamlanan görev sonrası çalıştırır.

```
□ Sadece onaylanan dosyalara dokunuldu mu?
□ Yeni dependency eklendi mi?              (eklendiyse Hilmi onayladı mı?)
□ DB şeması değiştirildi mi?               (değiştirildiyse Hilmi onayladı mı?)
□ Hardcoded env variable var mı?           → olmamalı
□ Hata yutuldu mu?                         → yutulmamalı
□ app/ içinde direkt Supabase var mı?      → olmamalı
□ TODO veya placeholder kaldı mı?          → kalmamalı
□ tsc --noEmit sıfır hata veriyor mu?
□ Türkçe locale uygulandı mı?
□ PIPELINE.md güncellendi mi (görev DONE'a taşındı)?
```

---

## GÖREV GEÇMİŞİ
> Her tamamlanan görev için tek satır özet.

| # | Tür | Özet | Tarih |
|---|-----|------|-------|
| 000 | SETUP | Proje MD dosyaları oluşturuldu | 2026-03-28 |
| 001 | SETUP | FAZ1 — Proje iskeleti (Next.js 15, Tailwind v4, shadcn/ui, klasör yapısı) | 2026-03-28 |
| 002 | SETUP | FAZ2 — Altyapı (Supabase client/server, rate-limit, email, middleware) | 2026-03-28 |
| 003 | SETUP | FAZ3 — Gateway (GatewayAdapter, GlobalService, ServiceBridge, types) | 2026-03-28 |
| 004 | SETUP | FAZ4 — Servisler (analysis, risk, commission, user, marketplace, notification, support, pdf, blog + registry) | 2026-03-28 |
| 005 | SETUP | FAZ5 — Repository (DBHelper AES-256-GCM, BaseRepository, 10 ozel repository, admin client) | 2026-03-28 |
| 006 | SETUP | FAZ6 — API Route'lar (23 route, 6 Zod sema, lib/api helpers) | 2026-03-28 |
| 007 | REFACTOR | Service-Repository DI (43 TODO kaldirma, 8 servis + registry refactor) | 2026-03-28 |
| 008 | SETUP | FAZ7a — Layout + Auth (navbar, sidebar, 4 auth sayfa, callback, shared components) | 2026-03-28 |
| 009 | SETUP | FAZ7b — Dashboard + Analiz (dashboard, analysis, products, marketplace, settings, billing + components) | 2026-03-28 |
| 010 | SETUP | FAZ7c — Marketing + Admin + Destek (landing, pricing, blog, hakkimizda, iletisim, support, admin 6 sayfa) | 2026-03-28 |
| 011 | SETUP | FAZ8 — PayTR odeme (create-payment, callback HMAC, verify, logic, billing UI) | 2026-03-28 |
