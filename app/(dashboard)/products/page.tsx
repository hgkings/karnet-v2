'use client';

import Link from 'next/link';
import { PlusCircle, PackageOpen, Trash2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RiskBadge } from '@/components/shared/risk-badge';
import { useAnalyses } from '@/hooks/use-analyses';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';
import { apiClient } from '@/lib/api/client';

function formatTRY(v: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

export default function ProductsPage() {
  const { analyses, loading, error, refresh } = useAnalyses();
  const { user } = useAuth();
  const isPro = user ? isProUser(user) : false;

  async function handleDelete(id: string) {
    try {
      await apiClient.del(`/api/analyses/${id}`);
      toast.success('Analiz silindi.');
      void refresh();
    } catch {
      toast.error('Analiz silinemedi. Lütfen tekrar deneyin.');
    }
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify(analyses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karnet-urunler-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON dosyası indirildi.');
  }

  function handleExportCSV() {
    if (!isPro) {
      toast.error('CSV dışa aktarma Pro planında kullanılabilir.');
      return;
    }
    const headers = ['Ürün', 'Pazaryeri', 'Birim Kâr', 'Marj %', 'Risk Skoru', 'Risk Seviyesi'];
    const rows = analyses.map(a => [
      a.product_name,
      a.marketplace,
      num(a.outputs?.unit_net_profit ?? a.outputs?.unitNetProfit).toFixed(2),
      num(a.outputs?.margin_pct ?? a.outputs?.marginPercent).toFixed(1),
      String(a.risk_score),
      a.risk_level,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karnet-urunler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV dosyası indirildi.');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground text-sm">{analyses.length} ürün analizi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportJSON}>
            <Download className="mr-1 h-3 w-3" />
            JSON
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="mr-1 h-3 w-3" />
            CSV
          </Button>
          <Link href="/analysis">
            <Button size="sm" className="text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
              <PlusCircle className="mr-1 h-3 w-3" />
              Yeni Analiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>Tekrar Dene</Button>
        </div>
      )}

      {/* Empty */}
      {!error && analyses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Henüz ürün yok</h3>
            <p className="text-muted-foreground text-sm mb-4">İlk ürün analizinizi oluşturarak kârlılığınızı keşfedin.</p>
            <Link href="/analysis"><Button>Yeni Analiz Oluştur</Button></Link>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!error && analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ürün Analizleri</CardTitle>
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
                    <TableHead className="text-right hidden md:table-cell">Tarih</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((a) => {
                    const profit = num(a.outputs?.unit_net_profit ?? a.outputs?.unitNetProfit);
                    const margin = num(a.outputs?.margin_pct ?? a.outputs?.marginPercent);
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Link href={`/analysis/${a.id}`} className="font-medium hover:underline text-sm">
                            {a.product_name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize text-sm text-muted-foreground">{a.marketplace}</TableCell>
                        <TableCell className={`text-right text-sm font-semibold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatTRY(profit)}
                        </TableCell>
                        <TableCell className={`text-right hidden md:table-cell text-sm ${margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          %{margin.toFixed(1)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RiskBadge level={a.risk_level as 'safe' | 'moderate' | 'risky' | 'dangerous'} score={a.risk_score} />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                          {a.created_at ? new Intl.DateTimeFormat('tr-TR').format(new Date(a.created_at)) : '—'}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <button className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{a.product_name}&quot; analizini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-destructive text-destructive-foreground">
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
