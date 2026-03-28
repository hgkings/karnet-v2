'use client';

import Link from 'next/link';
import { PlusCircle, TrendingUp, BarChart3, AlertTriangle, Star, Loader2, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/shared/kpi-card';
import { RiskBadge } from '@/components/shared/risk-badge';
import { useDashboard } from '@/hooks/use-dashboard';

function formatTRY(v: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

export default function DashboardPage() {
  const {
    analyses, totalProfit, avgMargin, riskyCount,
    mostProfitable, loading, error, refresh,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Kâr analizinizin özeti</p>
        </div>
        <Link href="/analysis">
          <Button className="text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Analiz
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Aylık Net Kâr"
          value={formatTRY(totalProfit)}
          icon={TrendingUp}
          trend={totalProfit >= 0 ? 'up' : 'down'}
          subtitle="Tüm ürünler toplamı"
        />
        <KPICard
          title="Ortalama Marj"
          value={`%${avgMargin.toFixed(1)}`}
          icon={BarChart3}
          trend={avgMargin >= 10 ? 'up' : avgMargin >= 0 ? 'neutral' : 'down'}
          subtitle={`${analyses.length} ürün ortalaması`}
        />
        <KPICard
          title="Kritik Ürün"
          value={String(riskyCount)}
          icon={AlertTriangle}
          trend={riskyCount > 0 ? 'down' : 'neutral'}
          subtitle="Riskli / tehlikeli"
        />
        <KPICard
          title="En Kârlı Ürün"
          value={mostProfitable ? formatTRY(num(mostProfitable.outputs?.unit_net_profit ?? mostProfitable.outputs?.unitNetProfit)) : '—'}
          icon={Star}
          trend="up"
          subtitle={mostProfitable?.product_name ?? 'Henüz analiz yok'}
        />
      </div>

      {/* Empty state */}
      {analyses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Henüz analiz yok</h3>
            <p className="text-muted-foreground text-sm mb-4">
              İlk ürün analizinizi oluşturarak kârlılığınızı keşfedin.
            </p>
            <Link href="/analysis">
              <Button>Yeni Analiz Oluştur</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Son Analizler */}
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Son Analizler</CardTitle>
              <Link href="/products">
                <Button variant="outline" size="sm" className="text-xs">Tümünü Gör</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="hidden sm:table-cell">Pazaryeri</TableHead>
                    <TableHead className="text-right">Birim Kâr</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Marj</TableHead>
                    <TableHead className="hidden sm:table-cell">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.slice(0, 10).map((a) => {
                    const profit = num(a.outputs?.unit_net_profit ?? a.outputs?.unitNetProfit);
                    const margin = num(a.outputs?.margin_pct ?? a.outputs?.marginPercent);
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Link href={`/analysis/${a.id}`} className="font-medium hover:underline text-sm">
                            {a.product_name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize text-sm text-muted-foreground">
                          {a.marketplace}
                        </TableCell>
                        <TableCell className={`text-right text-sm font-semibold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatTRY(profit)}
                        </TableCell>
                        <TableCell className={`text-right hidden md:table-cell text-sm ${margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          %{margin.toFixed(1)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RiskBadge level={a.risk_level as 'safe' | 'moderate' | 'risky' | 'dangerous'} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
