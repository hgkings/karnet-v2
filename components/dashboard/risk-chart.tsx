'use client';

import type { DashboardAnalysis } from '@/types/dashboard';
import type { RiskLevel } from '@/types';

interface RiskChartProps {
  analyses: DashboardAnalysis[];
}

const RISK_COLORS: Record<RiskLevel, { color: string; label: string }> = {
  safe: { color: '#22c55e', label: 'Güvenli' },
  moderate: { color: '#f59e0b', label: 'Orta' },
  risky: { color: '#f97316', label: 'Riskli' },
  dangerous: { color: '#ef4444', label: 'Tehlikeli' },
};

export function RiskChart({ analyses }: RiskChartProps) {
  const counts: Record<RiskLevel, number> = {
    safe: 0,
    moderate: 0,
    risky: 0,
    dangerous: 0,
  };

  analyses.forEach((a) => {
    counts[a.risk.level]++;
  });

  const total = analyses.length || 1;
  const levels: RiskLevel[] = ['safe', 'moderate', 'risky', 'dangerous'];

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <h3 className="text-base font-bold text-foreground mb-6">Risk Dağılımı</h3>
      <div className="space-y-5">
        {levels.map((level) => {
          const config = RISK_COLORS[level];
          const pct = (counts[level] / total) * 100;
          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="text-muted-foreground font-medium">{counts[level]} ürün</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
