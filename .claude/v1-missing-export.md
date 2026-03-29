=== FILE: components/shared/risk-gauge.tsx ===
'use client';

import { RiskLevel } from '@/types';
import { riskLevelConfig } from '@/utils/risk-engine';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskGauge({ score, level, size = 160 }: RiskGaugeProps) {
  const config = riskLevelConfig[level];
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          <path
            d={`M ${10} ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/50"
            strokeLinecap="round"
          />
          <path
            d={`M ${10} ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-bold" style={{ color: config.color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}
=== END ===

=== FILE: components/analysis/cost-breakdown.tsx ===
'use client';

import { CalculationResult, ProductInput } from '@/types';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { n } from '@/utils/calculations';
import { splitVat } from '@/utils/pro-accounting';

interface CostBreakdownProps {
  input: ProductInput;
  result: CalculationResult;
}

export function CostBreakdown({ input, result }: CostBreakdownProps) {
  const isProMode = input.pro_mode === true;

  // Helper to get net value for display
  const getNet = (val: number, inc: boolean | undefined, pct: number | undefined) => {
    if (!isProMode) return val;
    return splitVat(n(val), n(pct, 20), inc !== false).net;
  };

  const items = [
    {
      label: isProMode ? 'Net Ürün Maliyeti' : 'Ürün Maliyeti',
      value: getNet(input.product_cost, input.product_cost_includes_vat, input.purchase_vat_pct ?? input.vat_pct)
    },
    { label: 'Komisyon (Net)', value: n(result.commission_amount) },
    ...(n(result.service_fee_amount) > 0
      ? [{
          label: input.marketplace === 'hepsiburada'
            ? 'Hepsiburada Servis Bedeli'
            : input.marketplace === 'trendyol'
            ? 'Trendyol Servis Bedeli'
            : 'Platform Hizmet Bedeli',
          value: n(result.service_fee_amount)
        }]
      : []),
    { label: isProMode ? 'Satış KDV (Çıkış)' : 'KDV', value: n(result.vat_amount) },
    { label: 'İade Kaybı (Net)', value: n(result.expected_return_loss) },
    {
      label: isProMode ? 'Kargo (Net)' : 'Kargo',
      value: getNet(input.shipping_cost, input.shipping_includes_vat, input.shipping_vat_pct)
    },
    {
      label: isProMode ? 'Paketleme (Net)' : 'Paketleme',
      value: getNet(input.packaging_cost, input.packaging_includes_vat, input.packaging_vat_pct)
    },
    {
      label: isProMode ? 'Reklam (Net)' : 'Reklam',
      value: getNet(input.ad_cost_per_sale, input.ad_includes_vat, input.ad_vat_pct)
    },
    {
      label: isProMode ? 'Diğer (Net)' : 'Diğer',
      value: getNet(input.other_cost, input.other_cost_includes_vat, input.other_cost_vat_pct)
    },
  ];

  const total = n(result.unit_total_cost);
  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Maliyet dağılımı (birim)</h3>
        {isProMode && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">NET ESASLI</span>}
      </div>

      <div className="divide-y divide-border/20">
        {items.filter((i) => i.value > 0).map((item) => (
          <div key={item.label} className="space-y-1.5 py-3 hover:bg-muted/30 transition-colors rounded-md px-1 -mx-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-700 ease-out"
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Toplam birim maliyet</span>
          <span className="text-lg font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center justify-between pb-1 border-b border-dashed border-border/30">
          <span className="text-xs font-medium text-muted-foreground">Satış fiyatı</span>
          <span className="text-lg font-semibold text-primary">{formatCurrency(n(input.sale_price) || (result as any).sale_price || 0)}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div>
            <span className="text-sm font-semibold block">Birim net kâr</span>
            <span className="text-[10px] text-muted-foreground italic leading-none">
              {isProMode ? "(KDV ve Vergiler Hariç)" : "(Tahmini)"}
            </span>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${result.unit_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(result.unit_net_profit)}
            </p>
            <p className={`text-xs font-medium ${result.margin_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(result.margin_pct)} marj
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/analysis/marketplace-comparison.tsx ===
'use client';

import { ProductInput, Marketplace } from '@/types';
import { marketplaces } from '@/lib/marketplace-data';
import { calculateProfit } from '@/utils/calculations';
import { calculateRisk } from '@/utils/risk-engine';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Star } from 'lucide-react';

interface MarketplaceComparisonProps {
  input: ProductInput;
}

export function MarketplaceComparison({ input }: MarketplaceComparisonProps) {
  const comparisons = marketplaces
    .filter((mp) => mp.key !== 'custom')
    .map((mp) => {
      const adjusted: ProductInput = {
        ...input,
        marketplace: mp.key as Marketplace,
        commission_pct: mp.commission_pct,
        return_rate_pct: mp.return_rate_pct,
      };
      const result = calculateProfit(adjusted);
      const risk = calculateRisk(adjusted, result);
      return { marketplace: mp, result, risk };
    })
    .sort((a, b) => b.result.monthly_net_profit - a.result.monthly_net_profit);

  const best = comparisons[0];

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <h3 className="text-sm font-semibold">Pazaryeri Karsilastirmasi</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Ayni urunun farkli pazaryerlerindeki performansini karsilastirin.
      </p>

      <div className="mt-4 space-y-3">
        {comparisons.map((c) => {
          const isBest = c === best;
          return (
            <div
              key={c.marketplace.key}
              className={`rounded-xl border p-4 transition-colors ${isBest ? 'border-primary/50 bg-primary/5' : 'bg-muted/30'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{c.marketplace.label}</span>
                  {isBest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Star className="h-3 w-3" />
                      En Iyi
                    </span>
                  )}
                </div>
                <RiskBadge level={c.risk.level} />
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between sm:block">
                  <p className="text-xs text-muted-foreground">Birim Kar</p>
                  <p className={`font-semibold ${c.result.unit_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(c.result.unit_net_profit)}
                  </p>
                </div>
                <div className="flex justify-between sm:block">
                  <p className="text-xs text-muted-foreground">Marj</p>
                  <p className="font-semibold">{formatPercent(c.result.margin_pct)}</p>
                </div>
                <div className="flex justify-between sm:block">
                  <p className="text-xs text-muted-foreground">Aylik Kar</p>
                  <p className={`font-semibold ${c.result.monthly_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(c.result.monthly_net_profit)}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>Komisyon: %{c.marketplace.commission_pct}</span>
                <span>Iade: %{c.marketplace.return_rate_pct}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/analysis/cashflow-estimator.tsx ===
'use client';

import { ProductInput } from '@/types';
import { calculateCashflow } from '@/utils/calculations';
import { formatCurrency } from '@/components/shared/format';
import { Wallet, TrendingDown, Clock } from 'lucide-react';

interface CashflowEstimatorProps {
  input: ProductInput;
}

export function CashflowEstimator({ input }: CashflowEstimatorProps) {
  const cf = calculateCashflow(input);

  const items = [
    {
      label: 'Gerekli Isletme Sermayesi',
      value: cf.workingCapitalNeeded,
      icon: Wallet,
      desc: `${input.payout_delay_days} gunluk odeme gecikmesi icin gerekli sermaye`,
    },
    {
      label: 'Aylik Nakit Acigi',
      value: cf.monthlyCashGap,
      icon: TrendingDown,
      desc: 'Tahmini aylik nakit cikisi ve giris arasi fark',
    },
    {
      label: 'Gunluk Nakit Yakma',
      value: cf.dailyCashBurn,
      icon: Clock,
      desc: 'Gunluk ortalama maliyet cikisi',
    },
  ];

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <h3 className="text-sm font-semibold">Nakit Akisi Tahmini</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Odeme gecikmeleri ve maliyetlere gore nakit akisi tahmini.
      </p>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-lg font-bold">{formatCurrency(item.value)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/analysis/vat-impact-card.tsx ===
'use client';

import { ProductInput, CalculationResult } from '@/types';
import { formatCurrency } from '@/components/shared/format';
import { Receipt, ArrowRight, TrendingDown, Landmark } from 'lucide-react';
import { n } from '@/utils/calculations';

interface VatImpactCardProps {
    input: ProductInput;
    result: CalculationResult;
}

export function VatImpactCard({ input, result }: VatImpactCardProps) {
    const isProMode = input.pro_mode === true;
    const isVatIncluded = input.sale_price_includes_vat !== false;

    // Guard values
    const saleVatUnit = Number.isFinite(result.vat_amount) ? result.vat_amount : 0;
    const netPrice = Number.isFinite(result.sale_price_excl_vat) ? result.sale_price_excl_vat : 0;

    const vatPos = Number.isFinite(result.vat_position_monthly) ? result.vat_position_monthly : 0;
    const inputVat = Number.isFinite(result.input_vat_monthly) ? result.input_vat_monthly : 0;
    const outputVat = Number.isFinite(result.output_vat_monthly) ? result.output_vat_monthly : 0;

    const fmt = (val: number) => {
        if (!Number.isFinite(val)) return '—';
        return formatCurrency(val);
    };

    if (!isProMode) {
        return (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Vergi Etkisi (Birim KDV)</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {fmt(Math.abs(saleVatUnit))}
                        </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Receipt className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">KDV Hariç Satış:</span>
                        <span className="font-medium text-foreground">{fmt(netPrice)}</span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                        Birim fiyat KDV dahil kabul edilerek hesaplanmıştır (%{input.vat_pct}).
                    </p>
                </div>
            </div>
        );
    }

    // PRO MODE Detailed View
    return (
        <div className="rounded-2xl border-2 border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">KDV & Vergi Pozisyonu</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">PRO MOD</Badge>
            </div>

            <div className="space-y-4">
                {/* Unit Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Satış KDV (Birim)</p>
                        <p className="text-lg font-bold text-red-500">{fmt(saleVatUnit)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Net Satış (Birim)</p>
                        <p className="text-lg font-bold text-foreground">{fmt(netPrice)}</p>
                    </div>
                </div>

                {/* Monthly Position */}
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Toplam Çıkış KDV (Satış)</span>
                        <span className="font-bold text-red-500">{fmt(outputVat)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-primary/10 pb-2">
                        <span className="text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Toplam Giriş KDV (Alış+Gider)</span>
                        <span className="font-bold text-emerald-500">{fmt(inputVat)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold">Aylık KDV Pozisyonu:</span>
                        <span className={`text-sm font-black ${vatPos >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {vatPos >= 0 ? `Ödenecek: ${fmt(vatPos)}` : `Devreden: ${fmt(Math.abs(vatPos))}`}
                        </span>
                    </div>
                </div>

                <p className="text-[9px] text-muted-foreground italic leading-tight">
                    * KDV pozisyonu tahmini olup, iade oranı düştükten sonra kalan satışlar üzerinden hesaplanmıştır.
                </p>
            </div>
        </div>
    );
}

// Internal helper for Badge if needed (or import from UI)
function Badge({ children, variant, className }: any) {
    return <span className={`px-1.5 py-0.5 rounded text-xs border ${className}`}>{children}</span>;
}
=== END ===

=== FILE: components/analysis/min-price-cards.tsx ===
'use client';

import { ProductInput } from '@/types';
import { calculateRequiredPrice } from '@/utils/calculations';
import { formatCurrency } from '@/components/shared/format';
import { getMarketplaceLabel } from '@/lib/marketplace-data';
import { Info } from 'lucide-react';

interface MinPriceCardsProps {
  input: ProductInput;
  currentPrice: number;
}

interface PriceCard {
  label: string;
  sublabel: string;
  marginPct: number;
  price: number;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  emoji: string;
  tooltipText: string;
}

export function MinPriceCards({ input, currentPrice }: MinPriceCardsProps) {
  const mpLabel = getMarketplaceLabel(input.marketplace);

  const breakeven = calculateRequiredPrice(input, 'margin', 0);
  const price15   = calculateRequiredPrice(input, 'margin', 15);
  const price30   = calculateRequiredPrice(input, 'margin', 30);

  const isInfinity = (v: number) => !isFinite(v) || v <= 0;

  const cards: PriceCard[] = [
    {
      label: 'Başabaş',
      sublabel: 'Sıfır kâr noktası',
      marginPct: 0,
      price: breakeven,
      emoji: '🔴',
      colorClass: 'text-red-400',
      borderClass: 'border-red-500/20',
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-400',
      tooltipText:
        `Bu fiyat; ürün maliyeti, kargo, paketleme, reklam, ${mpLabel} komisyonu, ` +
        `servis bedeli ve beklenen iade maliyeti dahil edilerek hesaplanan sıfır kâr noktasıdır. ` +
        `Bu fiyatın altında satış yapmak zarara yol açar.`,
    },
    {
      label: '%15 Kâr',
      sublabel: 'Makul kâr marjı',
      marginPct: 15,
      price: price15,
      emoji: '🟡',
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-500/20',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-400',
      tooltipText:
        `Net kâr ÷ Satış Fiyatı = %15 olacak şekilde hesaplanmıştır. ` +
        `Tüm maliyet kalemleri ve ${mpLabel}'a özgü kesintiler dahildir.`,
    },
    {
      label: '%30 Kâr',
      sublabel: 'Hedef kâr marjı',
      marginPct: 30,
      price: price30,
      emoji: '🟢',
      colorClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/20',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      tooltipText:
        `Net kâr ÷ Satış Fiyatı = %30 olacak şekilde hesaplanmıştır. ` +
        `Tüm maliyet kalemleri ve ${mpLabel}'a özgü kesintiler dahildir.`,
    },
  ];

  // Which card is "active" — reflects where the user's current price falls
  const activeIndex =
    currentPrice >= price30   ? 3 :  // above all targets
    currentPrice >= price15   ? 2 :  // between 15% and 30%
    currentPrice >= breakeven ? 1 :  // between breakeven and 15%
    0;                               // below breakeven (loss zone)

  // Status bar config
  type StatusConfig = { icon: string; msg: string; cls: string };
  const statusConfig: StatusConfig = (() => {
    if (isInfinity(breakeven)) {
      return { icon: '⚠️', msg: 'Mevcut maliyet yapısıyla başabaş fiyatı hesaplanamıyor. Komisyon + iade oranını kontrol edin.', cls: 'border-red-500/20 bg-red-500/10 text-red-400' };
    }
    if (currentPrice < breakeven) {
      return { icon: '🔴', msg: `Mevcut fiyatınız zarar ettiriyor! En az ${formatCurrency(breakeven)}'a satmalısınız.`, cls: 'border-red-500/20 bg-red-500/10 text-red-400' };
    }
    if (currentPrice < price15) {
      return { icon: '🟡', msg: `Kârınız çok düşük. %15 kâr için ${formatCurrency(price15)} olmalı.`, cls: 'border-amber-500/20 bg-amber-500/10 text-amber-400' };
    }
    if (currentPrice < price30) {
      return { icon: '🟢', msg: `Makul kâr aralığındasınız. %30 için ${formatCurrency(price30)}'a yükseltebilirsiniz.`, cls: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' };
    }
    return { icon: '✅', msg: 'Hedef kâr marjını karşılıyorsunuz! Tebrikler.', cls: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' };
  })();

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          Minimum kârlı satış fiyatı
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {mpLabel} komisyon, servis bedeli ve iade maliyetleri dahil
        </span>
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, idx) => {
          const isActive = idx + 1 === activeIndex || (idx === 0 && activeIndex === 0);
          const isCurrentActive = activeIndex === idx + 1 || (activeIndex === 0 && idx === 0);
          const accentClasses = ['border-l-border/50', 'border-l-amber-500', 'border-l-emerald-500'];

          return (
            <div
              key={card.label}
              className={`rounded-xl border border-l-4 bg-card p-4 transition-all ${accentClasses[idx]} ${
                isCurrentActive ? 'shadow-md ring-1 ring-border/40' : 'shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{card.emoji}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                <span
                  title={card.tooltipText}
                  className="cursor-help text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>

              {isInfinity(card.price) ? (
                <p className="text-base font-bold text-muted-foreground">Hesaplanamaz</p>
              ) : (
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(card.price)}
                </p>
              )}

              <p className="text-xs mt-1 text-muted-foreground">
                {card.sublabel}
              </p>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className={`rounded-lg border p-3 text-xs font-medium ${statusConfig.cls}`}>
        {statusConfig.icon} {statusConfig.msg}
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/analysis/scenario-simulator.tsx ===
'use client';

import { useState } from 'react';
import { ProductInput } from '@/types';
import { calculateProfit } from '@/utils/calculations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

interface ScenarioSimulatorProps {
    input: ProductInput;
}

export function ScenarioSimulator({ input }: ScenarioSimulatorProps) {
    // Simulation Deltas (Changes from base)
    const [returnRateDelta, setReturnRateDelta] = useState(0); // Additive %
    const [adCostDelta, setAdCostDelta] = useState(0); // Additive currency
    const [commissionDelta, setCommissionDelta] = useState(0); // Additive %

    const simulatedInput = {
        ...input,
        return_rate_pct: Math.max(0, input.return_rate_pct + returnRateDelta),
        ad_cost_per_sale: Math.max(0, input.ad_cost_per_sale + adCostDelta),
        commission_pct: Math.max(0, input.commission_pct + commissionDelta),
    };

    const originalResult = calculateProfit(input);
    const simulatedResult = calculateProfit(simulatedInput);

    const profitDiff = simulatedResult.monthly_net_profit - originalResult.monthly_net_profit;
    const marginDiff = simulatedResult.margin_pct - originalResult.margin_pct;

    const resetSimulation = () => {
        setReturnRateDelta(0);
        setAdCostDelta(0);
        setCommissionDelta(0);
    };

    const applyScenario = (type: 'optimistic' | 'pessimistic') => {
        if (type === 'optimistic') {
            const currentReturn = input.return_rate_pct;
            // Reduce return rate by 2% if possible
            setReturnRateDelta(currentReturn >= 2 ? -2 : -currentReturn);
            const currentAd = input.ad_cost_per_sale;
            // Reduce ad cost by 20%
            setAdCostDelta(-currentAd * 0.2);
            setCommissionDelta(0);
        } else {
            setReturnRateDelta(5); // Increase return rate by 5%
            setAdCostDelta(input.ad_cost_per_sale * 0.2); // Increase ad cost by 20%
            setCommissionDelta(0);
        }
    };

    return (
        <Card className="shadow-sm border">
            <CardHeader className="pb-3 border-b border-border/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-base font-bold">Senaryo Simülatörü</CardTitle>
                            <p className="text-xs text-muted-foreground">Parametreleri değiştirerek kârlılık üzerindeki etkiyi analiz et.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge
                            variant="outline"
                            className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            onClick={() => applyScenario('optimistic')}
                        >
                            İyi senaryo
                        </Badge>
                        <Badge
                            variant="outline"
                            className="cursor-pointer bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                            onClick={() => applyScenario('pessimistic')}
                        >
                            Kötü senaryo
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={resetSimulation}
                        >
                            Sıfırla
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 grid gap-8 lg:grid-cols-12 min-w-0">
                {/* Controls (Left - 7 cols) */}
                <div className="space-y-8 lg:col-span-7 border-r lg:pr-8 border-border/50">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-medium">İade Oranı Değişimi</Label>
                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${returnRateDelta > 0 ? 'bg-red-500/10 text-red-400' : returnRateDelta < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                    {returnRateDelta > 0 ? '+' : ''}{returnRateDelta}%
                                </span>
                            </div>
                            <Slider
                                value={[returnRateDelta]}
                                min={-10} max={20} step={0.5}
                                onValueChange={(v) => setReturnRateDelta(v[0])}
                                className="py-2"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">Yeni İade Oranı: %{simulatedInput.return_rate_pct.toFixed(1)}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-medium">Reklam Maliyeti (Birim)</Label>
                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${adCostDelta > 0 ? 'bg-red-500/10 text-red-400' : adCostDelta < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                    {adCostDelta > 0 ? '+' : ''}{formatCurrency(adCostDelta)}
                                </span>
                            </div>
                            <Slider
                                value={[adCostDelta]}
                                min={-50} max={100} step={1}
                                onValueChange={(v) => setAdCostDelta(v[0])}
                                className="py-2"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">Yeni Reklam Maliyeti: {formatCurrency(simulatedInput.ad_cost_per_sale)}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-medium">Komisyon Farkı</Label>
                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${commissionDelta > 0 ? 'bg-red-500/10 text-red-400' : commissionDelta < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                    {commissionDelta > 0 ? '+' : ''}{commissionDelta}%
                                </span>
                            </div>
                            <Slider
                                value={[commissionDelta]}
                                min={-5} max={10} step={0.1}
                                onValueChange={(v) => setCommissionDelta(v[0])}
                                className="py-2"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">Yeni Komisyon: %{simulatedInput.commission_pct.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                {/* Results Comparison (Right - 5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4 min-w-0">

                    {/* Main Profit Card */}
                    <div className="rounded-lg border border-border/30 bg-muted/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground">Simüle edilen net kâr</p>
                        <div className="mt-2 min-w-0 overflow-hidden">
                            {/* Clamp font size: min 24px, preferred 3.5vw, max 40px */}
                            <p className="text-3xl font-bold tracking-tight text-foreground truncate" style={{ lineHeight: 1.1 }}>
                                {formatCurrency(simulatedResult.monthly_net_profit)}
                            </p>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground line-through opacity-60 px-1.5 py-0.5 bg-muted rounded">
                                {formatCurrency(originalResult.monthly_net_profit)}
                            </span>
                            <span className={`font-bold px-1.5 py-0.5 rounded ${profitDiff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {profitDiff > 0 ? '+' : ''}{formatCurrency(profitDiff)}
                            </span>
                        </div>
                    </div>

                    {/* Margin Card & Decision */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-medium text-muted-foreground">Simüle Marj</p>
                                <span className={`text-xs font-bold ${marginDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {marginDiff > 0 ? '+' : ''}{marginDiff.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{formatPercent(simulatedResult.margin_pct)}</p>
                        </div>

                        <div className="rounded-xl border border-border/30 bg-muted/30 p-4 flex items-center justify-between gap-3">
                            <div>
                                {simulatedResult.monthly_net_profit < 0 ? (
                                    <Badge variant="destructive" className="mb-1">Riskli</Badge>
                                ) : simulatedResult.margin_pct < 10 ? (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-1">Dikkat</Badge>
                                ) : (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 mb-1">Uygun</Badge>
                                )}
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    {profitDiff < 0 ? "Kâr düşüşü bekleniyor." : "Kâr artışı öngörülüyor."}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={resetSimulation}>
                                    Sıfırla
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
=== END ===

=== FILE: components/analysis/campaign-simulator.tsx ===
'use client';

import { useState, useMemo } from 'react';
import { ProductInput, CalculationResult } from '@/types';
import { calculateProfit, n } from '@/utils/calculations';
import { formatCurrency } from '@/components/shared/format';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tag, Bookmark } from 'lucide-react';

interface Props {
  input: ProductInput;
  originalResult: CalculationResult;
}

interface SavedScenario {
  id: number;
  label: string;
  salePrice: number;
  netProfit: number;
  marginPct: number;
}

const DISCOUNT_PRESETS = [0, 5, 10, 15, 20, 25, 30, 40, 50];

// ─── küçük yardımcı bileşenler ───────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  informational = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  informational?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-border/20">
      <div className="min-w-0 pr-4">
        <p className={`text-sm font-medium leading-snug ${informational ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
          {informational && (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground border rounded px-1 py-0.5">
              Bilgi
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        disabled={informational}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'red' | 'neutral';
}) {
  const colorClass =
    highlight === 'green'
      ? 'text-emerald-400 font-semibold'
      : highlight === 'red'
      ? 'text-red-400 font-semibold'
      : 'font-medium';
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-base font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}

// ─── ana bileşen ─────────────────────────────────────────────────────────────

export function CampaignSimulator({ input, originalResult }: Props) {
  // Fiyat indirimi
  const [discountPct, setDiscountPct] = useState(0);

  // Trendyol
  const [trendyolFreeShipping, setTrendyolFreeShipping] = useState(false);
  const [bugunKargoda, setBugunKargoda] = useState(false);

  // Hepsiburada
  const [hepFreeShipping, setHepFreeShipping] = useState(false);
  const [hizliTeslimat, setHizliTeslimat] = useState(false);

  // n11
  const [n11FreeShipping, setN11FreeShipping] = useState(false);
  const [campaignComm, setCampaignComm] = useState(false);
  const [campaignCommRate, setCampaignCommRate] = useState(n(input.commission_pct));

  // Amazon TR
  const [couponPctEnabled, setCouponPctEnabled] = useState(false);
  const [couponPctValue, setCouponPctValue] = useState(5);
  const [couponFixedEnabled, setCouponFixedEnabled] = useState(false);
  const [couponFixedValue, setCouponFixedValue] = useState(0);

  // Kaydedilen senaryolar (sadece local state)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  const marketplace = input.marketplace;
  const basePrice = n(input.sale_price);
  const shippingCost = n(input.shipping_cost);

  // ── Simülasyon hesabı ──────────────────────────────────────────────────────
  const simResult = useMemo<CalculationResult>(() => {
    const newSalePrice = basePrice * (1 - discountPct / 100);
    const overrides: Partial<ProductInput> = { sale_price: newSalePrice };

    if (marketplace === 'trendyol' && bugunKargoda) {
      overrides.trendyol_service_fee = 5.49;
    }
    if (marketplace === 'hepsiburada' && hizliTeslimat) {
      overrides.trendyol_service_fee = 0;
    }
    if (marketplace === 'n11' && campaignComm) {
      overrides.commission_pct = campaignCommRate;
    }
    if (marketplace === 'amazon_tr') {
      let extra = n(input.other_cost, 0);
      if (couponPctEnabled) extra += newSalePrice * (couponPctValue / 100);
      if (couponFixedEnabled) extra += couponFixedValue;
      overrides.other_cost = extra;
    }

    return calculateProfit({ ...input, ...overrides });
  }, [
    input,
    marketplace,
    basePrice,
    discountPct,
    bugunKargoda,
    hizliTeslimat,
    campaignComm,
    campaignCommRate,
    couponPctEnabled,
    couponPctValue,
    couponFixedEnabled,
    couponFixedValue,
  ]);

  const profitDiff = simResult.unit_net_profit - originalResult.unit_net_profit;
  const monthlySales = n(input.monthly_sales_volume, 0);
  const monthlyImpact = simResult.unit_net_profit * monthlySales;

  const isLoss = simResult.unit_net_profit < 0;
  const isNearBreakeven = !isLoss && simResult.unit_net_profit <= 10 && simResult.unit_net_profit >= 0;
  const isLowMargin = !isLoss && !isNearBreakeven && simResult.margin_pct < 10;

  // ── Senaryo kaydetme ───────────────────────────────────────────────────────
  function handleSaveScenario() {
    const parts: string[] = [];
    if (discountPct > 0) parts.push(`%${discountPct} indirim`);
    if (marketplace === 'trendyol') {
      if (trendyolFreeShipping) parts.push('Bedava Kargo');
      if (bugunKargoda) parts.push('Bugün Kargoda');
    }
    if (marketplace === 'hepsiburada') {
      if (hepFreeShipping) parts.push('Bedava Kargo');
      if (hizliTeslimat) parts.push('Hızlı Teslimat');
    }
    if (marketplace === 'n11') {
      if (n11FreeShipping) parts.push('Bedava Kargo');
      if (campaignComm) parts.push(`%${campaignCommRate} kampanyalı komisyon`);
    }
    if (marketplace === 'amazon_tr') {
      if (couponPctEnabled) parts.push(`%${couponPctValue} kupon`);
      if (couponFixedEnabled) parts.push(`${couponFixedValue}₺ kupon`);
    }

    const newS: SavedScenario = {
      id: Date.now(),
      label: parts.length > 0 ? parts.join(' + ') : 'Değişiklik yok',
      salePrice: simResult.sale_price,
      netProfit: simResult.unit_net_profit,
      marginPct: simResult.margin_pct,
    };
    setSavedScenarios(prev => [newS, ...prev].slice(0, 3));
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-6">

      {/* Başlık */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Kampanya Simülatörü</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Farklı kampanya senaryolarında kârlılığınızı anlık simüle edin. Asıl analiz
          sonuçlarınız değişmez.
        </p>
      </div>

      {/* Fiyat İndirimi */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Fiyat İndirimi</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={70}
              value={discountPct}
              onChange={e =>
                setDiscountPct(Math.min(70, Math.max(0, Number(e.target.value) || 0)))
              }
              className="w-16 h-7 text-sm text-center"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <Slider
          min={0}
          max={70}
          step={1}
          value={[discountPct]}
          onValueChange={([v]) => setDiscountPct(v)}
        />
        <div className="flex flex-wrap gap-1.5">
          {DISCOUNT_PRESETS.map(pct => (
            <button
              key={pct}
              onClick={() => setDiscountPct(pct)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                discountPct === pct
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              %{pct}
            </button>
          ))}
        </div>
      </div>

      {/* Trendyol toggleları */}
      {marketplace === 'trendyol' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trendyol Kampanyaları
          </p>
          <ToggleRow
            label="Flash İndirim"
            description="Trendyol bu ürünü öne çıkarır, görünürlük artar. Fiyat indirimi yukarıdan ayarlanır."
            enabled={false}
            onChange={() => {}}
            informational
          />
          <ToggleRow
            label="Bedava Kargo Kampanyası"
            description={`Kargo bedelini sen karşılarsın. Maliyet: ${formatCurrency(shippingCost)} (girilen kargo bedeli)`}
            enabled={trendyolFreeShipping}
            onChange={setTrendyolFreeShipping}
          />
          {trendyolFreeShipping && (
            <div className="ml-12 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-300">
              ✓ {shippingCost > 0 ? `${formatCurrency(shippingCost)} kargo bedeli` : 'Kargo bedeli'} maliyet hesabına dahildir. Müşteri 0₺ öder.
            </div>
          )}
          <ToggleRow
            label='"Bugün Kargoda" Etiketi'
            description="Platform hizmet bedeli 8,49₺'den 5,49₺'ye düşer. Tasarruf: +3₺"
            enabled={bugunKargoda}
            onChange={setBugunKargoda}
          />
        </div>
      )}

      {/* Hepsiburada toggleları */}
      {marketplace === 'hepsiburada' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hepsiburada Kampanyaları
          </p>
          <ToggleRow
            label="Süper Fırsat Kampanyası"
            description="Fiyat indirimi gerektirir. Yukarıdan indirim oranını belirleyin."
            enabled={false}
            onChange={() => {}}
            informational
          />
          <ToggleRow
            label="Bedava Kargo"
            description={`Kargo bedelini sen karşılarsın. Maliyet: ${formatCurrency(shippingCost)}`}
            enabled={hepFreeShipping}
            onChange={setHepFreeShipping}
          />
          {hepFreeShipping && (
            <div className="ml-12 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-300">
              ✓ {shippingCost > 0 ? `${formatCurrency(shippingCost)} kargo bedeli` : 'Kargo bedeli'} maliyet hesabına dahildir. Müşteri 0₺ öder.
            </div>
          )}
          <ToggleRow
            label="Hızlı Teslimat (0-1 gün)"
            description="Servis bedeli 9,50₺ kalkar. Tasarruf: +9,50₺"
            enabled={hizliTeslimat}
            onChange={setHizliTeslimat}
          />
        </div>
      )}

      {/* n11 toggleları */}
      {marketplace === 'n11' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            n11 Kampanyaları
          </p>
          <div className="space-y-2">
            <ToggleRow
              label="Kampanyalı Komisyon"
              description="Platform kampanyasına katılırsan komisyon oranı düşebilir."
              enabled={campaignComm}
              onChange={setCampaignComm}
            />
            {campaignComm && (
              <div className="ml-12 flex items-center gap-2 mt-1">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  İndirimli Komisyon (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={campaignCommRate}
                  onChange={e =>
                    setCampaignCommRate(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-20 h-7 text-sm"
                />
              </div>
            )}
          </div>
          <ToggleRow
            label="Bedava Kargo"
            description={`Kargo bedelini sen karşılarsın. Maliyet: ${formatCurrency(shippingCost)}`}
            enabled={n11FreeShipping}
            onChange={setN11FreeShipping}
          />
          {n11FreeShipping && (
            <div className="ml-12 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-300">
              ✓ {shippingCost > 0 ? `${formatCurrency(shippingCost)} kargo bedeli` : 'Kargo bedeli'} maliyet hesabına dahildir. Müşteri 0₺ öder.
            </div>
          )}
        </div>
      )}

      {/* Amazon TR toggleları */}
      {marketplace === 'amazon_tr' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amazon TR Kampanyaları
          </p>
          <ToggleRow
            label="Lightning Deal (Flaş Teklif)"
            description="Amazon öne çıkarır, görünürlük artar. Fiyat indirimi zorunludur — yukarıdan ayarlayın."
            enabled={false}
            onChange={() => {}}
            informational
          />
          <div className="space-y-2">
            <ToggleRow
              label="Kupon (%)"
              description="Müşteriye yüzde indirim kuponu ver. Kupon maliyeti satıcıya yansır."
              enabled={couponPctEnabled}
              onChange={setCouponPctEnabled}
            />
            {couponPctEnabled && (
              <div className="ml-12 flex items-center gap-2 mt-1">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  Kupon İndirimi (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={70}
                  value={couponPctValue}
                  onChange={e =>
                    setCouponPctValue(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-20 h-7 text-sm"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <ToggleRow
              label="Kupon (₺ Sabit)"
              description="Müşteriye sabit tutarda kupon ver. Kupon maliyeti satıcıya yansır."
              enabled={couponFixedEnabled}
              onChange={setCouponFixedEnabled}
            />
            {couponFixedEnabled && (
              <div className="ml-12 flex items-center gap-2 mt-1">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  Kupon Tutarı (₺)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={couponFixedValue}
                  onChange={e =>
                    setCouponFixedValue(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-20 h-7 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sonuç Paneli */}
      <div className="rounded-lg border border-border/30 bg-muted/40 p-4 space-y-3">
        <p className="text-sm font-semibold">
          📊 {discountPct > 0 ? `%${discountPct} İndirim` : 'Mevcut Fiyat'} Senaryosu
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          <ResultRow label="Yeni Satış Fiyatı" value={formatCurrency(simResult.sale_price)} />
          <ResultRow label="Yeni Komisyon" value={formatCurrency(simResult.commission_amount)} />
          <ResultRow
            label="Yeni Net Kâr"
            value={formatCurrency(simResult.unit_net_profit)}
            highlight={simResult.unit_net_profit < 0 ? 'red' : simResult.unit_net_profit > 0 ? 'green' : 'neutral'}
          />
          <ResultRow label="Yeni Kâr Marjı" value={`${simResult.margin_pct.toFixed(1)}%`} />
          <ResultRow
            label="Kâr Değişimi"
            value={`${profitDiff >= 0 ? '+' : ''}${formatCurrency(profitDiff)}`}
            highlight={profitDiff >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* Uyarı sistemi */}
      {isLoss && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 flex items-start gap-2">
          <span className="shrink-0 mt-0.5">🔴</span>
          <p className="text-xs text-red-400">
            Bu kampanya konfigürasyonunda <strong>ZARAR ediyorsunuz!</strong>{' '}
            {formatCurrency(Math.abs(simResult.unit_net_profit))} zarar bekleniyor.
          </p>
        </div>
      )}
      {isNearBreakeven && (
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 flex items-start gap-2">
          <span className="shrink-0 mt-0.5">🟠</span>
          <p className="text-xs text-orange-400">
            Uyarı! Bu kampanyada neredeyse başabaş noktasındasınız.
          </p>
        </div>
      )}
      {isLowMargin && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 flex items-start gap-2">
          <span className="shrink-0 mt-0.5">🟡</span>
          <p className="text-xs text-yellow-400">
            Dikkat! Kâr marjınız <strong>%{simResult.margin_pct.toFixed(1)}</strong>&apos;e geriledi.
          </p>
        </div>
      )}

      {/* Özet satır */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm leading-relaxed">
          💡 <strong>Sonuç:</strong> Bu kampanya konfigürasyonunda birim başına{' '}
          <span
            className={
              simResult.unit_net_profit >= 0
                ? 'text-emerald-400 font-bold'
                : 'text-red-400 font-bold'
            }
          >
            {formatCurrency(simResult.unit_net_profit)}
          </span>{' '}
          {simResult.unit_net_profit >= 0 ? 'kâr edersiniz' : 'zarar edersiniz'}.
          {monthlySales > 0 && (
            <>
              {' '}Ayda {monthlySales} adet satarsanız toplam etki:{' '}
              <span
                className={
                  monthlyImpact >= 0
                    ? 'text-emerald-400 font-bold'
                    : 'text-red-400 font-bold'
                }
              >
                {monthlyImpact >= 0 ? '+' : ''}
                {formatCurrency(monthlyImpact)}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Senaryo Kaydet */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveScenario}
          className="gap-2 text-xs"
        >
          <Bookmark className="h-3.5 w-3.5" />
          Bu Senaryoyu Kaydet
        </Button>
        {savedScenarios.length > 0 && (
          <span className="text-xs text-muted-foreground">{savedScenarios.length}/3 senaryo kaydedildi</span>
        )}
      </div>

      {/* Kaydedilmiş Senaryolar */}
      {savedScenarios.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {savedScenarios.map((s, i) => (
            <div key={s.id} className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
              <p className="font-semibold line-clamp-2">
                Senaryo {savedScenarios.length - i}: {s.label}
              </p>
              <div className="flex justify-between text-muted-foreground">
                <span>Satış Fiyatı</span>
                <span>{formatCurrency(s.salePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Kâr</span>
                <span
                  className={
                    s.netProfit >= 0
                      ? 'text-emerald-400 font-medium'
                      : 'text-red-400 font-medium'
                  }
                >
                  {formatCurrency(s.netProfit)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Kâr Marjı</span>
                <span>{s.marginPct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
=== END ===

=== FILE: components/shared/collapsible-card.tsx ===
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CollapsibleCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export function CollapsibleCard({
    title,
    description,
    children,
    defaultOpen = true,
    className,
}: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn(
            "rounded-2xl border bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] transition-all duration-200",
            isOpen && "border-amber-600/40",
            className
        )}>
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.06)] transition-colors rounded-t-2xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold leading-none tracking-tight text-stone-50">{title}</h3>
                    {description && (
                        <p className="text-xs text-[rgba(255,255,255,0.5)]">{description}</p>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[rgba(255,255,255,0.5)]" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-[rgba(255,255,255,0.5)]" />
                    )}
                </Button>
            </div>

            {/* Content */}
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden">
                    <div className="p-4 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
=== END ===

=== FILE: components/shared/format.ts ===
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (!Number.isFinite(num)) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '%0,0';
  return `%${value.toFixed(1)}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('tr-TR').format(value);
}
=== END ===

=== FILE: lib/csv.ts ===
import { ProductInput, Marketplace } from '@/types';

const EXPECTED_COLUMNS = [
  'marketplace',
  'product_name',
  'monthly_sales_volume',
  'product_cost',
  'sale_price',
  'commission_pct',
  'shipping_cost',
  'packaging_cost',
  'ad_cost',
  'return_rate',
  'vat_pct',
];

export const CSV_TEMPLATE = `marketplace,product_name,monthly_sales_volume,product_cost,sale_price,commission_pct,shipping_cost,packaging_cost,ad_cost,return_rate,vat_pct
trendyol,Ornek Urun 1,100,120,249,18,25,5,10,8,20
hepsiburada,Ornek Urun 2,60,200,399,20,30,6,15,10,20
amazon_tr,Ornek Urun 4,80,180,449,17,28,5,12,6,20`;

const MARKETPLACE_MAP: Record<string, Marketplace> = {
  'trendyol': 'trendyol',
  'hepsiburada': 'hepsiburada',
  'n11': 'n11',
  'amazon_tr': 'amazon_tr',
  'amazon tr': 'amazon_tr',
  'amazontr': 'amazon_tr',
  'amazon': 'amazon_tr',
  'custom': 'custom',
  'ozel': 'custom',
  'özel': 'custom',
};

export function parseCSV(text: string): { data: ProductInput[]; errors: string[]; missingColumns: string[] } {
  const errors: string[] = [];
  const missingColumns: string[] = [];
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    return { data: [], errors: ['CSV dosyası en az bir başlık ve bir veri satırı içermelidir.'], missingColumns: [] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  for (const col of EXPECTED_COLUMNS) {
    if (!headers.includes(col)) {
      missingColumns.push(col);
    }
  }

  if (missingColumns.length > 0) {
    return {
      data: [],
      errors: missingColumns.map(col => `Eksik sütun: ${col}`),
      missingColumns
    };
  }

  const data: ProductInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length !== headers.length) {
      errors.push(`Satır ${i + 1}: Sütun sayısı uyuşmuyor (${headers.length} beklenirken ${values.length} bulundu).`);
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });

    const rawMp = row.marketplace?.toLowerCase().trim() || '';
    const marketplace = MARKETPLACE_MAP[rawMp];

    if (!marketplace) {
      errors.push(`Satır ${i + 1}: Geçersiz pazaryeri "${row.marketplace}". Kabul edilenler: trendyol, hepsiburada, n11, amazon_tr, custom`);
      continue;
    }

    const input: ProductInput = {
      marketplace,
      product_name: row.product_name || `Ürün ${i}`,
      monthly_sales_volume: parseFloat(row.monthly_sales_volume) || 0,
      product_cost: parseFloat(row.product_cost) || 0,
      sale_price: parseFloat(row.sale_price) || 0,
      commission_pct: parseFloat(row.commission_pct) || 0,
      shipping_cost: parseFloat(row.shipping_cost) || 0,
      packaging_cost: parseFloat(row.packaging_cost) || 0,
      ad_cost_per_sale: parseFloat(row.ad_cost) || 0,
      return_rate_pct: parseFloat(row.return_rate) || 0,
      vat_pct: parseFloat(row.vat_pct) || 20,
      other_cost: 0,
      payout_delay_days: 14,
    };

    data.push(input);
  }

  return { data, errors, missingColumns };
}

export function analysesToCSV(analyses: { input: ProductInput; result: { unit_net_profit: number; margin_pct: number; monthly_net_profit: number }; risk: { level: string } }[]): string {
  const headers = [
    'Pazaryeri', 'Ürün', 'Aylık Satış', 'Maliyet', 'Satış Fiyatı',
    'Komisyon %', 'Kargo', 'Paketleme', 'Reklam', 'İade %', 'KDV %',
    'Birim Kâr', 'Marj %', 'Aylık Kâr', 'Risk',
  ];

  const rows = analyses.map((a) => [
    a.input.marketplace,
    a.input.product_name,
    a.input.monthly_sales_volume,
    a.input.product_cost,
    a.input.sale_price,
    a.input.commission_pct,
    a.input.shipping_cost,
    a.input.packaging_cost,
    a.input.ad_cost_per_sale,
    a.input.return_rate_pct,
    a.input.vat_pct,
    a.result.unit_net_profit.toFixed(2),
    a.result.margin_pct.toFixed(1),
    a.result.monthly_net_profit.toFixed(2),
    a.risk.level,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function analysesToJSON(analyses: unknown[]): string {
  return JSON.stringify(analyses, null, 2);
}
=== END ===

=== FILE: lib/marketplace-data.ts ===

import { MarketplaceDefaults, Marketplace } from '@/types';

export const marketplaces: MarketplaceDefaults[] = [
  {
    key: 'trendyol',
    label: 'Trendyol',
    commission_pct: 18,
    return_rate_pct: 12, // ETBİS 2024 — kategori seçilmezse genel sektör ortalaması
    vat_pct: 20,
    payout_delay_days: 28
  },
  {
    key: 'hepsiburada',
    label: 'Hepsiburada',
    commission_pct: 20,
    return_rate_pct: 12,
    vat_pct: 20,
    payout_delay_days: 30
  },
  {
    key: 'n11',
    label: 'n11',
    commission_pct: 16,
    return_rate_pct: 10,
    vat_pct: 20,
    payout_delay_days: 21
  },
  {
    key: 'amazon_tr',
    label: 'Amazon TR',
    commission_pct: 17,
    return_rate_pct: 13, // Koşulsuz iade politikası nedeniyle +3 puan — genel ortalama 10+3
    vat_pct: 20,
    payout_delay_days: 14
  },
  {
    key: 'custom',
    label: 'Ozel Pazaryeri',
    commission_pct: 15,
    return_rate_pct: 10,
    vat_pct: 20,
    payout_delay_days: 30
  },
];

export function getMarketplaceDefaults(key: Marketplace): MarketplaceDefaults {
  return marketplaces.find((m) => m.key === key) || marketplaces[4];
}

export function getMarketplaceLabel(key: Marketplace): string {
  return marketplaces.find((m) => m.key === key)?.label || key;
}
=== END ===

=== FILE: lib/commission-categories.ts ===
import { Marketplace } from '@/types';

export interface CommissionCategory {
  label: string;
  commission_pct: number;
}

// Alias for backward compatibility
export type TrendyolCategory = CommissionCategory;

export const MARKETPLACE_CATEGORIES: Record<Marketplace, CommissionCategory[]> = {
  trendyol: [
    { label: 'Giyim & Moda', commission_pct: 20 },
    { label: 'Ayakkabı & Çanta', commission_pct: 20 },
    { label: 'Spor & Outdoor', commission_pct: 18 },
    { label: 'Kozmetik & Kişisel Bakım', commission_pct: 14 },
    { label: 'Ev & Yaşam', commission_pct: 14 },
    { label: 'Mobilya', commission_pct: 13 },
    { label: 'Anne & Bebek', commission_pct: 13 },
    { label: 'Oyuncak', commission_pct: 13 },
    { label: 'Otomotiv', commission_pct: 10 },
    { label: 'Elektronik', commission_pct: 8 },
    { label: 'Telefon & Aksesuar', commission_pct: 8 },
    { label: 'Bilgisayar & Tablet', commission_pct: 8 },
    { label: 'Kitap & Kırtasiye', commission_pct: 8 },
    { label: 'Süpermarket & Gıda', commission_pct: 5 },
    { label: 'Diğer', commission_pct: 14 },
  ],
  hepsiburada: [
    { label: 'Giyim & Moda', commission_pct: 18 },
    { label: 'Ayakkabı', commission_pct: 18 },
    { label: 'Kozmetik', commission_pct: 15 },
    { label: 'Ev & Yaşam', commission_pct: 15 },
    { label: 'Spor & Outdoor', commission_pct: 15 },
    { label: 'Anne & Bebek', commission_pct: 14 },
    { label: 'Oyuncak', commission_pct: 14 },
    { label: 'Elektronik', commission_pct: 9 },
    { label: 'Telefon & Aksesuar', commission_pct: 9 },
    { label: 'Bilgisayar', commission_pct: 8 },
    { label: 'Kitap', commission_pct: 8 },
    { label: 'Süpermarket', commission_pct: 8 },
    { label: 'Diğer', commission_pct: 13 },
  ],
  n11: [
    { label: 'Giyim & Moda', commission_pct: 16 },
    { label: 'Ayakkabı', commission_pct: 16 },
    { label: 'Kozmetik', commission_pct: 14 },
    { label: 'Ev & Yaşam', commission_pct: 14 },
    { label: 'Spor & Outdoor', commission_pct: 14 },
    { label: 'Anne & Bebek', commission_pct: 13 },
    { label: 'Oyuncak', commission_pct: 13 },
    { label: 'Elektronik', commission_pct: 8 },
    { label: 'Telefon & Aksesuar', commission_pct: 8 },
    { label: 'Kitap', commission_pct: 8 },
    { label: 'Diğer', commission_pct: 12 },
  ],
  amazon_tr: [
    { label: 'Giyim & Moda', commission_pct: 15 },
    { label: 'Ayakkabı', commission_pct: 15 },
    { label: 'Kozmetik', commission_pct: 15 },
    { label: 'Ev & Yaşam', commission_pct: 15 },
    { label: 'Spor & Outdoor', commission_pct: 15 },
    { label: 'Anne & Bebek', commission_pct: 15 },
    { label: 'Oyuncak', commission_pct: 15 },
    { label: 'Elektronik', commission_pct: 8 },
    { label: 'Telefon & Aksesuar', commission_pct: 8 },
    { label: 'Bilgisayar & Tablet', commission_pct: 7 },
    { label: 'Kitap', commission_pct: 15 },
    { label: 'Diğer', commission_pct: 15 },
  ],
  custom: [
    { label: 'Diğer', commission_pct: 15 },
  ],
};

export const N11_EXTRA_FEE_PCT = 1.87;
export const N11_MARKETING_FEE_PCT = 1.20;
export const N11_MARKETPLACE_FEE_PCT = 0.67;

/**
 * Amazon TR koşulsuz iade politikası nedeniyle diğer pazaryerlerine kıyasla
 * ~%3 ek iade oranı uygulanır.
 */
export const AMAZON_TR_RETURN_BONUS = 3;

/**
 * Kategori bazlı beklenen iade oranı varsayılanları (%).
 * Kaynak: T.C. Ticaret Bakanlığı 2024 ETBİS raporu + sektör ortalamaları.
 *
 * Eşleşme: birden fazla pazaryerindeki benzer etiketler aynı anahtara düşer.
 */
export const CATEGORY_RETURN_RATES: Record<string, number> = {
  // Giyim / Moda
  'Giyim & Moda':           28,
  // Ayakkabı
  'Ayakkabı':               30,
  'Ayakkabı & Çanta':       30,
  // Çanta / Aksesuar
  'Çanta & Aksesuar':       18,
  // Kozmetik
  'Kozmetik & Kişisel Bakım': 10,
  'Kozmetik':               10,
  // Spor
  'Spor & Outdoor':         18,
  // Elektronik
  'Elektronik':             10,
  // Telefon
  'Telefon & Aksesuar':     12,
  // Bilgisayar
  'Bilgisayar & Tablet':    10,
  'Bilgisayar':             10,
  // Ev
  'Ev & Yaşam':             10,
  // Mobilya
  'Mobilya':                7,
  // Anne Bebek
  'Anne & Bebek':           7,
  // Oyuncak
  'Oyuncak':                10,
  // Kitap
  'Kitap & Kırtasiye':      3,
  'Kitap':                  3,
  // Süpermarket
  'Süpermarket & Gıda':     2,
  'Süpermarket':            2,
  // Otomotiv
  'Otomotiv':               7,
  // Diğer / fallback
  'Diğer':                  10,
};

/**
 * Kategori ve pazaryerine göre beklenen iade oranı döndürür.
 * Amazon TR'de +3 puan eklenir.
 */
export function getCategoryReturnRate(marketplace: Marketplace, categoryLabel: string): number {
  const base = CATEGORY_RETURN_RATES[categoryLabel] ?? 10;
  return marketplace === 'amazon_tr' ? base + AMAZON_TR_RETURN_BONUS : base;
}

export function getMarketplaceCategories(marketplace: Marketplace): CommissionCategory[] {
  return MARKETPLACE_CATEGORIES[marketplace] ?? MARKETPLACE_CATEGORIES.custom;
}

export function getCategoryCommission(marketplace: Marketplace, label: string): number | undefined {
  return MARKETPLACE_CATEGORIES[marketplace]?.find((c) => c.label === label)?.commission_pct;
}

// Backward compat exports
export const trendyolCategories = MARKETPLACE_CATEGORIES.trendyol;
export function getTrendyolCategoryCommission(label: string): number | undefined {
  return getCategoryCommission('trendyol', label);
}
=== END ===

=== FILE: lib/commission-rates.ts ===
import { supabase } from '@/lib/supabaseClient';
import { Marketplace } from '@/types';

export interface CommissionRate {
  marketplace: Marketplace;
  category: string;
  rate: number;
  updated_at: string;
}

export interface CommissionRateRow {
  id?: string;
  user_id: string;
  marketplace: string;
  category: string;
  rate: number;
  updated_at: string;
}

export async function getUserCommissionRates(userId: string): Promise<CommissionRate[]> {
  const { data, error } = await supabase
    .from('commission_rates')
    .select('marketplace, category, rate, updated_at')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data as CommissionRate[];
}

export async function getLastRatesUpdate(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('commission_rates')
    .select('updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.updated_at;
}

export async function upsertCommissionRates(
  userId: string,
  rates: Array<{ marketplace: string; category: string; rate: number }>
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();
  const rows: CommissionRateRow[] = rates.map((r) => ({
    user_id: userId,
    marketplace: r.marketplace,
    category: r.category,
    rate: r.rate,
    updated_at: now,
  }));

  const { error } = await supabase
    .from('commission_rates')
    .upsert(rows, { onConflict: 'user_id,marketplace,category' });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export function buildRateMap(rates: CommissionRate[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rates) {
    map.set(`${r.marketplace}::${r.category}`, r.rate);
  }
  return map;
}

export function lookupRate(
  rateMap: Map<string, number>,
  marketplace: string,
  category: string
): number | undefined {
  return rateMap.get(`${marketplace}::${category}`);
}
=== END ===
