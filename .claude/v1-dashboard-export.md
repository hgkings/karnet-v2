=== FILE: app/dashboard/page.tsx ===
'use client';

import { useState, useEffect } from 'react';
import { useAlerts } from '@/contexts/alert-context';
import { deleteAnalysis as storageDeleteAnalysis } from '@/lib/api/analyses';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { KPICard } from '@/components/shared/kpi-card';
import { ProductsTable } from '@/components/dashboard/products-table';
import { RiskChart } from '@/components/dashboard/risk-chart';
import { ProfitTrendChart } from '@/components/dashboard/profit-trend-chart';
import { ParetoChart } from '@/components/dashboard/pareto-chart';
import { PazaryeriIstatistikKarti } from '@/components/shared/PazaryeriIstatistikKarti';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { TrendingUp, Percent, AlertTriangle, Star, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GeneralRiskCard } from '@/components/dashboard/general-risk-card';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';

interface ConnStatus {
  status: string;
  seller_id?: string;
}

export default function DashboardPage() {
  const { analyses, loading, refresh } = useAlerts();

  const [trendyolConn, setTrendyolConn] = useState<ConnStatus>({ status: 'disconnected' });

  useEffect(() => {
    fetch('/api/marketplace/trendyol')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setTrendyolConn({ status: d.status ?? 'disconnected', seller_id: d.seller_id });
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await storageDeleteAnalysis(id);
      if (res.success) {
        toast.success('Analiz silindi.');
        await refresh();
      } else {
        toast.error('Silme işlemi başarısız.');
      }
    } catch {
      toast.error('Hata oluştu.');
    }
  };

  const totalProfit = analyses.reduce((sum, a) => sum + a.result.monthly_net_profit, 0);
  const avgMargin =
    analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.result.margin_pct, 0) / analyses.length
      : 0;
  const riskyCount = analyses.filter(
    (a) => a.risk.level === 'risky' || a.risk.level === 'dangerous'
  ).length;
  const mostProfitable =
    analyses.length > 0
      ? analyses.reduce(
          (best, a) =>
            a.result.monthly_net_profit > best.result.monthly_net_profit ? a : best,
          analyses[0]
        )
      : null;

  if (loading && analyses.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header with Risk Card */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
          <div className="space-y-1.5 w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Panel</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ürün portföyünüzün anlık karlılık ve risk durumu.
            </p>
          </div>
          <div className="w-full lg:w-auto min-w-0 lg:min-w-[300px]">
            <GeneralRiskCard />
          </div>
        </div>

        {/* Actionable Recommendations */}
        <RecommendationsPanel analyses={analyses} />

        {/* Dashboard KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Aylık Tahmini Kâr"
            value={formatCurrency(totalProfit)}
            subtitle={totalProfit >= 0 ? 'Toplam net kâr' : 'Toplam zarar'}
            icon={TrendingUp}
            trend={totalProfit >= 0 ? 'up' : 'down'}
          />
          <KPICard
            title="Ortalama Marj"
            value={formatPercent(avgMargin)}
            subtitle={`${analyses.length} aktif ürün`}
            icon={Percent}
            trend={avgMargin >= 15 ? 'up' : avgMargin >= 5 ? 'neutral' : 'down'}
          />
          <KPICard
            title="Kritik Ürün"
            value={riskyCount.toString()}
            subtitle={riskyCount > 0 ? 'Acil aksiyon gerekli' : 'Risk bulunamadı'}
            icon={AlertTriangle}
            trend={riskyCount > 0 ? 'down' : 'up'}
          />
          <KPICard
            title="En Karlı Ürün"
            value={mostProfitable ? mostProfitable.input.product_name : '-'}
            subtitle={
              mostProfitable
                ? formatCurrency(mostProfitable.result.monthly_net_profit)
                : 'Henüz veri yok'
            }
            icon={Star}
          />
        </div>

        {/* Pazaryeri İstatistikleri */}
        <PazaryeriIstatistikKarti
          bagliPazaryerleri={[
            { id: 'trendyol', status: trendyolConn.status, supplier_id: trendyolConn.seller_id },
            { id: 'hepsiburada', status: 'disconnected' },
          ]}
        />

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfitTrendChart analyses={analyses} />
          </div>
          <div className="space-y-6">
            <ParetoChart analyses={analyses} />
            <RiskChart analyses={analyses} />
          </div>
        </div>

        {/* Products Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Son Analizler</h2>
            </div>
          </div>
          <ProductsTable analyses={analyses.slice(0, 10)} onDelete={handleDelete} />
        </div>
      </div>
    </DashboardLayout>
  );
}
=== END ===

=== FILE: components/dashboard/products-table.tsx ===
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Analysis } from '@/types';
import { getMarketplaceLabel } from '@/lib/marketplace-data';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Trash2,
  Pencil,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductsTableProps {
  analyses: Analysis[];
  onDelete?: (id: string) => void;
}

type SortField = 'monthly_net_profit' | 'margin_pct' | 'risk_score' | 'created_at';
type SortOrder = 'asc' | 'desc';

export function ProductsTable({ analyses, onDelete }: ProductsTableProps) {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // profitable, loss, pareto_80

  const [sortField, setSortField] = useState<SortField>('monthly_net_profit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Derived Data ---
  const filteredAndSortedData = useMemo(() => {
    let data = [...analyses];

    // 1. Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(a =>
        a.input.product_name.toLowerCase().includes(lower) ||
        getMarketplaceLabel(a.input.marketplace).toLowerCase().includes(lower)
      );
    }

    // 2. Filters
    if (marketplaceFilter !== 'all') {
      data = data.filter(a => a.input.marketplace === marketplaceFilter);
    }
    if (riskFilter !== 'all') {
      data = data.filter(a => a.risk.level === riskFilter);
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'profitable') {
        data = data.filter(a => a.result.monthly_net_profit > 0);
      } else if (statusFilter === 'loss') {
        data = data.filter(a => a.result.monthly_net_profit <= 0);
      } else if (statusFilter === 'pareto_80') {
        // Pareto Logic: Top 80% contributors
        const profitable = [...analyses].filter(a => a.result.monthly_net_profit > 0)
          .sort((a, b) => b.result.monthly_net_profit - a.result.monthly_net_profit);
        const totalProfit = profitable.reduce((sum, a) => sum + a.result.monthly_net_profit, 0);
        const threshold = totalProfit * 0.8;
        let currentSum = 0;
        const topIds = new Set<string>();

        for (const p of profitable) {
          currentSum += p.result.monthly_net_profit;
          topIds.add(p.id);
          if (currentSum >= threshold) break;
        }
        data = data.filter(a => topIds.has(a.id));
      }
    }

    // 3. Sort
    data.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'monthly_net_profit':
          valA = a.result.monthly_net_profit;
          valB = b.result.monthly_net_profit;
          break;
        case 'margin_pct':
          valA = a.result.margin_pct;
          valB = b.result.margin_pct;
          break;
        case 'risk_score':
          valA = a.risk.score;
          valB = b.risk.score;
          break;
        case 'created_at':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [analyses, searchTerm, marketplaceFilter, riskFilter, statusFilter, sortField, sortOrder]);

  // 4. Pagination
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // --- Render Helpers ---
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
    return (
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3 transition-transform",
        sortOrder === 'desc' ? "text-primary" : "text-primary rotate-180"
      )} />
    );
  };

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)] p-12 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Search className="h-8 w-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Henüz ürün analizi yok</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          İlk ürününüzü analiz ederek karlılık durumunu ve risk raporunu görebilirsiniz.
        </p>
        <Link href="/analysis/new">
          <Button className="mt-6 rounded-xl h-11 px-8 hover:scale-105 transition-transform">
            Yeni Analiz Başlat
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --- Toolbar --- */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün adı veya pazaryeri ara..."
            className="pl-9 h-10 bg-[rgba(255,255,255,0.04)] border-transparent focus:border-amber-500/20 focus:bg-[rgba(255,255,255,0.06)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="Pazaryeri" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Pazaryerleri</SelectItem>
              <SelectItem value="trendyol">Trendyol</SelectItem>
              <SelectItem value="hepsiburada">Hepsiburada</SelectItem>
              <SelectItem value="amazon_tr">Amazon TR</SelectItem>
              <SelectItem value="n11">N11</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Risk Durumu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Riskler</SelectItem>
              <SelectItem value="safe">Güvenli</SelectItem>
              <SelectItem value="moderate">Orta Risk</SelectItem>
              <SelectItem value="risky">Riskli</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="profitable">Kârlı Ürünler</SelectItem>
              <SelectItem value="loss">Zarar Edenler</SelectItem>
              <SelectItem value="pareto_80">⭐ Kârın Omurgası (80/20)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                <th
                  className="px-4 py-3.5 text-left font-semibold cursor-pointer select-none group"
                  onClick={() => handleSort('monthly_net_profit')} // Default/Custom logic
                >
                  Ürün Detayı
                </th>
                <th className="hidden px-4 py-3.5 text-left font-semibold sm:table-cell">Pazaryeri</th>

                <th
                  className="px-4 py-3.5 text-right font-semibold cursor-pointer select-none group"
                  onClick={() => handleSort('monthly_net_profit')}
                >
                  <div className="flex items-center justify-end gap-1 group-hover:text-foreground transition-colors">
                    Birim Kâr
                  </div>
                </th>

                <th
                  className="hidden px-4 py-3.5 text-right font-semibold md:table-cell cursor-pointer select-none group"
                  onClick={() => handleSort('margin_pct')}
                >
                  <div className="flex items-center justify-end gap-1 group-hover:text-foreground transition-colors">
                    Marj <SortIcon field="margin_pct" />
                  </div>
                </th>

                <th
                  className="hidden px-4 py-3.5 text-right font-semibold lg:table-cell cursor-pointer select-none group"
                  onClick={() => handleSort('monthly_net_profit')}
                >
                  <div className="flex items-center justify-end gap-1 group-hover:text-foreground transition-colors">
                    Aylık Kâr <SortIcon field="monthly_net_profit" />
                  </div>
                </th>

                <th
                  className="px-4 py-3.5 text-center font-semibold cursor-pointer select-none group"
                  onClick={() => handleSort('risk_score')}
                >
                  <div className="flex items-center justify-center gap-1 group-hover:text-foreground transition-colors">
                    Risk <SortIcon field="risk_score" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    Sonuç bulunamadı.
                    <Button variant="link" onClick={() => {
                      setSearchTerm('');
                      setMarketplaceFilter('all');
                      setRiskFilter('all');
                    }}>Filtreleri Temizle</Button>
                  </td>
                </tr>
              ) : (
                paginatedData.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/[0.03] group">
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">{a.input.product_name}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="mt-1 sm:hidden">
                        <span className="inline-flex items-center rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[10px] font-medium text-muted-foreground">
                          {getMarketplaceLabel(a.input.marketplace)}
                        </span>
                      </div>

                      {/* Health Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {a.result.margin_pct >= 20 && (a.risk.level === 'safe' || a.risk.level === 'moderate') && (
                          <span className="inline-flex items-center rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                            ⭐ Yıldız
                          </span>
                        )}
                        {a.result.monthly_net_profit > 0 && (a.result.margin_pct < 10 || a.risk.level === 'risky' || a.risk.level === 'dangerous') && (
                          <span className="inline-flex items-center rounded-sm bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-400">
                            ⚠️ İnce Çizgi
                          </span>
                        )}
                        {a.result.monthly_net_profit <= 0 && (
                          <span className="inline-flex items-center rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                            🩸 Zarar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <span className="inline-flex items-center rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-xs font-medium text-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.06)]">
                        {getMarketplaceLabel(a.input.marketplace)}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-right font-bold tabular-nums ${a.result.unit_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(a.result.unit_net_profit)}
                    </td>
                    <td className={`hidden px-4 py-3.5 text-right font-bold tabular-nums md:table-cell ${a.result.margin_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(a.result.margin_pct)}
                    </td>
                    <td className={`hidden px-4 py-3.5 text-right font-bold tabular-nums lg:table-cell ${a.result.monthly_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(a.result.monthly_net_profit)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RiskBadge level={a.risk.level} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/analysis/${a.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" title="Görüntüle">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/analysis/${a.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" title="Düzenle">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => onDelete(a.id)}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* Mobile Actions (Dropdown) */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/analysis/${a.id}`}>
                              <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                            </Link>
                            <Link href={`/analysis/${a.id}/edit`}>
                              <DropdownMenuItem>Düzenle</DropdownMenuItem>
                            </Link>
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(a.id)} className="text-destructive focus:text-destructive">
                                Sil
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-4 py-3 bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Satır:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-[60px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/dashboard/risk-chart.tsx ===
'use client';

import { Analysis } from '@/types';
import { riskLevelConfig } from '@/utils/risk-engine';
import type { RiskLevel } from '@/types';

interface RiskChartProps {
  analyses: Analysis[];
}

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
          const config = riskLevelConfig[level];
          const pct = (counts[level] / total) * 100;
          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="text-muted-foreground font-medium">
                  {counts[level]} ürün
                </span>
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
=== END ===

=== FILE: components/dashboard/profit-trend-chart.tsx ===
'use client';

import { useMemo, useState } from 'react';
import { Analysis } from '@/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/components/shared/format';
import { Button } from '@/components/ui/button';

interface ProfitTrendChartProps {
    analyses: Analysis[];
}

export function ProfitTrendChart({ analyses }: ProfitTrendChartProps) {
    const [days, setDays] = useState(30);

    const data = useMemo(() => {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);

        const filtered = analyses.filter((a) => new Date(a.createdAt) >= startDate);

        // Group by date
        const grouped: Record<string, number> = {};

        // Initialize all dates in range with 0 if possible, but for simplicity we'll just sort the existing ones
        filtered.forEach((a) => {
            const date = new Date(a.createdAt).toISOString().split('T')[0];
            grouped[date] = (grouped[date] || 0) + a.result.monthly_net_profit;
        });

        return Object.entries(grouped)
            .map(([date, profit]) => ({
                date,
                profit,
                formattedDate: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [analyses, days]);

    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-foreground">Aylık Kâr Trendi</h3>
                <div className="flex gap-1 bg-[rgba(255,255,255,0.04)] p-1 rounded-xl">
                    {[30, 90, 365].map((d) => (
                        <Button
                            key={d}
                            size="sm"
                            variant="ghost"
                            className={`h-7 px-3 text-xs rounded-lg transition-all ${days === d
                                    ? 'bg-background text-foreground shadow-sm font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setDays(d)}
                        >
                            {d === 365 ? '1 Yıl' : `${d} Gün`}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="formattedDate"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                dy={10}
                            />
                            <YAxis
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(val) => `₺${val / 1000}k`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1C1917] p-3 shadow-lg">
                                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{payload[0].payload.formattedDate}</p>
                                                <p className="text-lg font-bold text-primary">
                                                    {formatCurrency(payload[0].value as number)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <p>Bu zaman aralığında veri bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
=== END ===

=== FILE: components/dashboard/pareto-chart.tsx ===
'use client';

import { Analysis } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ParetoChartProps {
    analyses: Analysis[];
}

export function ParetoChart({ analyses }: ParetoChartProps) {
    // 1. Calculate Total Net Profit (only profitable products)
    const profitableProducts = analyses
        .filter(a => a.result.monthly_net_profit > 0)
        .sort((a, b) => b.result.monthly_net_profit - a.result.monthly_net_profit);

    const totalProfit = profitableProducts.reduce((sum, a) => sum + a.result.monthly_net_profit, 0);

    if (totalProfit === 0) return null;

    // 2. Identify Top 80% contributors
    let currentSum = 0;
    const topContributors = [];
    const threshold = totalProfit * 0.8;

    for (const product of profitableProducts) {
        currentSum += product.result.monthly_net_profit;
        topContributors.push(product);
        if (currentSum >= threshold) break;
    }

    const remainingCount = analyses.length - topContributors.length;
    const contributionPct = (currentSum / totalProfit) * 100;

    return (
        <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Kârın Omurgası (80/20)</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Toplam kârın <b>{Math.round(contributionPct)}%</b>'si bu <b>{topContributors.length}</b> üründen geliyor.
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-2">
                    {topContributors.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                                    {idx + 1}
                                </span>
                                <div className="flex flex-col min-w-0 flex-1 px-2">
                                    <Link href={`/analysis/${item.id}`} className="hover:underline block w-full">
                                        <span className="text-sm font-medium truncate block w-full">
                                            {item.input.product_name}
                                        </span>
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                                        Marj: {formatPercent(item.result.margin_pct)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                                <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                                    {formatCurrency(item.result.monthly_net_profit)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {formatPercent((item.result.monthly_net_profit / totalProfit) * 100)} pay
                                </p>
                            </div>
                        </div>
                    ))}

                    {topContributors.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-1">
                            ...ve {topContributors.length - 5} diğer kritik ürün.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
=== END ===

=== FILE: components/dashboard/general-risk-card.tsx ===
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth-context';

type RiskLevel = 'safe' | 'moderate' | 'high';

export function GeneralRiskCard() {
    const { user } = useAuth();
    const router = useRouter();
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('safe');
    const [reasons, setReasons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const isPro = user?.plan === 'pro' || user?.plan === 'admin';

    useEffect(() => {
        if (!user || !isPro) return;

        const checkRisk = async () => {
            let level: RiskLevel = 'safe';
            const newReasons: string[] = [];

            // 1. Check Cash Plan (HIGH RISK)
            const { data: cashPlan } = await supabase
                .from('cash_plan')
                .select('month, closing_cash')
                .eq('user_id', user.id)
                .lt('closing_cash', 0); // Only get negative months

            if (cashPlan && cashPlan.length > 0) {
                level = 'high';
                newReasons.push(`Nakit planında ${cashPlan.length} ayda açık görünüyor.`);
            }

            // 2. Check Target Margin vs Actual (MODERATE)
            // Note: In a real app we'd fetch actual average margin from 'analyses' table.
            // For this card we'll keep it simple or hook into a context if available.
            // Assuming we can't easily get aggregate analysis stats here without extra fetch,
            // we'll focus on the cash plan and profile config.

            if (level !== 'high' && user.target_margin) {
                // If margin alert is enabled and logic was checked elsewhere, we show it here.
                // For now, let's skip the complex aggregation on client load to keep dashboard fast
                // unless we really want it.
            }

            // 3. Check Break-even (MODERATE)
            // If fixed costs are high (> 50k) and no target profit set, maybe warn?
            if (level !== 'high' && (user.fixed_cost_monthly || 0) > 50000) {
                // This is a naive heuristic, but serves the example.
                // Better: "Uncovered fixed costs" if we had revenue data.
            }

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
            btn: 'text-emerald-400 hover:text-emerald-300'
        },
        moderate: {
            border: 'border-amber-500/30',
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            icon: AlertTriangle,
            label: 'Orta Risk',
            btn: 'text-amber-400 hover:text-amber-300'
        },
        high: {
            border: 'border-red-500/30',
            bg: 'bg-red-500/10',
            text: 'text-red-400',
            icon: AlertOctagon,
            label: 'Yüksek Risk',
            btn: 'text-red-400 hover:text-red-300'
        }
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
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-black/20 ${style.text} border-current opacity-80`}>
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
=== END ===

=== FILE: components/dashboard/recommendations-panel.tsx ===
'use client';

import { Analysis } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { calculateAdCeiling } from '@/utils/calculations';

interface RecommendationsPanelProps {
    analyses: Analysis[];
}

export function RecommendationsPanel({ analyses }: RecommendationsPanelProps) {
    // Identify critical products
    const criticalProducts = analyses
        .map(analysis => {
            const issues = [];
            if (analysis.risk.level === 'dangerous' || analysis.risk.level === 'risky') {
                issues.push({ type: 'risk', label: 'Yüksek Risk', icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' });
            }
            if (analysis.result.margin_pct < 10) {
                issues.push({ type: 'margin', label: 'Düşük Marj', icon: TrendingDown, color: 'text-amber-400 bg-amber-500/10' });
            }
            if (analysis.result.monthly_net_profit < 0) {
                issues.push({ type: 'profit', label: 'Zarar Ediyor', icon: Wallet, color: 'text-red-400 bg-red-500/10' });
            }

            // Ad Ceiling Check
            const adCeiling = calculateAdCeiling(analysis.input);
            if (analysis.input.ad_cost_per_sale > adCeiling && adCeiling > 0) {
                issues.push({ type: 'ads', label: 'Yüksek Reklam', icon: TrendingDown, color: 'text-orange-400 bg-orange-500/10' });
            }

            // Calculate a criticality score
            let score = 0;
            if (analysis.result.monthly_net_profit < 0) score += 50;
            if (analysis.risk.level === 'dangerous') score += 40;
            if (analysis.risk.level === 'risky') score += 20;
            if (analysis.result.margin_pct < 5) score += 30;
            else if (analysis.result.margin_pct < 10) score += 15;

            if (analysis.input.ad_cost_per_sale > adCeiling && adCeiling > 0) score += 25;

            return { ...analysis, issues, score };
        })
        .filter(item => item.issues.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3

    if (criticalProducts.length === 0) return null;

    return (
        <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Kritik Ürün Önerileri</CardTitle>
                        <p className="text-xs text-muted-foreground">Acil aksiyon gerektiren {criticalProducts.length} ürün tespit edildi.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {criticalProducts.map((item) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-3 transition-colors hover:bg-white/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{item.input.product_name}</span>
                                <span className="text-xs text-muted-foreground">({formatPercent(item.result.margin_pct)} Marj)</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {item.issues.slice(0, 2).map((issue, idx) => (
                                    <Badge key={idx} variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${issue.color} border-0`}>
                                        <issue.icon className="mr-1 h-3 w-3" />
                                        {issue.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Link href={`/analysis/${item.id}`} passHref>
                            <Button size="sm" variant="ghost" className="h-8 text-xs font-medium w-full sm:w-auto">
                                İncele & Düzelt <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
=== END ===

=== FILE: components/shared/PazaryeriIstatistikKarti.tsx ===
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PAZARYERLERI = [
  {
    id: 'trendyol',
    isim: 'Trendyol',
    emoji: '🟠',
    finansEndpoint: '/api/marketplace/trendyol/finance',
  },
  {
    id: 'hepsiburada',
    isim: 'Hepsiburada',
    emoji: '🟡',
    finansEndpoint: '/api/marketplace/hepsiburada/finance',
  },
] as const;

interface BagliPazaryeri {
  id: string;
  status: string;
  supplier_id?: string;
  merchant_id?: string;
}

interface Veri {
  toplamKomisyon: number;
  toplamHakedis: number;
  toplamIade: number;
  kayitSayisi: number;
}

interface Props {
  bagliPazaryerleri: BagliPazaryeri[];
}

export function PazaryeriIstatistikKarti({ bagliPazaryerleri }: Props) {
  const baglilar = PAZARYERLERI.filter((p) =>
    bagliPazaryerleri.some((b) => b.id === p.id && b.status === 'connected')
  );

  const [seciliId, setSeciliId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('son_pazaryeri');
      if (saved && baglilar.some((p) => p.id === saved)) return saved;
    }
    return baglilar[0]?.id ?? '';
  });

  const [veri, setVeri] = useState<Veri | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // İlk bağlıyı seç (bağlantı durumu geç gelirse)
  useEffect(() => {
    if (!seciliId && baglilar.length > 0) {
      setSeciliId(baglilar[0].id);
    }
  }, [baglilar.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pazaryeri değişince veri çek
  useEffect(() => {
    if (!seciliId) return;
    if (typeof window !== 'undefined') localStorage.setItem('son_pazaryeri', seciliId);
    veriCek(seciliId);
  }, [seciliId]); // eslint-disable-line react-hooks/exhaustive-deps

  const veriCek = async (id: string) => {
    const pazaryeri = PAZARYERLERI.find((p) => p.id === id);
    if (!pazaryeri) return;

    setYukleniyor(true);
    setHata(null);
    setVeri(null);

    try {
      const bugun = new Date();
      const baslangic = new Date();
      baslangic.setDate(bugun.getDate() - 30);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const res = await fetch(
        `${pazaryeri.finansEndpoint}?startDate=${fmt(baslangic)}&endDate=${fmt(bugun)}`
      );
      if (!res.ok) throw new Error('Finans verisi alınamadı');
      const json = await res.json();

      // Trendyol finance: { data: SellerSettlement[] }
      // Diğer formatlar: ozet.toplamKomisyon vs.
      const rows: any[] = json.data ?? [];
      setVeri({
        toplamKomisyon:
          json.ozet?.toplamKomisyon ??
          rows.reduce((s: number, r: any) => s + (r.komisyonTutari ?? 0), 0),
        toplamHakedis:
          json.ozet?.toplamHakedis ??
          rows.reduce((s: number, r: any) => s + (r.saticiHakedis ?? 0), 0),
        toplamIade: json.ozet?.toplamIadeTutari ?? json.toplamIade ?? 0,
        kayitSayisi: json.toplam ?? rows.length,
      });
    } catch (e: any) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  const fmt = (n: number) =>
    '₺' + n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Pazaryeri İstatistikleri</h3>
        <div className="flex items-center gap-2">
          {baglilar.length === 0 ? (
            <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-1 rounded-full">
              🟠 Bağlı Değil
            </span>
          ) : yukleniyor ? (
            <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-1 rounded-full">
              🟡 Yükleniyor
            </span>
          ) : hata ? (
            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-1 rounded-full">
              🔴 Bağlantı Hatası
            </span>
          ) : (
            <span className="text-xs bg-green-500/15 text-green-400 px-2 py-1 rounded-full">
              🟢 Canlı Veri
            </span>
          )}

          {baglilar.length > 1 && (
            <select
              value={seciliId}
              onChange={(e) => setSeciliId(e.target.value)}
              className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer"
            >
              {baglilar.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.isim}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* STATE 1: Hiçbiri bağlı değil */}
      {baglilar.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Pazaryeri hesabını bağla — komisyon, kargo ve iade verilerin otomatik gelsin.
          </p>
          <div className="space-y-2 mb-4 text-left">
            {['📊 Komisyon verisi otomatik', '💸 Gerçek net kâr hesabı', '📦 İade oranı otomatik'].map(
              (item) => (
                <p key={item} className="text-xs text-muted-foreground">
                  {item}
                </p>
              )
            )}
          </div>
          <Link href="/marketplace">
            <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              Pazaryeri Bağla →
            </button>
          </Link>
        </div>
      )}

      {/* STATE 2: Yükleniyor */}
      {baglilar.length > 0 && yukleniyor && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* STATE 3: Hata */}
      {baglilar.length > 0 && !yukleniyor && hata && (
        <div className="text-center py-4">
          <p className="text-sm text-red-400 mb-3">⚠️ {hata}</p>
          <button onClick={() => veriCek(seciliId)} className="text-xs text-primary underline">
            Tekrar dene
          </button>
        </div>
      )}

      {/* STATE 4: Veri geldi */}
      {baglilar.length > 0 && !yukleniyor && !hata && veri && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Komisyon</p>
              <p className="text-base font-bold text-destructive">
                {fmt(veri.toplamKomisyon)}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Hakediş</p>
              <p className="text-base font-bold text-primary">{fmt(veri.toplamHakedis)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">İade</p>
              <p className="text-base font-bold text-yellow-500">{fmt(veri.toplamIade)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span>Son 30 günde {veri.kayitSayisi} işlem</span>
            <Link href="/marketplace" className="text-primary hover:underline">
              Detaylar →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
=== END ===

=== FILE: components/shared/format.ts ===
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (!Number.isFinite(num)) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '%0,0';
  return `%${value.toFixed(1)}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('tr-TR').format(value);
}
=== END ===
