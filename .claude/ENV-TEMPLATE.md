# ENV-TEMPLATE.md — Environment Variables Referansı
> Sadece FAZ1'de oku. Başka fazda açma.
> Değerleri asla koda yazma. Her zaman process.env kullan.
> Son güncelleme: 2026-03-28

---

## KULLANIM

1. Bu dosyanın altındaki template'i kopyala
2. `.env.local` olarak proje köküne kaydet
3. Değerleri ilgili panellerden doldur
4. `.env.local` asla git'e commit edilmez (.gitignore'da)
5. Tüm değişkenleri Vercel dashboard'a da ekle

---

## TÜM DEĞİŞKENLER

### Supabase
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key (client'ta güvenli) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key — **ASLA client'a gönderme** |

> Nerede: Supabase Dashboard → Project Settings → API

### PayTR (🔒 — FAZ8'e kadar boş bırak)
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `PAYTR_MERCHANT_ID` | ✅ | PayTR merchant ID |
| `PAYTR_MERCHANT_KEY` | ✅ | PayTR merchant key — **ASLA client'a gönderme** |
| `PAYTR_MERCHANT_SALT` | ✅ | PayTR merchant salt — **ASLA client'a gönderme** |
| `PAYTR_TEST_MODE` | ⚪ | `1` = test modu (local'de kullan), production'da boş bırak |

> Nerede: PayTR merchant panel
> ⚠️ MERCHANT_KEY ve MERCHANT_SALT asla client'a gönderilmez

### Brevo SMTP (Email)
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `BREVO_SMTP_USER` | ✅ | Brevo SMTP kullanıcı adı (genellikle email adresi) |
| `BREVO_SMTP_KEY` | ✅ | Brevo SMTP şifresi/API key |
| `BREVO_API_KEY` | ✅ | Brevo API key — Supabase Edge Function için |
| `EMAIL_FROM` | ✅ | Gönderen adres: `karnet.destek@gmail.com` |
| `EMAIL_FROM_NAME` | ✅ | Gönderen isim: `Kârnet` |

> Nerede: Brevo Dashboard → SMTP & API → SMTP sekmesi
> ⚠️ kârnet.com → xn--krnet-3qa.com (punycode) olduğundan Gmail adresi kullanılır

### Upstash Redis (Rate Limiting)
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis REST token |

> Nerede: Upstash Console → karnet DB → REST API sekmesi
> Bölge: EU-West-1 (Ireland)

### Trendyol API
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `TRENDYOL_API_BASE_URL` | ✅ | `https://apigw.trendyol.com/sapigw` |

> ⚠️ Kullanıcıya ait API key'ler DB'de şifreli saklanır. Bu global/sistem key'dir.

### Hepsiburada API
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `HEPSIBURADA_OMS_BASE_URL` | ✅ | `https://oms-external.hepsiburada.com` |
| `HEPSIBURADA_FINANCE_BASE_URL` | ✅ | `https://mpfinance-external.hepsiburada.com` |
| `HEPSIBURADA_LISTING_BASE_URL` | ✅ | `https://listing-external.hepsiburada.com` |

### Şifreleme
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `MARKETPLACE_SECRET_KEY` | ✅ | AES-256-GCM anahtarı — 32 byte, base64 encoded |
| `MARKETPLACE_SECRET_KEY_OLD` | ⚪ | Key rotation sırasında eski anahtar |

> Üret: `openssl rand -base64 32`
> ⚠️ Bu anahtar kaybolursa DB'deki tüm şifreli veri erişilemez hale gelir

### Uygulama Ayarları
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` (local) / `https://www.xn--krnet-3qa.com` (prod) |
| `NEXT_PUBLIC_APP_NAME` | ✅ | `Kârnet` |
| `NODE_ENV` | ✅ | `development` / `production` |

> ⚠️ PayTR callback URL'i www.xn--krnet-3qa.com OLMALI — www olmadan redirect var, PayTR redirect takip etmez

### Güvenlik
| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `CRON_SECRET` | ✅ | Cron job kimlik doğrulama secret'ı |
| `ADMIN_SECRET` | ✅ | Admin API route güvenliği (opsiyonel katman) |
| `TRENDYOL_WEBHOOK_SECRET` | ⚪ | Trendyol webhook HMAC-SHA256 doğrulama (opsiyonel) |

> Üret: `openssl rand -base64 32`

---

## RATE LIMIT AYARLARI (kodda, env'de değil)

`lib/security/rate-limit.ts` dosyasında tanımlanır:
- `authRateLimit`: 5 istek / dakika (login, register, şifre sıfırlama)
- `apiRateLimit`: 60 istek / dakika (genel API)
- `emailRateLimit`: 3 istek / dakika (email gönderimi)
- `syncRateLimit`: 1 istek / 5 dakika / kullanıcı (marketplace sync)
- `commentRateLimit`: 3 istek / dakika (blog yorumları)

Desen: **fail-open** — Redis erişilemezse istek geçer (kullanıcı bloke edilmez).

---

## LOCAL vs PRODUCTION FARKLILIKLARI

| Ayar | Local | Production |
|------|-------|-----------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://www.xn--krnet-3qa.com` |
| PayTR | ❌ Test edilemez (webhook gerekir) | ✅ Canlı |
| Supabase | ⚠️ Production DB'si aynı | ✅ Production DB |
| Vercel | Kullanılmaz | Auto-deploy on push |

> ⚠️ Local ve production **aynı Supabase DB'sini** kullanır.
> Local'de destructive işlem yaparken dikkatli ol.

---

## .env.local TEMPLATE

```bash
# ============================================================
# KÂRNET V2 — Environment Variables
# Bu dosyayı .env.local olarak kaydet ve değerleri doldur
# ASLA git'e commit etme
# ============================================================

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PAYTR (FAZ8 — FAZ8 başlayana kadar boş bırak)
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
PAYTR_TEST_MODE=1

# BREVO SMTP
BREVO_SMTP_USER=
BREVO_SMTP_KEY=
BREVO_API_KEY=
EMAIL_FROM=karnet.destek@gmail.com
EMAIL_FROM_NAME=Kârnet

# UPSTASH REDIS
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# TRENDYOL API
TRENDYOL_API_BASE_URL=https://apigw.trendyol.com/sapigw

# HEPSIBURADA API
HEPSIBURADA_OMS_BASE_URL=https://oms-external.hepsiburada.com
HEPSIBURADA_FINANCE_BASE_URL=https://mpfinance-external.hepsiburada.com
HEPSIBURADA_LISTING_BASE_URL=https://listing-external.hepsiburada.com

# ŞİFRELEME
# Üret: openssl rand -base64 32
MARKETPLACE_SECRET_KEY=
MARKETPLACE_SECRET_KEY_OLD=

# UYGULAMA AYARLARI
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Kârnet
NODE_ENV=development

# GÜVENLİK
# Üret: openssl rand -base64 32
CRON_SECRET=
ADMIN_SECRET=
TRENDYOL_WEBHOOK_SECRET=
```

---

## FAZ1 KONTROL LİSTESİ

Env kurulumu tamamlandı sayılır:
- [ ] `.env.local` oluşturuldu (git'e commit edilmedi)
- [ ] Tüm zorunlu değişkenler dolduruldu
- [ ] Supabase bağlantısı test edildi
- [ ] Upstash Redis bağlantısı test edildi
- [ ] `.env.example` boş değerlerle git'e commit edildi
- [ ] Tüm değişkenler Vercel dashboard'a eklendi
