# FAZ3 — Gateway Katmanı
> Ön koşul: FAZ2 tamamlandı
> Hedef: GatewayAdapter, GlobalService, ServiceBridge — yönlendirme omurgası
> Bu katman API route'ları ile iş mantığı servisleri arasında oturur
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: Gateway katmanını kur (Katman 3-5)
LAYERS: lib/gateway/
FILES TO CREATE:
  - lib/gateway/gateway.adapter.ts   ← GatewayAdapter (istek proxy)
  - lib/gateway/global.service.ts    ← GlobalService (orkestrasyon)
  - lib/gateway/service.bridge.ts    ← ServiceBridge (servislere yönlendir)
  - lib/gateway/types.ts             ← Gateway-spesifik tipler
FILES NOT TOUCHED: app/, services/, repositories/, lib/supabase/
APPROACH:
  GatewayAdapter API route'larından doğrulanmış istekleri alır.
  GlobalService hangi servislerin çağrılacağını orkestre eder.
  ServiceBridge servis adlarını gerçek servis örneklerine çözümler.
RISK: Servisler gateway'i import ederse döngüsel bağımlılık — tek yönü zorunlu kıl
→ Awaiting approval.
```

---

## KATMAN AKIŞI

```
app/api/route.ts
    ↓ (Zod ile doğrulanmış input)
GatewayAdapter.handle(traceId, request)
    ↓
GlobalService.callService(serviceName, method, payload)
    ↓
ServiceBridge.resolve(serviceName) → LogicService örneği
    ↓
LogicService.method(traceId, payload)
```

---

## GATEWAY ADAPTER — TEMEL YAPISI

```typescript
// lib/gateway/gateway.adapter.ts
export class GatewayAdapter {
  async handle(
    serviceName: string,
    method: string,
    payload: unknown,
    userId: string
  ): Promise<unknown> {
    const traceId = this.generateTraceId()

    try {
      // 1. Rate limit (FAZ2'den)
      // 2. GlobalService'e yönlendir
      const result = await globalService.callService(
        traceId,
        serviceName,
        method,
        payload,
        userId
      )
      return result
    } catch (error) {
      await auditLogger.logError(traceId, error)
      throw error
    }
  }

  private generateTraceId(): string {
    return `trx-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  }
}

export const gateway = new GatewayAdapter()
```

---

## TEMEL KURALLAR

- Gateway katmanı asla `app/`'dan import etmez
- Gateway katmanı asla `repositories/`'den import etmez
- Servisler isimle (string) çözümlenir, direkt import değil
- Servislerden gelen tüm hatalar gateway üzerinden tipli hata olarak yukarı çıkar
- Her çağrı izlenebilir (traceId her katmana taşınır)
- Audit loglama her işlemde otomatik

---

## TESLİMAT KRİTERLERİ

- [ ] GatewayAdapter test isteğini kabul edip yönlendiriyor
- [ ] GlobalService ServiceBridge'e doğru dispatch ediyor
- [ ] ServiceBridge test servisi çözümlüyor
- [ ] TypeScript sıfır hatayla derleniyor
- [ ] Döngüsel bağımlılık yok (`madge --circular` kontrolü)

---

## SELF-REVIEW

```
□ Gateway app/'dan import ediyor mu?  (HAYIR olmalı)
□ Gateway repositories/'den import ediyor mu?  (HAYIR olmalı)
□ Tüm hatalar tipli mi (generic Error değil)?
□ Her çağrıda traceId var mı?
□ TypeScript strict — any tipi yok mu?
□ ServiceBridge yeni servis eklemeyi kolaylaştırıyor mu?
```

---

## FAZ3 RAPOR FORMATI

```
FAZ3 TAMAMLANDI
Teslim edilenler: [liste]
Test sonuçları: [gateway flow test]
Döngüsel bağımlılık: YOK (madge kontrolü)
Sonraki: FAZ4 — Servis Katmanı
```
