# FAZ8 — Ödeme Entegrasyonu 🔒
> Ön koşul: FAZ7 TAMAMEN tamamlandı VE Hilmi açıkça "FAZ8'e başla" dedi
> Hedef: PayTR entegrasyonu — abonelikler, webhook'lar, faturalandırma
> ⚠️ Bu faz lokal'de test edilemez. Önce staging'e deploy et.
> ⚠️ Bu dosyayı başlamadan tamamen oku.
> Son güncelleme: 2026-03-28

---

## BAŞLAMADAN ÖNCE — ZORUNLU KONTROLLER

```
□ FAZ7 tamamlandı mı? (tüm sayfalar çalışıyor)
□ Hilmi açıkça "FAZ8'e başla" dedi mi?
□ Staging ortamı hazır mı? (ayrı Vercel projesi)
□ PayTR credentials Vercel env variable'larında mı?
□ Hilmi aşağıdaki korunan dosya listesini inceledi mi?
```

Herhangi bir cevap hayır → DUR. Hilmi'ye söyle. Devam etme.

---

## BU FAZDAKİ KORUNAN DOSYALAR

Bu dosyalar write-once (bir kez yazılır). Çalışır hale geldikten sonra asla değiştirilmez.

```
🔒 app/api/paytr/callback/route.ts        ← PayTR ödeme sonrası POST gönderir
🔒 app/api/paytr/create-payment/route.ts  ← PayTR iframe token'ı oluşturur
🔒 app/api/verify-payment/route.ts        ← İç ödeme doğrulama
🔒 services/payment.logic.ts             ← Ödeme iş mantığı
🔒 repositories/payment.repository.ts   ← Ödeme DB işlemleri
```

FAZ8 sonrası bu dosyalarda hata bulunursa → Hilmi'ye söyle. Kendiliğinden düzeltme.

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: PayTR ödeme entegrasyonu
LAYERS: app/api/paytr/, services/payment.logic.ts, repositories/payment.repository.ts
FILES TO CREATE:
  - app/api/paytr/create-payment/route.ts  🔒
  - app/api/paytr/callback/route.ts        🔒
  - app/api/verify-payment/route.ts        🔒
  - services/payment.logic.ts              🔒
  - repositories/payment.repository.ts    🔒
  - app/(dashboard)/billing/page.tsx       ← FAZ7 stub'ı gerçeğe çevir
FILES NOT TOUCHED: Başka her şey
APPROACH:
  1. create-payment: PayTR API'ye iframe token oluşturur
  2. UI PayTR iframe'ini gösterir
  3. PayTR ödeme sonrası callback'e POST atar
  4. callback hash'i doğrular, DB'de aboneliği günceller (atomic)
  5. verify-payment: UI tarafından ödeme durumunu kontrol etmek için çağrılır
RISK:
  - PayTR hash doğrulaması tam doğru olmalı
  - Webhook UI redirect'den önce gelebilir — her iki yolu yönet
  - pro_started_at / pro_expires_at doğru ayarlanmalı
  - payments ve profiles atomic güncellenmeli (transaction)
→ Awaiting approval.
```

---

## PAYTR ENTEGRASYON GEREKSİNİMLERİ

### Abonelik Alanları (v1'den DB şeması)
```sql
pro_started_at   TIMESTAMPTZ  ← abonelik başlangıcı
pro_expires_at   TIMESTAMPTZ  ← abonelik bitiş tarihi
is_pro           BOOLEAN       ← pro durumu
plan             TEXT          ← 'free' | 'starter' | 'pro' | 'admin'
plan_type        TEXT          ← 'pro_monthly' | 'pro_yearly' | 'starter_monthly' | 'starter_yearly'
```

### Ödeme Planları (v1 fiyatlandırmasıyla eşleş)
```
Başlangıç Aylık:  399 TL/ay
Başlangıç Yıllık: 3.990 TL/yıl  (≈ 332,5 TL/ay — ~2 ay bedava)
Pro Aylık:        799 TL/ay
Pro Yıllık:       7.990 TL/yıl  (≈ 665,8 TL/ay — ~2 ay bedava)
```

### PayTR Domain Gereksinimleri
- Callback URL: `https://www.xn--krnet-3qa.com/api/paytr/callback`
- www OLMALI — www'suz redirect var, PayTR redirect takip etmez
- Callback herhangi bir zamanda gelebilir (UI'dan önce veya sonra)

### Güvenlik: Hash Doğrulama
```
PayTR callback hash'i:
HMAC-SHA256(
  callback_id + merchant_oid + merchantSalt + status + total_amount,
  merchantKey
) → base64

Callback'te: hash doğrula → SONRA DB güncelle
Hash başarısız → DB güncelleme, hatayı logla
```

### Atomik Güncelleme (v1'de hata vardı — v2'de düzelt)
```
Callback başarılıysa — tek transaction'da:
1. payments.status → 'paid'
2. payments.paid_at → now()
3. payments.provider_order_id → PayTR'ın callback_id'si
4. payments.raw_payload → tüm callback payload'ı
5. profiles.plan → 'starter' veya 'pro'
6. profiles.is_pro → true (sadece pro planlar için)
7. profiles.plan_type → 'pro_monthly' | 'pro_yearly' | 'starter_monthly' | 'starter_yearly'
8. profiles.pro_started_at → now()
9. profiles.pro_expires_at → now() + 30 gün (aylık) veya 365 gün (yıllık)
10. profiles.pro_renewal → false
```

### İdempotency
Callback aynı ödeme için birden fazla kez gelebilir.
İdempotent olmalı — ikinci çağrı duplicate abonelik oluşturmamalı.
`payments.provider_order_id` üzerinde unique constraint kullan.

### Ödeme Doğrulama Akışı
```
UI /payment/success?paymentId=X&token=Y adresine gider
→ 5 saniyede bir GET /api/verify-payment?token=Y (max 120 kere = 10 dakika)
→ Verify endpoint kontrol eder: token kullanıcıya ait mi, süresi geçmemiş mi, payment.status === 'paid' mı
→ Doğrulandıysa UI "Pro Aktif!" gösteriyor
```

### Token Güvenliği
- Token: 96 hex karakter (crypto.randomBytes(48))
- Süre: oluşturmadan 15 dakika sonra
- Tek kullanımlık değil, ama sadece payment.status === 'paid' ise başarı döndür
- Token payment.user_id ile authenticated user eşleşmeli

---

## TEST ORTAMI

```
PAYTR_TEST_MODE=1 (sadece local/staging'de):
  → PayTR'a gerçekte istek atmadan pro planı aktive eder
  → Webhook callback'leri test edilemez lokal'de
  → Staging'de gerçek küçük miktarlı ödemeyle test et

Lokal'de test edilemez:
  → PayTR webhook localhost'a ulaşamaz
  → Bunun için Vercel staging deployment kullan
```

---

## TESLİMAT KRİTERLERİ

- [ ] Ödeme iframe'i doğru yükleniyor
- [ ] Başarılı ödeme `pro_started_at`, `pro_expires_at`, `is_pro` ayarlıyor
- [ ] Başarısız ödeme aboneliği değiştirmiyor
- [ ] Hash doğrulama çalışıyor (sahte callback'leri reddediyor)
- [ ] Duplicate callback'ler yönetiliyor (idempotent)
- [ ] payments ve profiles atomic güncelleniyor (transaction)
- [ ] Abonelik bitişi her dashboard yüklemesinde kontrol ediliyor
- [ ] TypeScript sıfır hatayla derleniyor
- [ ] Staging'de gerçek ödeme testi geçti

---

## SELF-REVIEW

```
□ Hash doğrulama implemente edildi ve test edildi mi?
□ Callback idempotent mi?
□ PayTR credentials asla loglanıyor mu?  (loglanmamalı)
□ pro_started_at doğru ayarlı mı (ödeme tarihi)?
□ pro_expires_at doğru ayarlı mı (başlangıç + 30/365 gün)?
□ payments ve profiles atomic güncelleniyor mu?
□ PayTR callback route auth middleware bypass ediyor mu?  (etmeli — PayTR'ın kimlik doğrulaması yok)
□ verify-payment token süresini kontrol ediyor mu?
□ Billing sayfası doğru abonelik durumunu gösteriyor mu?
□ PayTR domain gereksinimine uyuluyor mu? (www.xn--krnet-3qa.com)
```

---

## FAZ8 SONRASI DNS GEÇİŞ KONTROL LİSTESİ

Yalnızca FAZ8 staging'de tamamen çalışıyorken:
```
□ Tüm özellikler staging'de doğrulandı
□ Gerçek kartla ödeme test edildi (küçük miktar)
□ Hilmi inceledi ve onayladı
□ Vercel v2 projesi tüm env variable'lara sahip
□ DNS geçişi: kârnet.com → v2 Vercel projesi
□ v1 2 hafta daha ayakta tutulur (geri alma seçeneği)
□ v1 sitesi gözlemlenir (hata, kullanıcı şikayeti)
□ 2 hafta sorunsuz geçerse v1 archive edilir
```

---

## FAZ8 RAPOR FORMATI

```
FAZ8 TAMAMLANDI
Teslim edilenler: [liste]
Staging test sonucu: [gerçek ödeme test özeti]
Hash doğrulama: GEÇTI / BAŞARISIZ
Atomic güncelleme: DOĞRULANDI
Sonraki: DNS GEÇİŞİ — Hilmi onayı gerekli
```
