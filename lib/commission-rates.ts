// ----------------------------------------------------------------
// Commission Rates — DB-SAFE version.
// All DB queries replaced with API calls via fetch('/api/...').
// ----------------------------------------------------------------

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
  try {
    const res = await fetch(`/api/commission-rates?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? data ?? []) as CommissionRate[];
  } catch {
    return [];
  }
}

export async function getLastRatesUpdate(userId: string): Promise<string | null> {
  try {
    const rates = await getUserCommissionRates(userId);
    if (rates.length === 0) return null;
    // Find most recent updated_at
    const sorted = rates.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    return sorted[0]?.updated_at ?? null;
  } catch {
    return null;
  }
}

export async function upsertCommissionRates(
  userId: string,
  rates: Array<{ marketplace: string; category: string; rate: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/commission-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rates }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error ?? 'Komisyon oranları kaydedilemedi.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Ağ hatası.' };
  }
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
