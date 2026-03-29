'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';

type RiskLevel = 'safe' | 'moderate' | 'high';

export function GeneralRiskCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('safe');
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = user ? isProUser(user) : false;

  useEffect(() => {
    if (!user || !isPro) return;

    const checkRisk = async () => {
      let level: RiskLevel = 'safe';
      const newReasons: string[] = [];

      // Risk API entegrasyonu tamamlandığında buraya fetch('/api/risk/check') eklenecek.
      // Şu an için statik güvenli durum döndürülüyor.

      if (newReasons.length === 0) {
        newReasons.push('Finansal durumunuz şu an dengeli görünüyor.');
      }

      setRiskLevel(level);
      setReasons(newReasons);
      setLoading(false);
    };

    checkRisk();
  }, [user, isPro]);

  if (!isPro) return null;
  if (loading) return null;

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
