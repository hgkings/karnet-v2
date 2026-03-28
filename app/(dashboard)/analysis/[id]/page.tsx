'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, TrendingUp, BarChart3, DollarSign, Target, Calendar, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/shared/kpi-card';
import { RiskBadge } from '@/components/shared/risk-badge';
import { apiClient } from '@/lib/api/client';

interface AnalysisDetail {
  id: string;
  product_name: string;
  marketplace: string;
  risk_score: number;
  risk_level: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  created_at: string;
}

function formatTRY(v: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<AnalysisDetail>(`/api/analyses/${id}`);
      setAnalysis((res.data ?? null) as AnalysisDetail | null);
    } catch {
      setError('Analiz yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchAnalysis(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive mb-3">{error ?? 'Analiz bulunamadı.'}</p>
          <Button variant="outline" size="sm" onClick={fetchAnalysis}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  const o = analysis.outputs;
  const unitProfit = num(o.unit_net_profit ?? o.unitNetProfit);
  const margin = num(o.margin_pct ?? o.marginPercent);
  const monthlyProfit = num(o.monthly_net_profit ?? o.monthlyNetProfit);
  const monthlyRevenue = num(o.monthly_revenue ?? o.monthlyRevenue);
  const breakeven = num(o.breakeven_price ?? o.breakevenPrice);
  const salePrice = num(o.sale_price ?? o.salePrice ?? analysis.inputs?.salePrice ?? analysis.inputs?.sale_price);
  const commissionAmount = num(o.commission_amount ?? o.commissionAmount);
  const vatAmount = num(o.vat_amount ?? o.vatAmount);
  const returnLoss = num(o.expected_return_loss ?? o.expectedReturnLoss);
  const variableCost = num(o.unit_variable_cost ?? o.unitVariableCost);
  const totalCost = num(o.unit_total_cost ?? o.unitTotalCost);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{analysis.product_name}</h1>
            <RiskBadge
              level={analysis.risk_level as 'safe' | 'moderate' | 'risky' | 'dangerous'}
              score={analysis.risk_score}
            />
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {analysis.marketplace} &middot; {analysis.created_at ? new Intl.DateTimeFormat('tr-TR').format(new Date(analysis.created_at)) : ''}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Satış Fiyatı" value={formatTRY(salePrice)} icon={DollarSign} />
        <KPICard title="Birim Kâr" value={formatTRY(unitProfit)} icon={TrendingUp} trend={unitProfit >= 0 ? 'up' : 'down'} />
        <KPICard title="Kâr Marjı" value={`%${margin.toFixed(1)}`} icon={Percent} trend={margin >= 0 ? 'up' : 'down'} />
        <KPICard title="Aylık Net Kâr" value={formatTRY(monthlyProfit)} icon={BarChart3} trend={monthlyProfit >= 0 ? 'up' : 'down'} />
        <KPICard title="Aylık Ciro" value={formatTRY(monthlyRevenue)} icon={Calendar} />
        <KPICard title="Başabaş" value={isFinite(breakeven) ? formatTRY(breakeven) : '∞'} icon={Target} />
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maliyet Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kalem</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variableCost > 0 && (
                  <TableRow>
                    <TableCell className="text-sm">Değişken Maliyetler</TableCell>
                    <TableCell className="text-right text-sm">{formatTRY(variableCost)}</TableCell>
                  </TableRow>
                )}
                {commissionAmount > 0 && (
                  <TableRow>
                    <TableCell className="text-sm">Komisyon</TableCell>
                    <TableCell className="text-right text-sm">{formatTRY(commissionAmount)}</TableCell>
                  </TableRow>
                )}
                {vatAmount > 0 && (
                  <TableRow>
                    <TableCell className="text-sm">KDV</TableCell>
                    <TableCell className="text-right text-sm">{formatTRY(vatAmount)}</TableCell>
                  </TableRow>
                )}
                {returnLoss > 0 && (
                  <TableRow>
                    <TableCell className="text-sm">İade Kaybı</TableCell>
                    <TableCell className="text-right text-sm">{formatTRY(returnLoss)}</TableCell>
                  </TableRow>
                )}
                <TableRow className="border-t-2">
                  <TableCell className="text-sm font-semibold">Toplam Birim Maliyet</TableCell>
                  <TableCell className="text-right text-sm font-semibold">{formatTRY(totalCost)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-sm font-bold">Birim Net Kâr</TableCell>
                  <TableCell className={`text-right text-sm font-bold ${unitProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatTRY(unitProfit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity */}
      {Array.isArray(o._sensitivity) && (o._sensitivity as unknown[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duyarlılık Analizi (10 Senaryo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Senaryo</TableHead>
                    <TableHead className="text-right">Birim Kâr</TableHead>
                    <TableHead className="text-right">Marj</TableHead>
                    <TableHead className="text-right">Fark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(o._sensitivity as Array<{ label: string; unitNetProfit: number; marginPercent: number; difference: number }>).map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{s.label}</TableCell>
                      <TableCell className={`text-right text-sm font-medium ${s.unitNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatTRY(s.unitNetProfit)}
                      </TableCell>
                      <TableCell className={`text-right text-sm ${s.marginPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        %{s.marginPercent.toFixed(1)}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-medium ${s.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.difference >= 0 ? '+' : ''}{formatTRY(s.difference)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
