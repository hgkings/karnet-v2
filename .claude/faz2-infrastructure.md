# FAZ2 — Altyapı Katmanı
> Ön koşul: FAZ1 tamamlandı, `npm run dev` çalışıyor
> Hedef: Supabase bağlantısı, rate limiting, email, middleware
> Bu fazda context dosyası okuma — henüz değil
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: Altyapı katmanını kur
LAYERS: lib/supabase/, lib/security/, lib/email/, middleware.ts
FILES TO CREATE:
  - lib/supabase/client.ts        ← browser client (anon key)
  - lib/supabase/server.ts        ← server client (cookie tabanlı)
  - lib/supabase/admin.ts         ← 🔒 admin client (service role)
  - lib/supabase/middleware.ts    ← session yenileme helper
  - lib/security/rate-limit.ts   ← Upstash Redis rate limiter
  - lib/security/audit.ts        ← aksiyon loglama
  - lib/email/smtp.ts            ← Brevo SMTP bağlantısı
  - lib/email/send.ts            ← sendEmail() fonksiyonu
  - middleware.ts                 ← Next.js middleware (auth koruması)
FILES NOT TOUCHED: app/, services/, repositories/
RISK: Next.js 15 App Router'da Supabase cookie yönetimi — @supabase/ssr paketi kullan
→ Awaiting approval.
```

---

## UYGULAMA NOTLARI

### Supabase Client Deseni
İki client gerekli:
1. `lib/supabase/client.ts` — browser, anon key, RLS'e saygı duyar
2. `lib/supabase/server.ts` — server components + API route'lar, cookie'leri otomatik yönetir
3. `lib/supabase/admin.ts` — 🔒 service role, RLS'yi bypass eder — SADECE repositories/ kullanır

App Router'da cookie tabanlı auth için `@supabase/ssr` paketi kullan.

### Rate Limiting (Upstash)
```
authRateLimit:    5 istek/dk   (login, register, şifre sıfırlama)
apiRateLimit:     60 istek/dk  (genel API route'ları)
emailRateLimit:   3 istek/dk   (email gönderimi)
syncRateLimit:    1 istek/5dk  (marketplace sync — her kullanıcı için)
commentRateLimit: 3 istek/dk   (blog yorumları — v1'de eksikti)
Desen: FAIL-OPEN — Redis erişilemezse istek geçer
```

### Brevo SMTP
```
Host: smtp-relay.brevo.com
Port: 587 (TLS)
User: BREVO_SMTP_USER (env'den)
Pass: BREVO_SMTP_KEY (env'den)
From: karnet.destek@gmail.com (punycode sorunu workaround)
From Name: Kârnet
```

### Middleware (middleware.ts) 🔒
- `/api/paytr/*` route'larını atla — PayTR kimliksiz erişim gerektirir
- Tüm diğer korumalı route'larda session yenile
- Şu route'lar public (auth gerektirmez):
  `/`, `/auth`, `/pricing`, `/demo`, `/blog`, `/hakkimizda`,
  `/iletisim`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi`,
  `/iade-politikasi`, `/kullanim-sartlari`, `/support`, `/hata`
- Session yoksa `/auth?next={pathname}` adresine yönlendir

---

## TESLİMAT KRİTERLERİ

- [ ] Supabase browser client çalışıyor (test: kullanıcı oturumu getir)
- [ ] Supabase server client çalışıyor (test: API route'dan getir)
- [ ] Rate limiter çalışıyor (test: limiti aş, 429 al)
- [ ] Email gönderimi çalışıyor (test: Hilmi'nin emailine gönder)
- [ ] Middleware dashboard route'larını koruyor

---

## SELF-REVIEW

```
□ app/ içinde direkt Supabase import'u yok mu?
□ Service role key asla client'a gönderilmiyor mu?
□ Rate limiter fail-open (fail-closed değil) mi?
□ Middleware doğru path'lerde çalışıyor mu?
□ Email credentials env'den mi geliyor (hardcoded değil)?
□ lib/supabase/admin.ts sadece server-side importa izin veriyor mu?
```

---

## FAZ2 RAPOR FORMATI

```
FAZ2 TAMAMLANDI
Teslim edilenler: [liste]
Test sonuçları: [her test sonucu]
Sonraki: FAZ3 — Gateway Katmanı
```
