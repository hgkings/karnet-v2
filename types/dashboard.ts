// ----------------------------------------------------------------
// Dashboard Analysis Adapter
// v1 dashboard components expect nested shape (input/result/risk).
// v2 API returns flat AnalysisRow with JSONB inputs/outputs.
// This adapter bridges the two.
// ----------------------------------------------------------------

import type { RiskLevel } from '@/types';

export interface DashboardAnalysisInput {
  product_name: string;
  marketplace: string;
  sale_price: number;
  product_cost: number;
  shipping_cost: number;
  packaging_cost: number;
  ad_cost_per_sale: number;
  other_cost: number;
  commission_pct: number;
  return_rate_pct: number;
  payout_delay_days: number;
  vat_pct: number;
  monthly_sales_volume: number;
}

export interface DashboardAnalysisResult {
  unit_net_profit: number;
  margin_pct: number;
  monthly_net_profit: number;
  monthly_revenue: number;
  monthly_total_cost: number;
}

export interface DashboardAnalysisRisk {
  level: RiskLevel;
  score: number;
}

export interface DashboardAnalysis {
  id: string;
  createdAt: string;
  input: DashboardAnalysisInput;
  result: DashboardAnalysisResult;
  risk: DashboardAnalysisRisk;
}

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

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

export function toDashboardAnalysis(raw: RawAnalysisRow): DashboardAnalysis {
  const i = raw.inputs;
  const o = raw.outputs;

  return {
    id: raw.id,
    createdAt: raw.created_at ?? new Date().toISOString(),
    input: {
      product_name: raw.product_name,
      marketplace: raw.marketplace,
      sale_price: num(i.salePrice ?? i.sale_price),
      product_cost: num(i.productCost ?? i.product_cost),
      shipping_cost: num(i.shippingCost ?? i.shipping_cost),
      packaging_cost: num(i.packagingCost ?? i.packaging_cost),
      ad_cost_per_sale: num(i.adCostPerSale ?? i.ad_cost_per_sale),
      other_cost: num(i.otherCost ?? i.other_cost),
      commission_pct: num(i.commissionPct ?? i.commission_pct),
      return_rate_pct: num(i.returnRatePct ?? i.return_rate_pct),
      vat_pct: num(i.vatPct ?? i.vat_pct),
      monthly_sales_volume: num(i.monthlySalesVolume ?? i.monthly_sales_volume),
      payout_delay_days: num(i.payoutDelayDays ?? i.payout_delay_days),
    },
    result: {
      unit_net_profit: num(o.unitNetProfit ?? o.unit_net_profit),
      margin_pct: num(o.marginPercent ?? o.margin_pct),
      monthly_net_profit: num(o.monthlyNetProfit ?? o.monthly_net_profit),
      monthly_revenue: num(o.monthlyRevenue ?? o.monthly_revenue),
      monthly_total_cost: num(o.monthlyTotalCost ?? o.monthly_total_cost),
    },
    risk: {
      level: raw.risk_level as RiskLevel,
      score: raw.risk_score,
    },
  };
}
