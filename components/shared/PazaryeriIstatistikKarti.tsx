'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PAZARYERLERI = [
  {
    id: 'trendyol',
    isim: 'Trendyol',
    emoji: '🟠',
    finansEndpoint: '/api/marketplace/trendyol/finance',
  },
  {
    id: 'hepsiburada',
    isim: 'Hepsiburada',
    emoji: '🟡',
    finansEndpoint: '/api/marketplace/hepsiburada/finance',
  },
] as const;

interface BagliPazaryeri {
  id: string;
  status: string;
  supplier_id?: string;
  merchant_id?: string;
}

interface Veri {
  toplamKomisyon: number;
  toplamHakedis: number;
  toplamIade: number;
  kayitSayisi: number;
}

interface FinansRow {
  komisyonTutari?: number;
  saticiHakedis?: number;
}

interface FinansResponse {
  data?: FinansRow[];
  ozet?: {
    toplamKomisyon?: number;
    toplamHakedis?: number;
    toplamIadeTutari?: number;
  };
  toplamIade?: number;
  toplam?: number;
}

interface Props {
  bagliPazaryerleri: BagliPazaryeri[];
}

export function PazaryeriIstatistikKarti({ bagliPazaryerleri }: Props) {
  const baglilar = PAZARYERLERI.filter((p) =>
    bagliPazaryerleri.some((b) => b.id === p.id && b.status === 'connected')
  );

  const [seciliId, setSeciliId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('son_pazaryeri');
      if (saved && baglilar.some((p) => p.id === saved)) return saved;
    }
    const first = baglilar[0];
    return first ? first.id : '';
  });

  const [veri, setVeri] = useState<Veri | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // İlk bağlıyı seç (bağlantı durumu geç gelirse)
  useEffect(() => {
    const first = baglilar[0];
    if (!seciliId && first) {
      setSeciliId(first.id);
    }
  }, [baglilar.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pazaryeri değişince veri çek
  useEffect(() => {
    if (!seciliId) return;
    if (typeof window !== 'undefined') localStorage.setItem('son_pazaryeri', seciliId);
    veriCek(seciliId);
  }, [seciliId]); // eslint-disable-line react-hooks/exhaustive-deps

  const veriCek = async (id: string) => {
    const pazaryeri = PAZARYERLERI.find((p) => p.id === id);
    if (!pazaryeri) return;

    setYukleniyor(true);
    setHata(null);
    setVeri(null);

    try {
      const bugun = new Date();
      const baslangic = new Date();
      baslangic.setDate(bugun.getDate() - 30);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const res = await fetch(
        `${pazaryeri.finansEndpoint}?startDate=${fmt(baslangic)}&endDate=${fmt(bugun)}`
      );
      if (!res.ok) throw new Error('Finans verisi alınamadı');
      const json = (await res.json()) as FinansResponse;

      const rows: FinansRow[] = json.data ?? [];
      setVeri({
        toplamKomisyon:
          json.ozet?.toplamKomisyon ??
          rows.reduce((s, r) => s + (r.komisyonTutari ?? 0), 0),
        toplamHakedis:
          json.ozet?.toplamHakedis ??
          rows.reduce((s, r) => s + (r.saticiHakedis ?? 0), 0),
        toplamIade: json.ozet?.toplamIadeTutari ?? json.toplamIade ?? 0,
        kayitSayisi: json.toplam ?? rows.length,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
      setHata(message);
    } finally {
      setYukleniyor(false);
    }
  };

  const fmt = (n: number) =>
    '₺' + n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Pazaryeri İstatistikleri</h3>
        <div className="flex items-center gap-2">
          {baglilar.length === 0 ? (
            <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-1 rounded-full">
              🟠 Bağlı Değil
            </span>
          ) : yukleniyor ? (
            <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-1 rounded-full">
              🟡 Yükleniyor
            </span>
          ) : hata ? (
            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-1 rounded-full">
              🔴 Bağlantı Hatası
            </span>
          ) : (
            <span className="text-xs bg-green-500/15 text-green-400 px-2 py-1 rounded-full">
              🟢 Canlı Veri
            </span>
          )}

          {baglilar.length > 1 && (
            <select
              value={seciliId}
              onChange={(e) => setSeciliId(e.target.value)}
              className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer"
            >
              {baglilar.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.isim}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* STATE 1: Hiçbiri bağlı değil */}
      {baglilar.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Pazaryeri hesabını bağla — komisyon, kargo ve iade verilerin otomatik gelsin.
          </p>
          <div className="space-y-2 mb-4 text-left">
            {['📊 Komisyon verisi otomatik', '💸 Gerçek net kâr hesabı', '📦 İade oranı otomatik'].map(
              (item) => (
                <p key={item} className="text-xs text-muted-foreground">
                  {item}
                </p>
              )
            )}
          </div>
          <Link href="/marketplace">
            <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              Pazaryeri Bağla →
            </button>
          </Link>
        </div>
      )}

      {/* STATE 2: Yükleniyor */}
      {baglilar.length > 0 && yukleniyor && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* STATE 3: Hata */}
      {baglilar.length > 0 && !yukleniyor && hata && (
        <div className="text-center py-4">
          <p className="text-sm text-red-400 mb-3">⚠️ {hata}</p>
          <button onClick={() => veriCek(seciliId)} className="text-xs text-primary underline">
            Tekrar dene
          </button>
        </div>
      )}

      {/* STATE 4: Veri geldi */}
      {baglilar.length > 0 && !yukleniyor && !hata && veri && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Komisyon</p>
              <p className="text-base font-bold text-destructive">
                {fmt(veri.toplamKomisyon)}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Hakediş</p>
              <p className="text-base font-bold text-primary">{fmt(veri.toplamHakedis)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">İade</p>
              <p className="text-base font-bold text-yellow-500">{fmt(veri.toplamIade)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span>Son 30 günde {veri.kayitSayisi} işlem</span>
            <Link href="/marketplace" className="text-primary hover:underline">
              Detaylar →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
