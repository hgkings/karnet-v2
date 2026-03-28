'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface AnalysisRow {
  id: string;
  product_name: string;
  marketplace: string;
  risk_score: number;
  risk_level: string;
  outputs: Record<string, unknown>;
  created_at: string;
}

interface MarketplaceStatus {
  id: string;
  marketplace: string;
  status: string;
  store_name: string | null;
  last_sync_at: string | null;
}

interface DashboardData {
  analyses: AnalysisRow[];
  trendyolStatus: MarketplaceStatus[];
  totalProfit: number;
  totalRevenue: number;
  avgMargin: number;
  riskyCount: number;
  mostProfitable: AnalysisRow | null;
  loading: boolean;
  error: string | null;
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    analyses: [],
    trendyolStatus: [],
    totalProfit: 0,
    totalRevenue: 0,
    avgMargin: 0,
    riskyCount: 0,
    mostProfitable: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [analysesRes, tyRes] = await Promise.all([
        apiClient.get<AnalysisRow[]>('/api/analyses'),
        apiClient.get<MarketplaceStatus[]>('/api/marketplace/trendyol').catch(() => ({ data: [] as MarketplaceStatus[], success: true })),
      ]);

      const analyses = (analysesRes.data ?? []) as AnalysisRow[];
      const trendyolStatus = (tyRes.data ?? []) as MarketplaceStatus[];

      // Hesaplamalar
      let totalProfit = 0;
      let totalRevenue = 0;
      let marginSum = 0;
      let riskyCount = 0;
      let mostProfitable: AnalysisRow | null = null;
      let maxProfit = -Infinity;

      for (const a of analyses) {
        const profit = num(a.outputs?.monthly_net_profit ?? a.outputs?.monthlyNetProfit);
        const revenue = num(a.outputs?.monthly_revenue ?? a.outputs?.monthlyRevenue);
        const margin = num(a.outputs?.margin_pct ?? a.outputs?.marginPercent);
        const unitProfit = num(a.outputs?.unit_net_profit ?? a.outputs?.unitNetProfit);

        totalProfit += profit;
        totalRevenue += revenue;
        marginSum += margin;

        if (a.risk_level === 'risky' || a.risk_level === 'dangerous') {
          riskyCount++;
        }

        if (unitProfit > maxProfit) {
          maxProfit = unitProfit;
          mostProfitable = a;
        }
      }

      const avgMargin = analyses.length > 0 ? marginSum / analyses.length : 0;

      setData({
        analyses,
        trendyolStatus,
        totalProfit,
        totalRevenue,
        avgMargin,
        riskyCount,
        mostProfitable,
        loading: false,
        error: null,
      });
    } catch {
      setData(prev => ({ ...prev, loading: false, error: 'Veriler yüklenirken bir hata oluştu.' }));
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { ...data, refresh };
}
