'use client';

import { useState } from 'react';
import { TrendingDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard } from '@/components/shared/kpi-card';
import { apiClient } from '@/lib/api/client';

function formatTRY(v: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

export default function BreakevenPage() {
  const [salePrice, setSalePrice] = useState('');
  const [productCost, setProductCost] = useState('');
  const [commissionPct, setCommissionPct] = useState('18');
  const [shippingCost, setShippingCost] = useState('0');
  const [vatPct, setVatPct] = useState('20');
  const [returnRatePct, setReturnRatePct] = useState('12');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ breakevenPrice: number; unitNetProfit: number; marginPercent: number } | null>(null);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const input = {
        productName: 'Başabaş Hesaplama',
        marketplace: 'trendyol',
        salePrice: parseFloat(salePrice) || 0,
        productCost: parseFloat(productCost) || 0,
        shippingCost: parseFloat(shippingCost) || 0,
        packagingCost: 0, adCostPerSale: 0, otherCost: 0,
        commissionPct: parseFloat(commissionPct) || 0,
        returnRatePct: parseFloat(returnRatePct) || 0,
        vatPct: parseFloat(vatPct) || 20,
        monthlySalesVolume: 100, payoutDelayDays: 28,
        serviceFeeAmount: 8.49, n11ExtraPct: 0,
      };
      const res = await apiClient.post<Record<string, unknown>>('/api/analyses', input);
      if (res.success && res.data) {
        const d = res.data as Record<string, unknown>;
        const outputs = (d.outputs ?? d) as Record<string, unknown>;
        setResult({
          breakevenPrice: (outputs.breakeven_price ?? outputs.breakevenPrice ?? 0) as number,
          unitNetProfit: (outputs.unit_net_profit ?? outputs.unitNetProfit ?? 0) as number,
          marginPercent: (outputs.margin_pct ?? outputs.marginPercent ?? 0) as number,
        });
      }
    } catch {
      toast.error('Hesaplama yapılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Başabaş Hesaplayıcı</h1>
        <p className="text-muted-foreground text-sm">Zarara geçmeden satış yapabileceğiniz minimum fiyatı bulun</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maliyet Bilgileri</CardTitle>
          <CardDescription>Ürün bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Satış Fiyatı (₺) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Ürün Maliyeti (₺) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" min="0" value={productCost} onChange={(e) => setProductCost(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Komisyon (%)</Label>
                <Input type="number" step="0.1" min="0" max="100" value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kargo (₺)</Label>
                <Input type="number" step="0.01" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>KDV (%)</Label>
                <Input type="number" step="1" min="0" max="100" value={vatPct} onChange={(e) => setVatPct(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>İade Oranı (%)</Label>
                <Input type="number" step="0.1" min="0" max="100" value={returnRatePct} onChange={(e) => setReturnRatePct(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }} className="text-white font-semibold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hesapla
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Başabaş Fiyatı" value={isFinite(result.breakevenPrice) ? formatTRY(result.breakevenPrice) : '∞'} icon={TrendingDown} />
          <KPICard title="Birim Kâr" value={formatTRY(result.unitNetProfit)} icon={TrendingDown} trend={result.unitNetProfit >= 0 ? 'up' : 'down'} />
          <KPICard title="Kâr Marjı" value={`%${result.marginPercent.toFixed(1)}`} icon={TrendingDown} trend={result.marginPercent >= 0 ? 'up' : 'down'} />
        </div>
      )}
    </div>
  );
}
