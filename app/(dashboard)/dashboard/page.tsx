'use client';

import { useState, useEffect, useCallback } from 'react';
import { toDashboardAnalysis } from '@/types/dashboard';
import type { DashboardAnalysis } from '@/types/dashboard';
import { analysesApi } from '@/lib/api/analyses';
import { KPICard } from '@/components/shared/kpi-card';
import { ProductsTable } from '@/components/dashboard/products-table';
import { RiskChart } from '@/components/dashboard/risk-chart';
import { ProfitTrendChart } from '@/components/dashboard/profit-trend-chart';
import { ParetoChart } from '@/components/dashboard/pareto-chart';
import { PazaryeriIstatistikKarti } from '@/components/shared/PazaryeriIstatistikKarti';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { TrendingUp, Percent, AlertTriangle, Star, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GeneralRiskCard } from '@/components/dashboard/general-risk-card';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';

interface RawAnalysisRow {
  id: string;
  product_name: string;
  marketplace: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  risk_score: number;
  risk_level: string;
  created_at: string;
}

interface ConnStatus {
  status: string;
  seller_id?: string;
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<DashboardAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const [trendyolConn, setTrendyolConn] = useState<ConnStatus>({ status: 'disconnected' });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analysesApi.list();
      const raw = (res.data ?? []) as unknown as RawAnalysisRow[];
      setAnalyses(raw.map(toDashboardAnalysis));
    } catch {
      toast.error('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    fetch('/api/marketplace/trendyol')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setTrendyolConn({ status: d.status ?? 'disconnected', seller_id: d.seller_id });
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await analysesApi.delete(id);
      if (res.success) {
        toast.success('Analiz silindi.');
        await refresh();
      } else {
        toast.error('Silme işlemi başarısız.');
      }
    } catch {
      toast.error('Hata oluştu.');
    }
  };

  const totalProfit = analyses.reduce((sum, a) => sum + a.result.monthly_net_profit, 0);
  const avgMargin =
    analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.result.margin_pct, 0) / analyses.length
      : 0;
  const riskyCount = analyses.filter(
    (a) => a.risk.level === 'risky' || a.risk.level === 'dangerous'
  ).length;
  const mostProfitable: DashboardAnalysis | null =
    analyses.length > 0
      ? analyses.reduce(
          (best, a) => (a.result.monthly_net_profit > best.result.monthly_net_profit ? a : best),
        )
      : null;

  if (loading && analyses.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 pb-10">
      {/* Header with Risk Card */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
        <div className="space-y-1.5 w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Panel</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ürün portföyünüzün anlık karlılık ve risk durumu.
          </p>
        </div>
        <div className="w-full lg:w-auto min-w-0 lg:min-w-[300px]">
          <GeneralRiskCard />
        </div>
      </div>

      {/* Actionable Recommendations */}
      <RecommendationsPanel analyses={analyses} />

      {/* Dashboard KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Aylık Tahmini Kâr"
          value={formatCurrency(totalProfit)}
          subtitle={totalProfit >= 0 ? 'Toplam net kâr' : 'Toplam zarar'}
          icon={TrendingUp}
          trend={totalProfit >= 0 ? 'up' : 'down'}
        />
        <KPICard
          title="Ortalama Marj"
          value={formatPercent(avgMargin)}
          subtitle={`${analyses.length} aktif ürün`}
          icon={Percent}
          trend={avgMargin >= 15 ? 'up' : avgMargin >= 5 ? 'neutral' : 'down'}
        />
        <KPICard
          title="Kritik Ürün"
          value={riskyCount.toString()}
          subtitle={riskyCount > 0 ? 'Acil aksiyon gerekli' : 'Risk bulunamadı'}
          icon={AlertTriangle}
          trend={riskyCount > 0 ? 'down' : 'up'}
        />
        <KPICard
          title="En Karlı Ürün"
          value={mostProfitable ? mostProfitable.input.product_name : '-'}
          subtitle={
            mostProfitable
              ? formatCurrency(mostProfitable.result.monthly_net_profit)
              : 'Henüz veri yok'
          }
          icon={Star}
        />
      </div>

      {/* Pazaryeri İstatistikleri */}
      <PazaryeriIstatistikKarti
        bagliPazaryerleri={[
          { id: 'trendyol', status: trendyolConn.status, supplier_id: trendyolConn.seller_id },
          { id: 'hepsiburada', status: 'disconnected' },
        ]}
      />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitTrendChart analyses={analyses} />
        </div>
        <div className="space-y-6">
          <ParetoChart analyses={analyses} />
          <RiskChart analyses={analyses} />
        </div>
      </div>

      {/* Products Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Son Analizler</h2>
          </div>
        </div>
        <ProductsTable analyses={analyses.slice(0, 10)} onDelete={handleDelete} />
      </div>
    </div>
  );
}
