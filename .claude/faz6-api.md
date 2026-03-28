# FAZ6 — API Route Katmanı
> Ön koşul: FAZ5 tamamlandı (tüm alt katmanlar hazır)
> Hedef: Tüm Next.js API route'ları — ince, doğrulanmış, gateway üzerinden yönlendirilmiş
> Bu fazda context dosyası okuma — tüm iş mantığı zaten servislerde
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: API route katmanını kur
LAYERS: app/api/
FILES TO CREATE:
  - app/api/analyses/route.ts               ← GET (liste), POST (oluştur)
  - app/api/analyses/[id]/route.ts          ← GET, PATCH, DELETE
  - app/api/analyses/count/route.ts         ← GET (plan limit kontrolü)
  - app/api/user/profile/route.ts           ← GET, PATCH
  - app/api/marketplace/trendyol/route.ts   ← GET (bağlantı), POST (bağlan), DELETE (kes)
  - app/api/marketplace/hepsiburada/route.ts
  - app/api/marketplace/cron/route.ts       ← GET (sync cron — CRON_SECRET ile güvenli)
  - app/api/notifications/route.ts          ← GET, POST
  - app/api/notifications/[id]/read/route.ts ← PATCH
  - app/api/notifications/read-all/route.ts  ← PATCH
  - app/api/support/tickets/route.ts        ← GET, POST
  - app/api/support/tickets/[id]/route.ts   ← GET, PATCH
  - app/api/blog/comments/route.ts          ← GET, POST
  - app/api/pdf/analysis/[id]/route.ts      ← GET (PDF indir)
  - app/api/admin/stats/route.ts
  - app/api/admin/users/route.ts            ← GET, PATCH
  - app/api/admin/payments/route.ts         ← GET
  - app/api/admin/activate-payment/route.ts ← POST
  - app/api/admin/support/tickets/[id]/route.ts ← PATCH, DELETE
  - app/api/admin/blog-comments/route.ts    ← GET, PATCH
  - app/api/cron/check-expiry/route.ts      ← GET (pro bitiş kontrolü)
  - app/api/cron/weekly-report/route.ts     ← GET (haftalık rapor)
  - app/api/email/test/route.ts             ← GET (email testi)
FILES NOT TOUCHED: 🔒 paytr route'ları, 🔒 verify-payment, 🔒 auth/callback
APPROACH: Her route = rate limit → auth → validate → gateway → respond
RISK: Cron route'lar CRON_SECRET header ile doğrulanmalı
→ Awaiting approval.
```

---

## ROUTE DESENİ (her route bunu izler)

```typescript
export async function POST(request: Request) {
  try {
    // 1. Rate limit
    const ip = getIp(request)
    const { success } = await apiRateLimit.limit(ip)
    if (!success) {
      return Response.json(
        { error: 'Çok fazla istek. Lütfen bekleyin.' },
        { status: 429 }
      )
    }

    // 2. Kimlik doğrulama
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json(
        { error: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      )
    }

    // 3. Input doğrulama
    const body = await request.json()
    const result = MySchema.safeParse(body)
    if (!result.success) {
      return Response.json(
        { error: 'Geçersiz veri.', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // 4. Gateway'i çağır
    const data = await gateway.handle(
      'serviceName',
      'methodName',
      result.data,
      user.id
    )

    // 5. Yanıt ver
    return Response.json({ success: true, data })

  } catch (error) {
    if (error instanceof UserError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    console.error('[api/analyses POST]', error)
    return Response.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
```

---

## ROUTE ÖZEL KURALLARI

### Admin Route'lar
Admin rolünü ayrıca doğrula:
```typescript
const profile = await userRepo.findById(user.id)
if (profile?.plan !== 'admin') {
  return Response.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
}
```

### Cron Route'lar
CRON_SECRET header'ını doğrula:
```typescript
const authHeader = request.headers.get('Authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Yetkisiz.' }, { status: 401 })
}
```

### Blog Yorum Route'u (v1'de rate limiting yoktu)
`commentRateLimit` kullan (3/dk):
```typescript
const { success } = await commentRateLimit.limit(ip)
```

### Marketplace Sync Route'lar (v1'de rate limiting yoktu)
`syncRateLimit` kullan (1 istek/5dk/kullanıcı):
```typescript
const { success } = await syncRateLimit.limit(`sync:${user.id}`)
```

### PDF Route (v1'de server-side limit yoktu)
Sunucu taraflı PDF limit kontrolü uygula:
```typescript
const monthlyCount = await pdfLogic.getMonthlyDownloadCount(user.id)
const limit = PLAN_LIMITS[profile.plan].pdfReportMonthly
if (monthlyCount >= limit) {
  return Response.json({ error: 'Aylık PDF limitinize ulaştınız.' }, { status: 403 })
}
```

---

## KURALLAR

- Route'lar SIFIR iş mantığı içerir
- Route'lar Zod ile validate eder, gateway'e geçmeden
- Route'lar asla `services/` veya `repositories/`'den import etmez
- Admin route'lar sadece kimlik doğrulamasını değil, admin rolünü de kontrol eder
- Cron route'lar `Authorization: Bearer ${CRON_SECRET}` header'ını kontrol eder
- Client'a döndürülen tüm hata mesajları Türkçe
- Tutarlı yanıt formatı: `{ success: boolean, data?: ..., error?: string }`

---

## TESLİMAT KRİTERLERİ

- [ ] Tüm route'lar doğru yanıt veriyor (curl/Postman ile test)
- [ ] Kimliksiz istekler 401 alıyor
- [ ] Geçersiz input Türkçe hata mesajıyla 400 alıyor
- [ ] Rate limiting eşiği aşıldıktan sonra 429 döndürüyor
- [ ] Admin route'lar admin olmayan kullanıcıları reddediyor
- [ ] Blog yorum POST rate-limit ediyor
- [ ] Marketplace sync rate-limit ediyor
- [ ] PDF route aylık limiti uygulıyor
- [ ] Cron route'lar CRON_SECRET doğrulıyor
- [ ] TypeScript sıfır hatayla derleniyor

---

## SELF-REVIEW

```
□ Herhangi bir route iş mantığı içeriyor mu?  (HAYIR olmalı)
□ Herhangi bir route services/ veya repositories/'den import ediyor mu?  (HAYIR olmalı)
□ Tüm route'lar rate limiting arkasında mı?
□ Tüm route'lar kimlik doğrulama arkasında mı (public olanlar hariç)?
□ Hata mesajları Türkçe mi?
□ Cron route'lar güvenli mi (CRON_SECRET)?
□ Blog yorumları rate-limited mi?
□ PDF server-side limit var mı?
□ Yanıt formatı tutarlı mı?
```

---

## FAZ6 RAPOR FORMATI

```
FAZ6 TAMAMLANDI
Teslim edilenler: [liste]
Test sonuçları: [her kritik route test]
v1 hata düzeltmeleri: [uygulananlar]
Sonraki: FAZ7 — UI Katmanı
```
