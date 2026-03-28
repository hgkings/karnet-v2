# FAZ4 — Servis Katmanı (Logic)
> Ön koşul: FAZ3 tamamlandı
> Hedef: Tüm iş mantığı servisleri — kâr hesaplama, marketplace sync, bildirimler
> ŞİMDİ OKU: KNOWLEDGE-BASE.md (sadece bu fazda)
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: İş mantığı servislerini kur (Katman 6)
LAYERS: services/
FILES TO CREATE:
  - services/analysis.logic.ts      ← Net kâr hesaplama, breakeven, sensitivity
  - services/risk.logic.ts          ← Risk puanı hesaplama
  - services/marketplace.logic.ts   ← Trendyol/Hepsiburada API mantığı
  - services/commission.logic.ts    ← Komisyon oranı yönetimi
  - services/user.logic.ts          ← Profil, tercihler, plan kontrolü
  - services/notification.logic.ts  ← Risk uyarıları, email bildirimleri
  - services/support.logic.ts       ← Destek talebi yönetimi
  - services/pdf.logic.ts           ← PDF rapor üretimi
  - services/blog.logic.ts          ← Blog yazıları ve yorum yönetimi
FILES NOT TOUCHED: app/, lib/gateway/, repositories/ (henüz), lib/supabase/
RISK: Kâr hesaplama v1 ile AYNI OLMALI — KNOWLEDGE-BASE.md'yi dikkatli oku
→ Awaiting approval.
```

---

## KRİTİK: ÖNCE KNOWLEDGE-BASE.md'Yİ OKU

analysis.logic.ts yazmadan önce KNOWLEDGE-BASE.md'yi tamamen oku.
Hesaplama mantığı (komisyonlar, kargo, iadeler, KDV, reklam maliyetleri) v1 ile eşleşmeli.
Formül icat etme — sadece orada belgelenenler kullanılır.

---

## SERVİS YAPISI DESENİ

```typescript
// Her servis bu deseni izler:
export class AnalysisLogic {
  constructor(
    private readonly analysisRepo: AnalysisRepository,
    private readonly commissionRepo: CommissionRepository
  ) {}

  async calculateNetProfit(
    traceId: string,
    input: AnalysisInput,
    userId: string
  ): Promise<AnalysisResult> {
    // 1. Input doğrulanmış (Katman 2'de yapıldı)
    // 2. Gerekli veriyi repository üzerinden getir
    // 3. İş mantığını uygula
    // 4. Tipli sonuç döndür
  }
}
```

---

## KÂR HESAPLAMA GEREKSİNİMLERİ

Temel formül (KNOWLEDGE-BASE.md'den):
```
Net Kâr = Satış Fiyatı
        - Pazar yeri Komisyonu (KDV hariç fiyat üzerinden)
        - Kargo Servisi Bedeli
        - İade Kaybı (oran × satış fiyatı)
        - Reklam Maliyeti
        - KDV
        - Diğer Kesintiler
```

Kâr hesaplama için V1'DEN FARKLI HİÇBİR FORMÜL KULLANMA.

Her bileşen ayrı hesaplanmalı, sonuçta görünür olmalı.

---

## KRİTİK v1 HATA DÜZELTMELERİ (v2'de doğrula)

ERROR-REPORT.md'den — bu servislerde düzelt:

- `analysis.logic.ts`: Analiz sayısı race condition — DB seviyesi constraint gerekli
- `notification.logic.ts`: Risk alert email 6 saatlik cooldown uygula
- `support.logic.ts`: Admin cevabında email gönder (v1'de eksikti)
- `pdf.logic.ts`: Aylık PDF limitini server-side uygula (v1'de sadece client-side vardı)
- `blog.logic.ts`: Blog yorumuna rate limiting ekle (v1'de eksikti)
- `marketplace.logic.ts`: Sync endpoint'lerine rate limiting ekle

---

## TESLİMAT KRİTERLERİ

- [ ] AnalysisLogic doğru net kâr hesaplıyor (v1 örnekleriyle doğrula)
- [ ] RiskLogic risk puanını v1 ile aynı hesaplıyor
- [ ] MarketplaceLogic Trendyol siparişleri ve ürünleri getiriyor
- [ ] NotificationLogic risk uyarıları gönderiyor (6h cooldown ile)
- [ ] SupportLogic admin cevabında email gönderiyor
- [ ] PdfLogic aylık indirme limitini uygulıyor
- [ ] BlogLogic yorum gönderimini rate-limit ediyor
- [ ] Tüm servisler ServiceBridge'e kayıtlı (FAZ3)
- [ ] TypeScript sıfır hatayla derleniyor

---

## SELF-REVIEW

```
□ Herhangi bir servis app/'dan import ediyor mu?  (HAYIR olmalı)
□ Herhangi bir servis lib/supabase/'dan direkt import ediyor mu?  (HAYIR — repository kullan)
□ Kâr formülü KNOWLEDGE-BASE.md ile doğrulandı mı?
□ Türk KDV oranları doğru mu (%20, %10, %1)?
□ Komisyon oranları DB'den mi geliyor (hardcoded değil)?
□ Any tipi yok mu?
□ v1 hata düzeltmeleri uygulandı mı?
```

---

## FAZ4 RAPOR FORMATI

```
FAZ4 TAMAMLANDI
Teslim edilenler: [liste]
Kâr hesaplama testi: [v1 ile karşılaştırma sonucu]
v1 hata düzeltmeleri: [uygulananlar]
Sonraki: FAZ5 — Repository Katmanı
```
