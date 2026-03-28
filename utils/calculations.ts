import type { DashboardAnalysisInput } from '@/types/dashboard';

/**
 * Bir ürünün kârlılığını koruyarak harcayabileceği maksimum reklam maliyetini hesaplar.
 * Formül: Satış fiyatı - tüm maliyetler (reklam hariç) = reklam tavanı
 */
export function calculateAdCeiling(input: DashboardAnalysisInput): number {
  const { sale_price, product_cost, shipping_cost, packaging_cost, other_cost, commission_pct, return_rate_pct, vat_pct } = input;

  if (sale_price <= 0) return 0;

  const commissionAmount = sale_price * (commission_pct / 100);
  const returnLoss = sale_price * (return_rate_pct / 100);
  const vatAmount = sale_price * (vat_pct / 100);
  const totalCostExAds = product_cost + shipping_cost + packaging_cost + other_cost + commissionAmount + returnLoss + vatAmount;

  return Math.max(0, sale_price - totalCostExAds);
}
