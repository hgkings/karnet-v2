# FAZ5 — Repository Katmanı
> Ön koşul: FAZ4 tamamlandı
> Hedef: DB erişim katmanı — BaseRepository, DBHelper (AES-256-GCM), tüm repository'ler
> ŞİMDİ OKU: DATABASE-SCHEMA.md (sadece bu fazda)
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: Repository katmanını kur (Katman 7-8)
LAYERS: repositories/, lib/db/
FILES TO CREATE:
  - lib/db/db.helper.ts                    ← DBHelper (AES-256-GCM şifreleme)
  - lib/db/types.ts                        ← DB-spesifik tipler
  - repositories/base.repository.ts       ← Soyut BaseRepository (JSONB)
  - repositories/analysis.repository.ts
  - repositories/user.repository.ts
  - repositories/product.repository.ts
  - repositories/payment.repository.ts    🔒
  - repositories/support.repository.ts
  - repositories/notification.repository.ts
  - repositories/marketplace.repository.ts ← Şifreli API key yönetimi
  - repositories/commission.repository.ts
  - repositories/blog.repository.ts
FILES NOT TOUCHED: app/, services/, lib/gateway/
RISK: AES-256-GCM şifreleme v1 şifreli DB verisiyle uyumlu olmalı — format değiştirme
→ Awaiting approval.
```

---

## KRİTİK: ÖNCE DATABASE-SCHEMA.md'Yİ OKU

Herhangi bir repository yazmadan önce DATABASE-SCHEMA.md'yi tamamen oku.
Tablo adları, kolon adları, RLS politikaları ve ilişkiler tam eşleşmeli.
Yeni tablo oluşturma — mevcut Supabase şemasını kullan.

---

## DBHELPER GEREKSİNİMLERİ

```typescript
// lib/db/db.helper.ts
// AES-256-GCM — hassas alanlar için (marketplace API key'leri)
class DBHelper {
  encrypt(plaintext: string): string   // şifreli blob döndür
  decrypt(ciphertext: string): string  // düz metin döndür
}

// Anahtar: MARKETPLACE_SECRET_KEY env değişkeninden (base64, 32 byte)
// IV: şifreleme başına rastgele 12 byte (ciphertext ile saklanır)
// Format: JSON blob — { iv, ciphertext, tag, version }
// Auth tag: 128-bit (integrity verification)
```

⚠️ Bu v1 şifreli verisiyle uyumlu OLMALI. Formatı değiştirme.

v1 formatı: `{ iv: string, ciphertext: string, tag: string, version: number }`

---

## BASE REPOSITORY DESENİ

```typescript
export abstract class BaseRepository<T> {
  constructor(protected readonly supabase: SupabaseAdminClient) {}

  protected abstract tableName: string

  async findById(id: string): Promise<T | null>
  async findMany(filters: Partial<T>, options?: QueryOptions): Promise<T[]>
  async create(data: Omit<T, 'id' | 'created_at'>): Promise<T>
  async update(id: string, data: Partial<T>): Promise<T>
  async delete(id: string): Promise<void>

  // JSONB sorgu desteği
  async findByJsonbField(
    column: string,
    path: string,
    value: unknown
  ): Promise<T[]>
}
```

---

## KRITIK v1 HATA DÜZELTMELERİ (repository seviyesinde)

ERROR-REPORT.md'den:

- `support.repository.ts`: `getAllTickets()` — tüm kayıtları getirmek yerine sunucu-taraflı pagination ekle
- `analysis.repository.ts`: Ekleme öncesi analiz sayısı kontrolü için transaction kullan (race condition fix)
- `payment.repository.ts`: `updatePaymentAndProfile()` atomic hale getir — payments + profiles aynı transaction'da güncelle
- Tüm repository'ler: `notification.repository.ts` dışında pagination ekle

---

## RLS POLİTİKA KURALLARI

- Tüm sorgular Supabase RLS'e saygı duymalı
- Kullanıcı verisi sorguları için service role key kullanma — kullanıcının oturumunu kullan
- Service role sadece şunlarda: admin işlemleri, cron job'ları, webhook'lar
- Her repository RLS hatalarını zarif şekilde yönetmeli (throw değil null döndür)

---

## TESLİMAT KRİTERLERİ

- [ ] DBHelper şifreliyor ve çözüyor (bilinen değerle test)
- [ ] DBHelper v1 şifreli verisiyle uyumlu
- [ ] BaseRepository CRUD işlemleri çalışıyor
- [ ] Tüm repository'ler BaseRepository'yi extend ediyor
- [ ] MarketplaceRepository yazarken API key'leri şifreliyor, okurken çözüyor
- [ ] Support repository sunucu-taraflı pagination kullanıyor
- [ ] Payment repository atomic güncelleme kullanıyor (transaction)
- [ ] RLS'e uyum — A kullanıcısı B kullanıcısının verisini okuyamıyor
- [ ] TypeScript sıfır hatayla derleniyor

---

## SELF-REVIEW

```
□ Herhangi bir repository app/'dan import ediyor mu?  (HAYIR olmalı)
□ Herhangi bir repository services/'den import ediyor mu?  (HAYIR olmalı)
□ DBHelper şifrelemesi v1 formatıyla uyumlu mu?
□ Service role key uygun yerlerde mi kullanılıyor?
□ Tüm sorgular RLS veya açık user_id filtresiyle korumalı mı?
□ Support repository pagination kullanıyor mu?
□ Payment repository atomic güncelliyor mu?
□ Any tipi yok mu?
```

---

## FAZ5 RAPOR FORMATI

```
FAZ5 TAMAMLANDI
Teslim edilenler: [liste]
DBHelper uyumluluk testi: [v1 şifreli veri testi]
v1 hata düzeltmeleri: [uygulananlar]
Sonraki: FAZ6 — API Route'ları
```
