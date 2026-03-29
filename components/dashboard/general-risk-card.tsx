'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';

type RiskLevel = 'safe' | 'moderate' | 'high';

interface GeneralRiskCardProps {
  analyses?: Array<{
    result: { margin_pct: number; monthly_net_profit: number };
    risk: { level: string; score: number };
  }>;
}

export function GeneralRiskCard({ analyses = [] }: GeneralRiskCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const isPro = user ? isProUser(user) : false;

  // Analiz verisinden risk hesapla
  let riskLevel: RiskLevel = 'safe';
  const reasons: string[] = [];

  if (analyses.length > 0) {
    const riskyCount = analyses.filter(a => a.risk.level === 'risky' || a.risk.level === 'dangerous').length;
    const negativeCount = analyses.filter(a => a.result.monthly_net_profit < 0).length;
    const avgMargin = analyses.reduce((s, a) => s + a.result.margin_pct, 0) / analyses.length;

    if (riskyCount > 0) {
      reasons.push(`${riskyCount} ürün yüksek risk taşıyor.`);
      riskLevel = riskyCount >= 3 ? 'high' : 'moderate';
    }
    if (negativeCount > 0) {
      reasons.push(`${negativeCount} ürün zararda.`);
      if (negativeCount >= 2) riskLevel = 'high';
      else if (riskLevel === 'safe') riskLevel = 'moderate';
    }
    if (avgMargin < 5 && avgMargin !== 0) {
      reasons.push(`Ortalama marj düşük (%${avgMargin.toFixed(1)}).`);
      if (riskLevel === 'safe') riskLevel = 'moderate';
    }
  }

  if (reasons.length === 0) {
    reasons.push('Finansal durumunuz şu an dengeli görünüyor.');
  }

  if (!isPro && analyses.length === 0) return null;

  const styles = {
    safe: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: ShieldCheck,
      label: 'Düşük Risk',
      btn: 'text-emerald-400 hover:text-emerald-300',
    },
    moderate: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: AlertTriangle,
      label: 'Orta Risk',
      btn: 'text-amber-400 hover:text-amber-300',
    },
    high: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: AlertOctagon,
      label: 'Yüksek Risk',
      btn: 'text-red-400 hover:text-red-300',
    },
  };

  const style = styles[riskLevel];
  const Icon = style.icon;

  return (
    <Card className={`shadow-sm border-l-4 ${style.border} ${style.bg}`}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={`h-5 w-5 ${style.text}`} />
            Risk Durumu
          </CardTitle>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-black/20 ${style.text} border-current opacity-80`}
          >
            {style.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-1 mb-3">
          {reasons.slice(0, 2).map((r, i) => (
            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" />
              {r}
            </li>
          ))}
        </ul>

        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-0 text-xs gap-1 hover:bg-transparent ${style.btn}`}
          onClick={() => router.push('/cash-plan')}
        >
          Nakit Planını İncele <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
