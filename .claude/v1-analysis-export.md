=== FILE: app/analysis/new/page.tsx ===
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalysisForm } from '@/components/analysis/analysis-form';

export default function NewAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yeni Analiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Urun bilgilerinizi girerek detayli kar analizi yapin.
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 sm:p-8">
          <AnalysisForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
=== END ===

=== FILE: app/analysis/[id]/page.tsx ===
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Analysis } from '@/types';
import { getAnalysisById } from '@/lib/api/analyses';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RiskGauge } from '@/components/shared/risk-gauge';
import { RiskBadge } from '@/components/shared/risk-badge';
import { CostBreakdown } from '@/components/analysis/cost-breakdown';
import { SensitivityTable } from '@/components/analysis/sensitivity-table';
import { MarketplaceComparison } from '@/components/analysis/marketplace-comparison';
import { CashflowEstimator } from '@/components/analysis/cashflow-estimator';
import { VatImpactCard } from '@/components/analysis/vat-impact-card';
import { MinPriceCards } from '@/components/analysis/min-price-cards';
import { ScenarioSimulator } from '@/components/analysis/scenario-simulator';
import { CampaignSimulator } from '@/components/analysis/campaign-simulator';
import { formatCurrency, formatPercent } from '@/components/shared/format';
import { getMarketplaceLabel } from '@/lib/marketplace-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Download,
  Lock,
  AlertTriangle,
  Target,
  User2,
  TrendingUp,
  ChevronRight,
  Save,
  Rocket,
  FileText,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { saveAnalysis } from '@/lib/api/analyses';
import { calculateProfit, calculateAdCeiling, n } from '@/utils/calculations';
import { calculateProAccounting } from '@/utils/pro-accounting';
import { calculateRisk } from '@/utils/risk-engine';
import { toast } from 'sonner';
import { analysesToJSON, analysesToCSV } from '@/lib/csv';
import { ProLockedSection } from '@/components/shared/pro-locked-section';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { isProUser } from '@/utils/access';
import { supabase } from '@/lib/supabaseClient';
import { CollapsibleCard } from '@/components/shared/collapsible-card';

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Competitor states
  const [compName, setCompName] = useState('');
  const [compPrice, setCompPrice] = useState<number>(0);
  const [targetPos, setTargetPos] = useState<'cheaper' | 'same' | 'premium'>('same');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const id = params.id as string;
      const found = await getAnalysisById(id);
      if (found) {
        setAnalysis(found);
        setCompName(found.input.competitor_name || '');
        setCompPrice(found.input.competitor_price || 0);
        setTargetPos(found.input.target_position || 'same');
      }
      setLoading(false);
    })();
  }, [params.id, user]);

  const handleSaveCompetitor = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const updatedInput = {
        ...analysis.input,
        competitor_name: compName,
        competitor_price: compPrice,
        target_position: targetPos,
      };
      const res = await saveAnalysis({ ...analysis, input: updatedInput });
      if (res.success) {
        setAnalysis({ ...analysis, input: updatedInput });
        toast.success('Rakip bilgileri kaydedildi.');
      }
    } catch (e) {
      toast.error('Hata olustu.');
    } finally {
      setSaving(false);
    }
  };

  const isPro = isProUser(user);

  const handleApplySuggestedPrice = async (price: number) => {
    if (!analysis) return;
    setSaving(true);
    try {
      const updatedInput = { ...analysis.input, sale_price: price };
      const mode = (isPro && updatedInput.accounting_mode === 'pro') ? 'pro' : 'standard';

      const updatedResult = mode === 'pro'
        ? calculateProAccounting(updatedInput)
        : calculateProfit(updatedInput);

      const updatedRisk = calculateRisk(updatedInput, updatedResult);

      const updatedAnalysis = {
        ...analysis,
        input: updatedInput,
        result: updatedResult,
        risk: updatedRisk
      };

      const res = await saveAnalysis(updatedAnalysis);
      if (res.success) {
        setAnalysis(updatedAnalysis);
        toast.success('Fiyat guncellendi ve yeniden hesaplandi.');
      }
    } catch (e) {
      toast.error('Hata olustu.');
    } finally {
      setSaving(false);
    }
  };


  const handleExportJSON = () => {
    if (!analysis) return;
    const json = analysesToJSON([analysis]);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.input.product_name}-analiz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!analysis || !isPro) return;
    const csv = analysesToCSV([analysis]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.input.product_name}-analiz.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };



  const handleExportPDF = async () => {
    if (!analysis) return;

    // Client-side Pro check
    if (!isProUser(user)) {
      setShowUpgrade(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Oturum bulunamadi. Lutfen tekrar giris yapin.');
        window.location.href = '/auth';
        return;
      }

      toast.loading('PDF hazirlaniyor...', { id: 'pdf-download' });

      const res = await fetch(`/api/pdf/analysis/${params.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      toast.dismiss('pdf-download');

      if (res.status === 401) {
        toast.error('Oturum suresi dolmus. Lutfen tekrar giris yapin.');
        window.location.href = '/auth';
        return;
      }

      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        console.warn("[PDF Export] 403 Forbidden:", errData);
        // If server says PRO_REQUIRED, show upgrade modal even if client thought it was Pro (sync issue)
        if (errData.error === "PRO_REQUIRED") {
          setShowUpgrade(true);
        } else {
          toast.error("Yetki hatasi: " + (errData.error || "Erisim reddedildi"));
        }
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("PDF Error:", errJson);
        toast.error(`PDF olusturulamadi: ${errJson.error || 'Hata'} (${errJson.details || ''})`);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis.input.product_name}-rapor.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF indirildi!');
    } catch (err) {
      console.error(err);
      toast.dismiss('pdf-download');
      toast.error('PDF indirme hatasi.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Analiz bulunamadi.</p>
          <Link href="/dashboard">
            <Button className="mt-4">Panele Don</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { input, result, risk } = analysis;

  // Debug log for VAT calculation verification
  if (process.env.NODE_ENV === 'development') {
    console.log('[VAT Debug]', {
      product: input.product_name,
      sale_price: input.sale_price,
      vat_pct: input.vat_pct,
      vat_amount: result.vat_amount,
      types: {
        sale_price_type: typeof input.sale_price,
        vat_pct_type: typeof input.vat_pct
      }
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{input.product_name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {getMarketplaceLabel(input.marketplace)}
                  {(input.marketplace_category || input.trendyol_category) &&
                    ` - ${input.marketplace_category || input.trendyol_category} (%${input.commission_pct})`}
                </span>
                <span>·</span>
                <span>{new Date(analysis.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="mr-1.5 h-4 w-4" />
              JSON
            </Button>
            {isPro ? (
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-1.5 h-4 w-4" />
                CSV
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Lock className="mr-1.5 h-4 w-4" />
                CSV (Pro)
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-1.5 h-4 w-4" />
              )}
              PDF Indir
            </Button>
          </div>
        </div>

        {/* Compact Key Metrics Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-xs font-medium text-muted-foreground">Birim net kar</p>
            <p className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${result.unit_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(result.unit_net_profit)}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-xs font-medium text-muted-foreground">Kar marji</p>
            <p className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${result.margin_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(result.margin_pct)}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-xs font-medium text-muted-foreground">Aylik net kar</p>
            <p className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${result.monthly_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(result.monthly_net_profit)}
            </p>
          </div>

          {/* Integrated Ad Ceiling */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
            {(() => {
              const adCeiling = calculateAdCeiling(input);
              const isLoss = adCeiling <= 0;
              const isRisk = input.ad_cost_per_sale > adCeiling;

              return (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Reklam tavani</p>
                    {isRisk && <span className="animate-pulse h-2 w-2 rounded-full bg-red-500"></span>}
                  </div>
                  <p className={`mt-0.5 text-xl sm:text-2xl font-black tracking-tight ${isLoss || isRisk ? 'text-red-400' : 'text-foreground'}`}>
                    {isLoss ? 'Kar Yok' : formatCurrency(adCeiling)}
                  </p>
                </>
              );
            })()}
          </div>
        </div>


        {/* Minimum Karli Satis Fiyati — 3 kart */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
          <MinPriceCards input={input} currentPrice={input.sale_price} />
        </div>

        {/* Main Content Grid (12 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (8/12) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">

            {/* Cost Breakdown */}
            <CostBreakdown input={input} result={result} />

            {/* Iade Analizi Karti */}
            {(() => {
              const returnRate = n(input.return_rate_pct, 0);
              const monthlySales = n(input.monthly_sales_volume, 0);
              const expectedReturns = Math.round((returnRate / 100) * monthlySales);
              // expected_return_loss zaten formulde var; iade oncesi kar = net + iade etkisi
              const returnImpactUnit = result.expected_return_loss;
              const profitBeforeReturn = result.unit_net_profit + returnImpactUnit;
              const isHighReturn = returnRate >= 20;
              const isNegativeAfterReturn = result.unit_net_profit < 0;
              // Pro modunda girilen ek iade maliyeti (kargo, operasyon vb. — birim basi)
              const extraReturnCost = n(input.return_extra_cost, 0);
              // Beklenen iade basina ekstra maliyet → birim satisa yayilan etki
              const extraReturnImpactUnit = (returnRate / 100) * extraReturnCost;
              const isProMode = input.pro_mode === true;

              return (
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/20 pb-2 mb-2">Iade analizi</h3>
                  </div>

                  {/* Iade uyari kartlari */}
                  {isNegativeAfterReturn && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-400">
                      🔴 Beklenen iadeler hesaba katildiginda bu urun ZARAR ettiriyor!
                    </div>
                  )}
                  {!isNegativeAfterReturn && isHighReturn && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
                      ⚠️ Yuksek iade orani! {monthlySales > 0 ? `${monthlySales} satista ~${expectedReturns} iade bekleniyor.` : ''} Net kariniz iade maliyetlerini karşılıyor mu? Fiyatlandirmanizi gozden gecirmenizi oneririz.
                    </div>
                  )}

                  {/* Metrikler */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Iade Orani</span>
                      <span className="font-semibold">{formatPercent(returnRate)}</span>
                    </div>
                    {monthlySales > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Aylik Beklenen Iade</span>
                        <span className="font-semibold">{monthlySales} satista ~{expectedReturns} adet</span>
                      </div>
                    )}
                    <div className="border-t pt-2.5 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Iade Etkisi (birim)</span>
                        <span className="font-semibold text-red-400">
                          -{formatCurrency(returnImpactUnit)}
                        </span>
                      </div>
                      {extraReturnCost > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Ek Iade Maliyeti
                            {!isProMode && <span className="ml-1 text-[10px] text-amber-500">(bilgi)</span>}
                          </span>
                          <span className="font-semibold text-orange-400">
                            -{formatCurrency(extraReturnImpactUnit)}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({formatCurrency(extraReturnCost)}/iade)
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Iade Oncesi Kar</span>
                        <span className={`font-semibold ${profitBeforeReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(profitBeforeReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-bold text-sm">Iade Sonrasi Net</span>
                        <div className="text-right">
                          <p className={`text-xl font-black ${result.unit_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(result.unit_net_profit)}
                            <span className="ml-1 text-base">{result.unit_net_profit >= 0 ? '✅' : '🔴'}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{formatPercent(result.margin_pct)} marj</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VAT Impact & Monthly Revenue */}
            <div className="grid gap-6 md:grid-cols-2">
              <VatImpactCard input={input} result={result} />
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
                <p className="text-xs font-medium text-muted-foreground">Aylik Ciro</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(result.monthly_revenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground break-all">{input.monthly_sales_volume} adet x {formatCurrency(input.sale_price)}</p>
              </div>
            </div>

            {/* Scenario Simulator */}
            <div className="min-w-0">
              <ScenarioSimulator input={input} />
            </div>

            {/* Kampanya Simulatoru */}
            <div className="min-w-0">
              <CampaignSimulator input={input} originalResult={result} />
            </div>

            {/* Collapsible Heavy Data Sections */}
            <CollapsibleCard title="Hassasiyet Analizi" description="Farkli senaryolarda kar degisimi" defaultOpen={false}>
              {isPro ? (
                <SensitivityTable input={input} />
              ) : (
                <ProLockedSection title="Hassasiyet Analizi">
                  <div className="blur-sm grayscale opacity-50 pointer-events-none select-none">
                    <SensitivityTable input={input} />
                  </div>
                </ProLockedSection>
              )}
            </CollapsibleCard>

            <CollapsibleCard title="Pazaryeri Karsilastirmasi" description="Diger pazaryerleri" defaultOpen={false}>
              {isPro ? (
                <MarketplaceComparison input={input} />
              ) : (
                <ProLockedSection title="Pazaryeri Karsilastirmasi">
                  <div className="blur-sm grayscale opacity-50 pointer-events-none select-none">
                    <MarketplaceComparison input={input} />
                  </div>
                </ProLockedSection>
              )}
            </CollapsibleCard>

            <CollapsibleCard title="Nakit Akisi Tahmini" description="Tahmini nakit durumu" defaultOpen={false}>
              {isPro ? (
                <CashflowEstimator input={input} />
              ) : (
                <ProLockedSection title="Nakit Akisi Tahmini">
                  <div className="blur-sm grayscale opacity-50 pointer-events-none select-none">
                    <CashflowEstimator input={input} />
                  </div>
                </ProLockedSection>
              )}
            </CollapsibleCard>

          </div>

          {/* RIGHT COLUMN (4/12) */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            {/* Risk Gauge */}
            <div className="flex flex-col items-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
              <h3 className="mb-4 self-start text-sm font-semibold text-foreground border-b border-border/20 pb-2 w-full">Risk skoru</h3>
              <RiskGauge score={risk.score} level={risk.level} />
              {risk.factors.length > 0 && (
                <div className="mt-6 w-full space-y-2">
                  {risk.factors.slice(0, 3).map((f) => (
                    <div key={f.name} className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 border border-red-500/20">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                      <div>
                        <p className="text-[10px] font-bold text-red-400 break-words">{f.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Recommendations */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-500/10 rounded-md">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Akilli oneriler</h3>
              </div>
              <div className="space-y-3">
                {result.margin_pct < 10 && (
                  <div className="text-xs p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    ⚠️ Dusuk Marj: Giderleri veya fiyati gozden gecirin.
                  </div>
                )}
                {input.ad_cost_per_sale > result.unit_net_profit && (
                  <div className="text-xs p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    🛑 Reklam Zarari: Reklam maliyeti kari asiyor.
                  </div>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-[rgba(255,255,255,0.04)]">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                  <p>Iadeyi %1 dusurmek aylik <b>{formatCurrency(result.monthly_revenue * 0.01)}</b> kazandirir.</p>
                </div>
              </div>
            </div>

            {/* Competitor Analysis Link/Card - Keep it compact or move functionality inside?
                The user had it in a card before. Let's keep the Competitor logic here to avoid losing it.
            */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Rakip analizi</h3>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveCompetitor} disabled={saving}>
                  <Save className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Rakip Adi</Label>
                  <Input className="h-8 text-xs" placeholder="Orn: MegaSatici" value={compName} onChange={e => setCompName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rakip Fiyati</Label>
                  <Input className="h-8 text-xs tabular-nums" type="number" value={compPrice || ''} onChange={e => setCompPrice(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Konum</Label>
                  <Select value={targetPos} onValueChange={(v: any) => setTargetPos(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheaper">Daha Ucuz</SelectItem>
                      <SelectItem value="same">Ayni Fiyat</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {compPrice > 0 && (
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Fark:</span>
                      <span className={input.sale_price > compPrice ? 'text-red-400' : 'text-emerald-400'}>
                        {formatCurrency(input.sale_price - compPrice)}
                      </span>
                    </div>
                    {(() => {
                      let suggested = compPrice;
                      if (targetPos === 'cheaper') suggested = compPrice * 0.97;
                      if (targetPos === 'premium') suggested = compPrice * 1.05;
                      return (
                        <Button size="sm" variant="secondary" className="w-full text-xs h-7" onClick={() => handleApplySuggestedPrice(suggested)} disabled={saving}>
                          <Rocket className="mr-1.5 h-3 w-3" /> {formatCurrency(suggested)} Uygula
                        </Button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400">
            Bu arac tahmini hesaplama yapar. Muhasebecinize danismadan finansal karar vermeyin.
          </p>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </DashboardLayout>
  );
}


=== END ===

=== FILE: components/analysis/analysis-form.tsx ===
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAlerts } from '@/contexts/alert-context';
import { ProductInput, Marketplace } from '@/types';
import { marketplaces, getMarketplaceDefaults } from '@/lib/marketplace-data';
import { getMarketplaceCategories, getCategoryCommission, getCategoryReturnRate, N11_EXTRA_FEE_PCT, N11_MARKETING_FEE_PCT, N11_MARKETPLACE_FEE_PCT } from '@/lib/commission-categories';
import { getUserCommissionRates, getLastRatesUpdate, buildRateMap, lookupRate } from '@/lib/commission-rates';
import type { CommissionRate } from '@/lib/commission-rates';
import { calculateProfit, calculateRequiredPrice, calculateTrendyolServiceFee, getDefaultServiceFee, n } from '@/utils/calculations';
import { calculateProAccounting } from '@/utils/pro-accounting';
import { calculateRisk } from '@/utils/risk-engine';
import { saveAnalysis, generateId, getUserAnalysisCount } from '@/lib/api/analyses';
import { getPlanLimits } from '@/config/plans';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/components/shared/format';
import { toast } from 'sonner';
import { Target, ArrowRight, Lock, Calculator, ChevronDown, ChevronUp, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { isProUser } from '@/utils/access';

const defaultInput: ProductInput = {
  marketplace: 'trendyol',
  product_name: '',
  monthly_sales_volume: 100,
  product_cost: 0,
  sale_price: 0,
  commission_pct: 18,
  shipping_cost: 0,
  packaging_cost: 0,
  ad_cost_per_sale: 0,
  return_rate_pct: 12, // ETBİS 2024 genel sektör ortalaması; kategori seçince otomatik güncellenir
  vat_pct: 20,
  other_cost: 0,
  payout_delay_days: 28,
  n11_extra_pct: 0,
  trendyol_service_fee: 0,
  // PRO defaults
  pro_mode: false,
  sale_price_includes_vat: true,
  sale_vat_pct: 20,
  product_cost_includes_vat: true,
  purchase_vat_pct: 20,
  marketplace_fee_vat_pct: 20,
  shipping_includes_vat: true,
  shipping_vat_pct: 20,
  packaging_includes_vat: true,
  packaging_vat_pct: 20,
  ad_includes_vat: true,
  ad_vat_pct: 20,
  other_cost_includes_vat: true,
  other_cost_vat_pct: 20,
  return_refunds_commission: true,
  return_extra_cost: 0,
};

interface FieldConfig {
  key: keyof ProductInput;
  label: string;
  type: 'number' | 'text';
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  group: string;
}

const fields: FieldConfig[] = [
  { key: 'product_name', label: 'Ürün Adı', type: 'text', required: true, group: 'basic' },
  { key: 'monthly_sales_volume', label: 'Aylık Satış Adedi', type: 'number', suffix: 'adet', min: 0, step: 1, required: true, group: 'basic' },
  { key: 'product_cost', label: 'Ürün Maliyeti', type: 'number', suffix: '₺', min: 0, step: 0.01, required: true, group: 'costs' },
  { key: 'sale_price', label: 'Satış Fiyatı', type: 'number', suffix: '₺', min: 0, step: 0.01, required: true, group: 'costs' },
  { key: 'commission_pct', label: 'Komisyon Oranı', type: 'number', suffix: '%', min: 0, max: 100, step: 0.1, group: 'marketplace' },
  { key: 'shipping_cost', label: 'Kargo Ücreti', type: 'number', suffix: '₺', min: 0, step: 0.01, group: 'costs' },
  { key: 'packaging_cost', label: 'Paketleme Maliyeti', type: 'number', suffix: '₺', min: 0, step: 0.01, group: 'costs' },
  { key: 'ad_cost_per_sale', label: 'Reklam Maliyeti (Birim)', type: 'number', suffix: '₺', min: 0, step: 0.01, group: 'costs' },
  { key: 'vat_pct', label: 'Varsayılan KDV', type: 'number', suffix: '%', min: 0, max: 100, step: 1, group: 'tax' },
  { key: 'other_cost', label: 'Diğer Giderler', type: 'number', suffix: '₺', min: 0, step: 0.01, group: 'costs' },
  { key: 'payout_delay_days', label: 'Ödeme Gecikme Süresi', type: 'number', suffix: 'gün', min: 0, step: 1, group: 'cashflow' },
];

interface AnalysisFormProps {
  initialData?: ProductInput;
  analysisId?: string;
  isDemo?: boolean;
}

export function AnalysisForm({ initialData, analysisId, isDemo = false }: AnalysisFormProps) {
  const { user } = useAuth();
  const { refresh } = useAlerts();
  const router = useRouter();

  const [input, setInput] = useState<ProductInput>({ ...defaultInput, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isWarningConfirmed, setIsWarningConfirmed] = useState(false);
  const [showProAdvanced, setShowProAdvanced] = useState(false);

  const [targetMargin, setTargetMargin] = useState<number | undefined>();
  const [targetProfit, setTargetProfit] = useState<number | undefined>();
  const [suggestedPrice, setSuggestedPrice] = useState<number | undefined>();

  const [customRateMap, setCustomRateMap] = useState<Map<string, number>>(new Map());
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string | null>(null);
  const [iadeOranCekiliyor, setIadeOranCekiliyor] = useState(false);

  // In demo mode, treat as free user unless simulated otherwise
  const isProUserFlag = isDemo ? false : isProUser(user);
  const isProMode = input.pro_mode === true;

  const handleProToggle = (checked: boolean) => {
    if (checked && !isProUserFlag) {
      if (isDemo) {
        toast.info('Demo modunda sadece standart analiz yapılabilir.');
        return;
      }
      setShowUpgrade(true);
      // Ensure it stays off
      setInput(prev => ({ ...prev, pro_mode: false }));
      return;
    }
    setInput(prev => ({ ...prev, pro_mode: checked }));
  };

  // Watch for pro_mode changes from initialData or other sources
  useEffect(() => {
    if (input.pro_mode && !isProUserFlag && ((user) || isDemo)) {
      // Revert to standard mode if not pro
      setInput(prev => ({ ...prev, pro_mode: false }));
    }
  }, [input.pro_mode, isProUserFlag, user, isDemo]);

  useEffect(() => {
    if (!user || isDemo) return;
    (async () => {
      const [rates, lastUpdated] = await Promise.all([
        getUserCommissionRates(user.id),
        getLastRatesUpdate(user.id),
      ]);
      if (rates.length > 0) {
        setCustomRateMap(buildRateMap(rates));
      }
      setRatesLastUpdated(lastUpdated);
    })();
  }, [user, isDemo]);

  // Satış fiyatı değişince Trendyol servis bedelini otomatik güncelle
  useEffect(() => {
    if (input.marketplace !== 'trendyol') return;
    const autoFee = calculateTrendyolServiceFee(n(input.sale_price));
    setInput((prev) => ({ ...prev, trendyol_service_fee: autoFee }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.sale_price, input.marketplace]);

  const handleMarketplaceChange = (mp: Marketplace) => {
    const defaults = getMarketplaceDefaults(mp);
    setInput((prev) => ({
      ...prev,
      marketplace: mp,
      commission_pct: defaults.commission_pct,
      return_rate_pct: defaults.return_rate_pct,
      vat_pct: defaults.vat_pct,
      sale_vat_pct: defaults.vat_pct,
      purchase_vat_pct: defaults.vat_pct,
      payout_delay_days: defaults.payout_delay_days,
      marketplace_category: undefined,
      trendyol_category: undefined,
      n11_extra_pct: mp === 'n11' ? N11_EXTRA_FEE_PCT : 0,
      trendyol_service_fee: getDefaultServiceFee(mp),
    }));
  };

  const handleCategoryChange = (categoryLabel: string) => {
    // Use custom rate if available, fall back to default
    const customRate = lookupRate(customRateMap, input.marketplace, categoryLabel);
    const defaultRate = getCategoryCommission(input.marketplace, categoryLabel);
    const commission = customRate ?? defaultRate;
    // Auto-fill expected return rate from category data
    const returnRate = categoryLabel ? getCategoryReturnRate(input.marketplace, categoryLabel) : undefined;
    setInput((prev) => ({
      ...prev,
      marketplace_category: categoryLabel,
      trendyol_category: prev.marketplace === 'trendyol' ? categoryLabel : prev.trendyol_category,
      ...(commission !== undefined ? { commission_pct: commission } : {}),
      ...(returnRate !== undefined ? { return_rate_pct: returnRate } : {}),
    }));
  };

  const handleFieldChange = (key: keyof ProductInput, value: any) => {
    setInput(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    // Reset warning confirmation on any change
    if (isWarningConfirmed) {
      setIsWarningConfirmed(false);
      setWarnings([]);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!input.product_name.trim()) errs.product_name = 'Ürün adı gereklidir.';
    // Semantic validations moved to warnings
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkWarnings = (): string[] => {
    const w: string[] = [];
    if (input.sale_price <= 0) w.push('Satış fiyatı 0 veya geçersiz. Gelir hesaplanamayabilir.');
    if (input.product_cost < 0) w.push('Ürün maliyeti negatif olamaz.');
    if (input.monthly_sales_volume <= 0) w.push('Aylık satış adedi 0 veya boş. Toplam kâr hesaplanamaz.');
    if (input.commission_pct > 35) w.push(`Komisyon oranı %${input.commission_pct} çok yüksek görünüyor.`);
    if (input.commission_pct < 0) w.push('Komisyon oranı negatif olamaz.');
    if (input.return_rate_pct > 35) w.push('İade oranı %35 üzerinde. Bu sektör ortalamasının üzerinde olabilir.');

    // Pro specific warnings
    if (input.pro_mode) {
      const vat = input.vat_pct ?? 0;
      const saleVat = input.sale_vat_pct ?? 0;
      if (vat > 30 || saleVat > 30) w.push('KDV oranı %30 üzerinde. Doğru mu?');
    }

    return w;
  };

  const iadeOranCek = async () => {
    setIadeOranCekiliyor(true);
    try {
      const [claimRes, finRes] = await Promise.all([
        fetch('/api/marketplace/trendyol/claims?gun=30'),
        fetch('/api/marketplace/trendyol/finance?startDate=' +
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) +
          '&endDate=' + new Date().toISOString().slice(0, 10)),
      ]);
      const claimJson = await claimRes.json();
      const finJson = await finRes.json();
      const iadeSayisi: number = claimJson?.ozet?.toplamIadeSayisi ?? 0;
      const siparisAdedi: number = (finJson?.data ?? []).length;
      if (siparisAdedi > 0) {
        const oran = Math.round((iadeSayisi / siparisAdedi) * 1000) / 10;
        handleFieldChange('return_rate_pct', oran);
        toast.success(`İade oranı Trendyol'dan çekildi: %${oran}`);
      } else {
        toast.error('Yeterli sipariş verisi bulunamadı.');
      }
    } catch {
      toast.error('İade oranı alınamadı.');
    } finally {
      setIadeOranCekiliyor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Warning check
    if (!isWarningConfirmed) {
      const currentWarnings = checkWarnings();
      if (currentWarnings.length > 0) {
        setWarnings(currentWarnings);
        setIsWarningConfirmed(true);
        toast.warning('Girdiğiniz verilerde uyumsuzluklar olabilir. Lütfen kontrol edip tekrar "Kaydet"e basın.');
        return;
      }
    }

    // Auth check skipped in demo mode
    if (!isDemo && !user) return;

    setLoading(true);

    try {
      if (!isDemo && !analysisId && user) {
        const count = await getUserAnalysisCount();
        const limits = getPlanLimits(user.plan);
        if (count >= limits.maxProducts) {
          setShowUpgrade(true);
          setLoading(false);
          return;
        }
      }

      // Sanitize inputs to ensure numbers (fixes 0.00 display issue)
      const sanitized = { ...input };
      // Use fields config to identify numeric fields and parse them safely
      fields.forEach(f => {
        if (f.type === 'number') {
          // @ts-ignore
          sanitized[f.key] = n((sanitized as any)[f.key]);
        }
      });

      const effectivePro = isProUserFlag && sanitized.pro_mode;
      const result = effectivePro
        ? calculateProAccounting(sanitized)
        : calculateProfit(sanitized);

      const risk = calculateRisk(sanitized, result);

      if (isDemo) {
        // In demo mode, just show success and maybe scroll to result (if we were showing result on same page)
        // Since we redirect to detail page normally, for demo we might want to just show a toast
        // OR prompt to sign up to see detailed report.
        // For now, let's just simulate a calculation "success" toast.
        // In a real app, we'd probably redirect to a /demo/result page or show a modal.

        setLoading(false);
        toast.success('Hesaplama Başarılı! (Demo Modu)');

        // Optional: We could trigger a state update to show results right here if the UI supported it.
        // But AnalysisForm relies on redirecting.
        // Let's redirect to a demo result page? Or simply show an alert.
        toast.info('Detaylı rapor ve kaydetme için ücretsiz hesap oluşturun.');
        return;
      }

      if (!user) return; // Should not happen given check above

      const analysisData = {
        id: analysisId || generateId(),
        userId: user.id,
        input: { ...sanitized, pro_mode: !!effectivePro },
        // Ensure sale_price is explicitly included in result if not already
        result: { ...result, sale_price: sanitized.sale_price },
        risk,
        createdAt: new Date().toISOString(),
      };

      const saveResult = await saveAnalysis(analysisData);

      if (!saveResult.success) {
        toast.error(`Hata oluştu: ${saveResult.error || 'Bilinmeyen hata'}`);
        setLoading(false);
        return;
      }

      toast.success(analysisId ? 'Analiz güncellendi.' : 'Analiz başarıyla kaydedildi.');

      // Trigger Risk Check (Fire and forget, don't await blocking UI)
      if (analysisData.id) {
        fetch('/api/notifications/check-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: analysisData.id })
        }).catch(err => console.error('Risk check failed:', err));
      }

      await refresh();
      router.push(analysisId ? '/dashboard' : `/analysis/${analysisData.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(`Beklenmeyen hata: ${err.message || err}`);
      setLoading(false);
    }
  };

  const groups = [
    { key: 'basic', title: 'Temel Bilgiler' },
    { key: 'costs', title: 'Maliyet Bilgileri' },
    { key: 'marketplace', title: 'Pazaryeri Ayarları' },
    { key: 'tax', title: 'Vergi' },
    { key: 'cashflow', title: 'Nakit Akışı' },
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">

        {/* PRO Toggle Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-card to-muted/30 p-5 sm:p-6 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${isProMode ? 'bg-primary text-primary-foreground shadow-premium-sm' : 'bg-muted text-muted-foreground'}`}>
              <Calculator className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <Label htmlFor="pro-mode" className="font-bold text-base cursor-pointer">PRO Muhasebe Modu</Label>
                {!isProUserFlag && <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">Gerçek E-Ticaret Muhasebesi (KDV Ayrıştırma)</p>
            </div>
          </div>
          <Switch
            id="pro-mode"
            checked={isProMode}
            onCheckedChange={handleProToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* PRO Granular Fields Section */}
        {isProMode && (
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent p-6 sm:p-7 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Badge className="bg-primary hover:bg-primary text-xs px-2.5 py-1">PRO AYARLAR</Badge>
                <span className="text-xs text-muted-foreground">İleri düzey KDV ve iade yönetimi</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-semibold gap-1.5 self-start sm:self-auto"
                onClick={() => setShowProAdvanced(!showProAdvanced)}
              >
                {showProAdvanced ? <><ChevronUp className="h-4 w-4" /> Basitleştir</> : <><ChevronDown className="h-4 w-4" /> Detaylar</>}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Primary VAT Toggles */}
              <div className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Gelir/Gider Temeli
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm">Satış Fiyatı KDV Dahil</Label>
                    <Switch checked={input.sale_price_includes_vat !== false} onCheckedChange={(v) => handleFieldChange('sale_price_includes_vat', v)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm">Alış Fiyatı KDV Dahil</Label>
                    <Switch checked={input.product_cost_includes_vat !== false} onCheckedChange={(v) => handleFieldChange('product_cost_includes_vat', v)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">KDV Oranları</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Satış KDV %</Label>
                    <Input type="number" className="h-10" value={input.sale_vat_pct ?? 20} onChange={(e) => handleFieldChange('sale_vat_pct', parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Alış KDV %</Label>
                    <Input type="number" className="h-10" value={input.purchase_vat_pct ?? 20} onChange={(e) => handleFieldChange('purchase_vat_pct', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Pazaryeri & İade</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm">İadede Komisyon İadesi</Label>
                    <Switch checked={input.return_refunds_commission !== false} onCheckedChange={(v) => handleFieldChange('return_refunds_commission', v)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Hizmet KDV (Komisyon) %</Label>
                    <Input type="number" className="h-10" value={input.marketplace_fee_vat_pct ?? 20} onChange={(e) => handleFieldChange('marketplace_fee_vat_pct', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            {showProAdvanced && (
              <div className="pt-2 animate-in fade-in duration-300">
                <Separator className="mb-6" />
                <h4 className="text-sm font-bold mb-4">Gider Bazlı KDV Ayarları</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { id: 'shipping', label: 'Kargo', inc: 'shipping_includes_vat', pct: 'shipping_vat_pct' },
                    { id: 'packaging', label: 'Paketleme', inc: 'packaging_includes_vat', pct: 'packaging_vat_pct' },
                    { id: 'ad', label: 'Reklam', inc: 'ad_includes_vat', pct: 'ad_vat_pct' },
                    { id: 'other', label: 'Diğer', inc: 'other_cost_includes_vat', pct: 'other_cost_vat_pct' },
                  ].map((item) => (
                    <div key={item.id} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2.5">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <Switch
                          checked={input[item.inc as keyof ProductInput] !== false}
                          onCheckedChange={(v) => handleFieldChange(item.inc as keyof ProductInput, v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-1">KDV Dahil</span>
                        <div className="relative w-20">
                          <Input
                            className="h-9 px-2 text-sm pr-5"
                            type="number"
                            value={(input[item.pct as keyof ProductInput] as number) ?? 20}
                            onChange={(e) => handleFieldChange(item.pct as keyof ProductInput, parseFloat(e.target.value))}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border bg-amber-500/10 p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ek İade Maliyeti</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <p className="text-xs text-amber-400/80 flex-1 leading-relaxed">
                      Müşteri iade ettiğinde cebinizden çıkan ekstra kargo veya operasyon bedeli (birim başına).
                    </p>
                    <div className="relative w-28 shrink-0">
                      <Input
                        type="number"
                        value={input.return_extra_cost ?? 0}
                        onChange={(e) => handleFieldChange('return_extra_cost', parseFloat(e.target.value))}
                        className="h-10 border-amber-500/20 pr-6"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-600">₺</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marketplace Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Pazaryeri Seçimi</Label>
          <div className="flex flex-wrap gap-2">
            {marketplaces.map((mp) => (
              <button
                key={mp.key}
                type="button"
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${input.marketplace === mp.key
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-white/5 hover:border-[rgba(255,255,255,0.10)]'
                  }`}
                onClick={() => handleMarketplaceChange(mp.key)}
              >
                {mp.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Pazaryeri değişikliği komisyon, iade ve KDV alanlarını otomatik doldurur.</p>
        </div>

        {/* Category Selector (all marketplaces except custom) */}
        {input.marketplace !== 'custom' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Kategori</Label>
              {ratesLastUpdated && (
                <span className="text-[10px] text-muted-foreground">
                  Son güncelleme: {new Date(ratesLastUpdated).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
            <select
              value={input.marketplace_category || input.trendyol_category || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">— Kategori seçin (isteğe bağlı) —</option>
              {getMarketplaceCategories(input.marketplace).map((cat) => {
                const customRate = lookupRate(customRateMap, input.marketplace, cat.label);
                const displayRate = customRate ?? cat.commission_pct;
                const isCustom = customRate !== undefined;
                return (
                  <option key={cat.label} value={cat.label}>
                    {cat.label} (%{displayRate}{isCustom ? ' ✓' : ''})
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-muted-foreground">
              Kategori seçimi komisyon oranını otomatik doldurur; dilediğinizde manuel değiştirebilirsiniz.
              {customRateMap.size > 0 && <span className="text-emerald-400"> ✓ işaretliler kişisel oranlarınızı kullanıyor.</span>}
            </p>

            {/* Commission rate disclaimer */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs space-y-1.5">
              <p className="font-semibold text-amber-400">
                ⚠️ Bu oranlar genel tahmindir. Gerçek komisyon oranınız için:
              </p>
              <ul className="space-y-1 text-amber-400">
                <li>
                  <span className="font-medium">Trendyol →</span>{' '}
                  <a href="https://akademi.trendyol.com/satici-bilgi-merkezi/detay/trendyol-komisyonlari" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    akademi.trendyol.com/satici-bilgi-merkezi/detay/trendyol-komisyonlari
                  </a>
                </li>
                <li>
                  <span className="font-medium">Hepsiburada →</span>{' '}
                  <a href="https://merchant.hepsiburada.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    merchant.hepsiburada.com
                  </a>
                  {' '}→ Yardım → Komisyon Oranları
                </li>
                <li>
                  <span className="font-medium">n11 →</span>{' '}
                  <a href="https://magazadestek.n11.com/s/komisyon-oranlari" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    magazadestek.n11.com/s/komisyon-oranlari
                  </a>
                </li>
                <li>
                  <span className="font-medium">Amazon TR →</span>{' '}
                  <a href="https://sellercentral.amazon.com.tr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    sellercentral.amazon.com.tr
                  </a>
                </li>
              </ul>
              <p className="text-amber-500">
                Komisyon oranını yukarıdaki alandan manuel düzeltebilirsiniz.
              </p>
            </div>

          </div>
        )}

        {/* Beklenen İade Oranı — kategori seçiminden otomatik dolar */}
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="return_rate_pct" className="text-sm font-medium">Beklenen İade Oranı</Label>
            <span
              title="Ticaret Bakanlığı 2024 verilerine göre Türkiye'de en yüksek iade oranı giyim ve ayakkabı kategorisindedir. Kategori seçiminize göre sektör ortalaması otomatik girilmiştir. Kendi iade oranınızı biliyorsanız bu alanı manuel güncelleyebilirsiniz."
              className="cursor-help text-muted-foreground"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="return_rate_pct"
                type="number"
                value={(input.return_rate_pct as number) ?? ''}
                onChange={(e) => handleFieldChange('return_rate_pct', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.1}
                className="h-11 pr-8"
                placeholder="10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">%</span>
            </div>
            {input.marketplace === 'trendyol' && !isDemo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 px-3 text-xs whitespace-nowrap border-orange-500/40 text-orange-500 hover:bg-orange-500/10"
                onClick={iadeOranCek}
                disabled={iadeOranCekiliyor}
              >
                {iadeOranCekiliyor ? <span className="animate-spin mr-1">⟳</span> : null}
                Trendyol'dan Çek
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Satışlarınızın yüzde kaçının iade edileceğini tahmin edin. Otomatik hesaplanan değeri dilediğinizde manuel değiştirebilirsiniz.
            {input.marketplace === 'amazon_tr' && (
              <span className="text-blue-400"> Amazon TR koşulsuz iade politikası nedeniyle +%3 eklendi.</span>
            )}
          </p>
        </div>

        {/* Platform Servis Bedeli — pazaryerine göre farklı davranır */}
        {input.marketplace !== 'amazon_tr' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor={input.marketplace === 'n11' ? 'n11_extra_pct' : 'trendyol_service_fee'}
                className="text-sm font-medium"
              >
                {input.marketplace === 'n11'
                  ? 'Hizmet Bedeli (%)'
                  : input.marketplace === 'custom'
                  ? 'Platform Hizmet Bedeli (₺)'
                  : 'Servis Bedeli'}
              </Label>
              <span
                title={
                  input.marketplace === 'trendyol'
                    ? "Trendyol'un her gönderi için aldığı sabit platform hizmet bedeli. Normal kargolarda 8,49 TL + KDV, 'Bugün Kargoda' etiketiyle 5,49 TL + KDV olarak uygulanır. Komisyondan bağımsız, her siparişten ayrıca kesilir."
                    : input.marketplace === 'hepsiburada'
                    ? "Hepsiburada'nın her gönderi için kestiği iki ayrı bedel: İşlem Bedeli 7₺ + Hizmet Bedeli 2,5₺ = toplam 9,5₺ + KDV. Siparişi 0-1 gün içinde kargoya verirsen bu bedel alınmıyor."
                    : input.marketplace === 'n11'
                    ? 'Satış tutarı üzerinden kesilen Pazarlama (%1,20) + Pazaryeri (%0,67) hizmet bedeli toplamı.'
                    : 'Pazaryerinin her sipariş için kestiği platform hizmet bedeli.'
                }
                className="cursor-help text-muted-foreground"
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="relative">
              {input.marketplace === 'n11' ? (
                <Input
                  id="n11_extra_pct"
                  type="number"
                  value={(input.n11_extra_pct as number) ?? ''}
                  onChange={(e) => handleFieldChange('n11_extra_pct', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  className="h-11 pr-8"
                  placeholder="1.87"
                />
              ) : (
                <Input
                  id="trendyol_service_fee"
                  type="number"
                  value={(input.trendyol_service_fee as number) || ''}
                  onChange={(e) => handleFieldChange('trendyol_service_fee', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  className="h-11 pr-8"
                  placeholder="0"
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                {input.marketplace === 'n11' ? '%' : '₺'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {input.marketplace === 'trendyol' && "Trendyol Platform Hizmet Bedeli (gönderi başına). 'Bugün Kargoda' etiketiyle 5,49₺'ye düşer."}
              {input.marketplace === 'hepsiburada' && 'İşlem Bedeli (7₺) + Hizmet Bedeli (2,5₺). Hızlı kargoda (0-1 gün) bu bedel alınmıyor.'}
              {input.marketplace === 'n11' && 'Pazarlama (%1,20) + Pazaryeri (%0,67) hizmet bedeli. Satış tutarı üzerinden kesilir.'}
              {input.marketplace === 'custom' && 'Platform hizmet bedelini manuel girin.'}
            </p>
          </div>
        )}

        {/* Amazon TR — servis bedeli yok, bilgi notu */}
        {input.marketplace === 'amazon_tr' && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs animate-in fade-in duration-200">
            <p className="text-blue-400">
              ℹ️ Amazon TR&apos;de ayrı bir sipariş başı servis bedeli uygulanmaz.
            </p>
          </div>
        )}

        {/* Field Groups */}
        {groups.map((group) => {
          const groupFields = fields.filter((f) => f.group === group.key);
          if (groupFields.length === 0) return null;

          return (
            <div key={group.key} className="space-y-5">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.title}</h3>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {groupFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium">{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type={field.type}
                        value={field.type === 'text' ? (input[field.key] as string) : (input[field.key] as number) || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className={`h-11 ${field.suffix ? 'pr-10' : ''} ${errors[field.key] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        placeholder={field.type === 'text' ? '' : '0'}
                      />
                      {field.suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                    {errors[field.key] && (
                      <p className="text-xs text-red-500">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Profit Target Simulation */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/[0.04] to-transparent p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kâr Hedefi Simülasyonu</h3>
              <p className="text-xs text-muted-foreground">Hedef kâra göre gerekli satış fiyatını hesaplayın.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hedef Marj (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="30"
                  value={targetMargin || ''}
                  onChange={(e) => {
                    setTargetMargin(parseFloat(e.target.value));
                    setTargetProfit(undefined);
                  }}
                  className="h-11 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hedef Net Kâr (₺/birim)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={targetProfit || ''}
                  onChange={(e) => {
                    setTargetProfit(parseFloat(e.target.value));
                    setTargetMargin(undefined);
                  }}
                  className="h-11 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₺</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              className="rounded-[10px]"
              onClick={() => {
                if (targetMargin) {
                  const price = calculateRequiredPrice(input, 'margin', targetMargin);
                  setSuggestedPrice(price);
                } else if (targetProfit) {
                  const price = calculateRequiredPrice(input, 'profit', targetProfit);
                  setSuggestedPrice(price);
                } else {
                  toast.error('Lütfen bir hedef girin.');
                }
              }}
            >
              Hesapla
            </Button>

            {suggestedPrice !== undefined && suggestedPrice > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-xl px-4 py-2.5 flex items-center gap-4 shadow-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Önerilen Satış Fiyatı</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(suggestedPrice)}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs hover:bg-primary hover:text-white rounded-lg"
                    onClick={() => {
                      handleFieldChange('sale_price', suggestedPrice.toFixed(2));
                      setSuggestedPrice(undefined);
                      toast.success('Satış fiyatı güncellendi.');
                    }}
                  >
                    Uygula
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warnings Display */}
        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h4 className="font-semibold text-amber-800 text-sm">Dikkat Edilmesi Gerekenler</h4>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-500">{w}</li>
              ))}
            </ul>
            <p className="text-[10px] text-amber-600/80 mt-2 font-medium">Bu uyarılarla devam etmek için butona tekrar tıklayın.</p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className={`w-full sm:w-auto h-12 px-8 text-base rounded-[10px] shadow-premium-sm transition-all ${isWarningConfirmed && warnings.length > 0 ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-500/20' : ''}`}
            disabled={loading}
          >
            {loading ? 'Hesaplanıyor...' : (
              isWarningConfirmed && warnings.length > 0 ? 'Yine de Kaydet / Hesapla' : (analysisId ? 'Güncelle' : 'Analiz Et')
            )}
          </Button>
        </div>
      </form>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
=== END ===

=== FILE: components/analysis/sensitivity-table.tsx ===
'use client';

import { ProductInput } from '@/types';
import { generateSensitivityAnalysis } from '@/utils/calculations';
import { formatCurrency } from '@/components/shared/format';

interface SensitivityTableProps {
  input: ProductInput;
}

export function SensitivityTable({ input }: SensitivityTableProps) {
  const rows = generateSensitivityAnalysis(input);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <h3 className="text-sm font-semibold">Hassasiyet Analizi</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Farkli senaryolarda karinizin nasil degisecegini gorun.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Senaryo</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Yeni aylık kâr</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Fark</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Değişim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {rows.map((row) => (
              <tr key={row.scenario} className="transition-colors hover:bg-muted/30">
                <td className="py-2.5 font-medium">{row.scenario}</td>
                <td className={`py-2.5 text-right font-medium ${row.newProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(row.newProfit)}
                </td>
                <td className={`py-2.5 text-right ${row.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {row.difference >= 0 ? '+' : ''}{formatCurrency(row.difference)}
                </td>
                <td className={`py-2.5 text-right ${row.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {row.percentChange >= 0 ? '+' : ''}{row.percentChange.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
=== END ===

=== FILE: utils/calculations.ts ===
import { ProductInput, CalculationResult } from '@/types';

/** Trendyol Platform Hizmet Bedeli — gönderi başına sabit 8,49 TL + KDV */
export function calculateTrendyolServiceFee(_salePrice: number): number {
  return 8.49;
}

/** Pazaryerine göre varsayılan platform servis bedeli (TL) */
export function getDefaultServiceFee(marketplace: string): number {
  if (marketplace === 'trendyol') return 8.49;    // Trendyol Platform Hizmet Bedeli
  if (marketplace === 'hepsiburada') return 9.50; // İşlem Bedeli 7₺ + Hizmet Bedeli 2,5₺
  return 0;
}

export const n = (v: any, fallback = 0) => {
  if (v === null || v === undefined) return fallback;
  const num = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(num) ? num : fallback;
};

export function calculateProfit(input: ProductInput): CalculationResult {
  console.debug('[Calculation] Input:', input);
  const sale_price = n(input.sale_price);
  const product_cost = n(input.product_cost);
  const commission_pct = n(input.commission_pct);
  const shipping_cost = n(input.shipping_cost);
  const packaging_cost = n(input.packaging_cost);
  const ad_cost_per_sale = n(input.ad_cost_per_sale);
  const return_rate_pct = n(input.return_rate_pct);
  const vat_pct = n(input.vat_pct, 20); // Default VAT 20% if missing
  const other_cost = n(input.other_cost);
  const monthly_sales_volume = n(input.monthly_sales_volume);

  // 1.1 KDV etkisi (Satış fiyatı KDV dahil kabul edilerek) — komisyondan önce hesaplanmalı
  let vat_amount = 0;
  let sale_price_excl_vat = sale_price;

  if (vat_pct > 0) {
    const vatRate = vat_pct / 100;
    const calcExcl = sale_price / (1 + vatRate);
    sale_price_excl_vat = Number.isFinite(calcExcl) ? calcExcl : 0;

    const calcVat = sale_price - sale_price_excl_vat;
    vat_amount = Number.isFinite(calcVat) ? calcVat : 0;
  }

  // 1.2 Komisyon
  // Türkiye pazaryerlerinde komisyon KDV-HARİÇ liste fiyatı üzerinden kesilir (PRO mod ile tutarlı).
  // n11 ek bedelleri ("satış tutarı üzerinden") ise KDV-DAHİL fiyata uygulanır.
  const n11_extra_pct = n(input.n11_extra_pct, 0);
  const commission_amount = sale_price_excl_vat * (commission_pct / 100)
    + sale_price * (n11_extra_pct / 100);

  // 1.3 İade kaybı
  const expected_return_loss = (return_rate_pct / 100) * sale_price;

  // 1.4 Platform servis bedeli (Trendyol, Hepsiburada ve Custom'da uygulanır; n11 zaten n11_extra_pct içinde, Amazon TR'de yok)
  const service_fee_amount = (input.marketplace === 'trendyol' || input.marketplace === 'hepsiburada' || input.marketplace === 'custom')
    ? n(input.trendyol_service_fee, 0)
    : 0;

  // 1.5 Birim değişken gider toplamı
  const unit_variable_cost = product_cost + shipping_cost + packaging_cost + ad_cost_per_sale + other_cost + service_fee_amount;

  // 1.6 Birim toplam maliyet
  const unit_total_cost = unit_variable_cost + commission_amount + vat_amount + expected_return_loss;

  // 1.7 Birim net kâr
  const unit_net_profit = sale_price - unit_total_cost;

  // 1.8 Net kâr marjı
  const margin_pct = sale_price > 0 ? (unit_net_profit / sale_price) * 100 : 0;

  // 2.1 Aylık net kâr
  const monthly_net_profit = unit_net_profit * monthly_sales_volume;

  // 2.2 Aylık ciro
  const monthly_revenue = sale_price * monthly_sales_volume;

  // 2.3 Aylık toplam maliyet
  const monthly_total_cost = unit_total_cost * monthly_sales_volume;

  // 3.1 Başabaş fiyat
  const breakeven_price = calculateBreakevenPrice(input);

  return {
    commission_amount,
    vat_amount,
    expected_return_loss,
    service_fee_amount,
    unit_variable_cost,
    unit_total_cost,
    unit_net_profit,
    margin_pct,
    monthly_net_profit,
    monthly_revenue,
    monthly_total_cost,
    breakeven_price,
    sale_price,
    sale_price_excl_vat,
    // PRO-specific fields default to 0 in standard mode
    output_vat_monthly: 0,
    input_vat_monthly: 0,
    vat_position_monthly: 0,
    monthly_net_sales: 0,
  };
}

export function calculateBreakevenPrice(input: ProductInput): number {
  const product_cost = n(input.product_cost);
  const shipping_cost = n(input.shipping_cost);
  const packaging_cost = n(input.packaging_cost);
  const ad_cost_per_sale = n(input.ad_cost_per_sale);
  const other_cost = n(input.other_cost);
  const commission_pct = n(input.commission_pct);
  const n11_extra_pct = n(input.n11_extra_pct, 0);
  const vat_pct = n(input.vat_pct, 20);
  const return_rate_pct = n(input.return_rate_pct);

  const service_fee_amount = (input.marketplace === 'trendyol' || input.marketplace === 'hepsiburada' || input.marketplace === 'custom')
    ? n(input.trendyol_service_fee, 0)
    : 0;
  // Ek iade maliyeti: iade edilen birim başına operasyon/kargo bedeli → beklenen birim etkisi
  const return_extra_unit = n(input.return_extra_cost, 0) * (return_rate_pct / 100);
  const base_cost = product_cost + shipping_cost + packaging_cost + ad_cost_per_sale + other_cost + service_fee_amount + return_extra_unit;

  // Formül türetimi (komisyon KDV-hariç, n11 extra ve iade KDV-dahil üzerinden):
  // P × vat_factor × (1 - comm/100) − P × n11_extra/100 − P × return/100 = base_cost
  // → denominator = vat_factor × (1 − comm_pct/100) − n11_extra_pct/100 − return_factor
  const vat_factor = 1 / (1 + vat_pct / 100);
  const return_factor = return_rate_pct / 100;

  const denominator = vat_factor * (1 - commission_pct / 100)
    - (n11_extra_pct / 100)
    - return_factor;

  if (denominator <= 0) return Infinity;

  return base_cost / denominator;
}

export function calculateWithOverrides(
  base: ProductInput,
  overrides: Partial<ProductInput>
): CalculationResult {
  return calculateProfit({ ...base, ...overrides });
}

export function calculateRequiredPrice(
  input: ProductInput,
  type: 'margin' | 'profit',
  value: number
): number {
  const product_cost = n(input.product_cost);
  const shipping_cost = n(input.shipping_cost);
  const packaging_cost = n(input.packaging_cost);
  const ad_cost_per_sale = n(input.ad_cost_per_sale);
  const other_cost = n(input.other_cost);
  const commission_pct = n(input.commission_pct);
  const n11_extra_pct = n(input.n11_extra_pct, 0);
  const vat_pct = n(input.vat_pct, 20);
  const return_rate_pct = n(input.return_rate_pct);

  const service_fee_amount = (input.marketplace === 'trendyol' || input.marketplace === 'hepsiburada' || input.marketplace === 'custom')
    ? n(input.trendyol_service_fee, 0)
    : 0;
  const return_extra_unit = n(input.return_extra_cost, 0) * (return_rate_pct / 100);
  const base_cost = product_cost + shipping_cost + packaging_cost + ad_cost_per_sale + other_cost + service_fee_amount + return_extra_unit;
  // Komisyon KDV-hariç, n11 extra ve iade KDV-dahil — calculateBreakevenPrice ile aynı türetim
  const vat_factor = 1 / (1 + vat_pct / 100);
  const return_factor = return_rate_pct / 100;
  const base_denominator = vat_factor * (1 - commission_pct / 100)
    - (n11_extra_pct / 100)
    - return_factor;

  if (type === 'margin') {
    const target_margin_rate = value / 100;
    const denominator = base_denominator - target_margin_rate;
    if (denominator <= 0) return 0;
    return base_cost / denominator;
  } else {
    // Target net profit per unit
    if (base_denominator <= 0) return 0;
    return (value + base_cost) / base_denominator;
  }
}

export function generateSensitivityAnalysis(input: ProductInput) {
  const original = calculateProfit(input);

  const scenarios: { scenario: string; overrides: Partial<ProductInput> }[] = [
    { scenario: 'Fiyat +5%', overrides: { sale_price: input.sale_price * 1.05 } },
    { scenario: 'Fiyat +10%', overrides: { sale_price: input.sale_price * 1.10 } },
    { scenario: 'Fiyat -5%', overrides: { sale_price: input.sale_price * 0.95 } },
    { scenario: 'Fiyat -10%', overrides: { sale_price: input.sale_price * 0.90 } },
    { scenario: 'Komisyon +2%', overrides: { commission_pct: input.commission_pct + 2 } },
    { scenario: 'Komisyon -2%', overrides: { commission_pct: Math.max(0, input.commission_pct - 2) } },
    { scenario: 'Reklam maliyeti +5₺', overrides: { ad_cost_per_sale: input.ad_cost_per_sale + 5 } },
    { scenario: 'Reklam maliyeti +10₺', overrides: { ad_cost_per_sale: input.ad_cost_per_sale + 10 } },
    { scenario: 'İade oranı 2x', overrides: { return_rate_pct: Math.min(100, input.return_rate_pct * 2) } },
    { scenario: 'Satış hacmi +20%', overrides: { monthly_sales_volume: Math.round(input.monthly_sales_volume * 1.2) } },
  ];

  return scenarios.map(({ scenario, overrides }) => {
    const result = calculateWithOverrides(input, overrides);
    const diff = result.monthly_net_profit - original.monthly_net_profit;
    return {
      scenario,
      originalProfit: original.monthly_net_profit,
      newProfit: result.monthly_net_profit,
      difference: diff,
      percentChange: original.monthly_net_profit !== 0
        ? (diff / Math.abs(original.monthly_net_profit)) * 100
        : 0,
    };
  });
}

// ... existing code ...

export function calculateCashflow(input: ProductInput) {
  const volume = n(input.monthly_sales_volume);
  const payoutDelay = n(input.payout_delay_days);

  // Satıcının doğrudan ödediği birim başı nakit çıkışı
  // (service_fee pazaryeri tarafından ödemeden kesilir, ayrı çıkış değil)
  const unitCashOut = n(input.product_cost) + n(input.shipping_cost)
    + n(input.packaging_cost) + n(input.other_cost) + n(input.ad_cost_per_sale);
  const monthlyOutflow = unitCashOut * volume;
  const dailyOutflow = monthlyOutflow / 30;
  const workingCapitalNeeded = dailyOutflow * payoutDelay;

  const result = calculateProfit(input);
  // Pazaryerinin satıcıya yansıttığı aylık net ödeme:
  // ciro − komisyon (aylık) − servis bedeli (aylık) − KDV (aylık)
  // NOT: commission_amount, service_fee_amount, vat_amount birim başı değerler — volume ile çarpılır
  const monthlyInflow = result.monthly_revenue
    - (result.commission_amount + result.service_fee_amount + result.vat_amount) * volume;

  const receivedFraction = Math.max(0, 30 - payoutDelay) / 30;
  const monthlyCashGap = monthlyOutflow - monthlyInflow * receivedFraction;

  return {
    workingCapitalNeeded: Math.max(0, workingCapitalNeeded),
    monthlyCashGap: Math.max(0, monthlyCashGap),
    dailyCashBurn: dailyOutflow,
  };
}

export function calculateAdCeiling(input: ProductInput): number {
  // 1. Create a copy of input with 0 ad cost
  const tempInput = { ...input, ad_cost_per_sale: 0 };

  // 2. Calculate profit with 0 ads
  const result = calculateProfit(tempInput);

  // 3. The ceiling is exactly the Net Profit (Ads=0).
  // Why? Profit = Revenue - Costs.
  // Costs = Fixed + Variable(no_ads) + AdCost.
  // Profit = [Revenue - Fixed - Variable(no_ads)] - AdCost.
  // Profit = Profit(Ads=0) - AdCost.
  // To reach BreakEven (Profit=0): 0 = Profit(Ads=0) - AdCost => AdCost = Profit(Ads=0).

  // Safety: If Profit(Ads=0) is negative, then even 0 ads result in loss.
  // In that case, ceiling is effectively 0 (or negative to indicate impossibility).
  return Math.max(0, result.unit_net_profit);
}
=== END ===

=== FILE: utils/risk-engine.ts ===
import { ProductInput, CalculationResult, RiskResult, RiskLevel, RiskFactor } from '@/types';
import { n } from './calculations';

export function calculateRisk(input: ProductInput, result: CalculationResult): RiskResult {
  console.debug('[Risk] Input:', input, 'Result:', result);
  const factors: RiskFactor[] = [];

  const margin_pct = n(result.margin_pct);
  const return_rate_pct = n(input.return_rate_pct);
  const sale_price = n(input.sale_price);
  const ad_cost_per_sale = n(input.ad_cost_per_sale);
  const commission_pct = n(input.commission_pct);

  // 4.1 Skor bileşenleri

  // Margin score (0–40)
  let marginScore = 0;
  if (margin_pct >= 20) {
    marginScore = 40;
  } else if (margin_pct >= 10) {
    marginScore = 20 + ((margin_pct - 10) / 10) * 20;
  } else if (margin_pct >= 0) {
    marginScore = (margin_pct / 10) * 20;
  }
  if (margin_pct < 10) {
    factors.push({
      name: 'Düşük Kar Marjı',
      impact: Math.round(40 - marginScore),
      description: `Kar marjı %${margin_pct.toFixed(1)} — ${margin_pct < 0 ? 'Zarar durumu' : 'Riskli seviye'}`,
    });
  }

  // Return score (0–20)
  let returnScore = 0;
  if (return_rate_pct <= 5) {
    returnScore = 20;
  } else if (return_rate_pct <= 15) {
    returnScore = 20 - ((return_rate_pct - 5) / 10) * 10;
  } else {
    returnScore = Math.max(0, 10 - ((return_rate_pct - 15) / 10) * 10);
  }
  if (return_rate_pct > 10) {
    factors.push({
      name: 'Yüksek İade Oranı',
      impact: Math.round(20 - returnScore),
      description: `İade oranı %${return_rate_pct} — Ortalamanın üzerinde iade maliyeti.`,
    });
  }

  // Ad dependency (0–20)
  const ad_ratio = sale_price > 0 ? (ad_cost_per_sale / sale_price) * 100 : 0;
  let adScore = 0;
  if (ad_ratio <= 3) {
    adScore = 20;
  } else if (ad_ratio <= 10) {
    adScore = 20 - ((ad_ratio - 3) / 7) * 10;
  } else {
    adScore = Math.max(0, 10 - ((ad_ratio - 10) / 10) * 10);
  }
  if (ad_ratio > 10) {
    factors.push({
      name: 'Reklam Bağımlılığı',
      impact: Math.round(20 - adScore),
      description: `Reklam/satış oranı %${ad_ratio.toFixed(1)} — Satışlarınız reklama çok bağımlı.`,
    });
  }

  // Commission score (0–20)
  let commissionScore = 0;
  if (commission_pct <= 12) {
    commissionScore = 20;
  } else if (commission_pct <= 20) {
    commissionScore = 20 - ((commission_pct - 12) / 8) * 10;
  } else {
    commissionScore = Math.max(0, 10 - ((commission_pct - 20) / 10) * 10);
  }
  if (commission_pct > 20) {
    factors.push({
      name: 'Yüksek Komisyon',
      impact: Math.round(20 - commissionScore),
      description: `Komisyon oranı %${commission_pct} — Pazaryeri kesintileri kârı eritiyor.`,
    });
  }

  const score = Math.round(marginScore + returnScore + adScore + commissionScore);
  const clampedScore = Math.max(0, Math.min(100, score));

  return {
    score: clampedScore,
    level: getLevel(clampedScore),
    factors,
  };
}

function getLevel(score: number): RiskLevel {
  // 4.2 Risk seviyesi
  if (score >= 80) return 'safe';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'risky';
  return 'dangerous';
}

export const riskLevelConfig: Record<RiskLevel, { label: string; color: string; bgColor: string; textColor: string }> = {
  safe: { label: 'Güvenli', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-400' },
  moderate: { label: 'Orta', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400' },
  risky: { label: 'Riskli', color: '#f97316', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400' },
  dangerous: { label: 'Tehlikeli', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
};
=== END ===

=== FILE: utils/pro-accounting.ts ===
import { ProductInput, CalculationResult } from '@/types';
import { n, calculateBreakevenPrice } from '@/utils/calculations';

/**
 * Split a value into net and VAT components
 */
export function splitVat(amount: number, vatPct: number, includesVat: boolean) {
    const vatRate = n(vatPct) / 100;
    if (includesVat) {
        const net = amount / (1 + vatRate);
        return {
            net: Number.isFinite(net) ? net : 0,
            vat: Number.isFinite(amount - net) ? (amount - net) : 0
        };
    } else {
        const vat = amount * vatRate;
        return {
            net: amount,
            vat: Number.isFinite(vat) ? vat : 0
        };
    }
}

/**
 * Professional Accounting Mode (Granular Implementation)
 */
export function calculateProAccounting(input: ProductInput): CalculationResult {
    const volume = n(input.monthly_sales_volume);
    const r = n(input.return_rate_pct) / 100;

    // 1. Sales
    const saleVatPct = n(input.sale_vat_pct ?? input.vat_pct, 20);
    const sales = splitVat(n(input.sale_price), saleVatPct, input.sale_price_includes_vat !== false);

    // 2. Product Cost
    const purchaseVatPct = n(input.purchase_vat_pct ?? saleVatPct);
    const cost = splitVat(n(input.product_cost), purchaseVatPct, input.product_cost_includes_vat !== false);

    // 3. Marketplace Commission
    const commNet = sales.net * (n(input.commission_pct) / 100);
    const mpFeeVatPct = n(input.marketplace_fee_vat_pct, 20);
    const commVat = commNet * (mpFeeVatPct / 100);

    // 4. Expenses
    const shipping = splitVat(n(input.shipping_cost), n(input.shipping_vat_pct, 20), input.shipping_includes_vat !== false);
    const packaging = splitVat(n(input.packaging_cost), n(input.packaging_vat_pct, 20), input.packaging_includes_vat !== false);
    const ad = splitVat(n(input.ad_cost_per_sale), n(input.ad_vat_pct, 20), input.ad_includes_vat !== false);
    const other = splitVat(n(input.other_cost), n(input.other_cost_vat_pct, 20), input.other_cost_includes_vat !== false);

    const expensesNetTotal = shipping.net + packaging.net + ad.net + other.net;
    const expensesVatTotal = shipping.vat + packaging.vat + ad.vat + other.vat;

    // 5. Returns
    const lostNetSales = sales.net * r;
    const returnedCommNet = input.return_refunds_commission !== false ? (commNet * r) : 0;
    // Extra operational cost of return (e.g. return shipping)
    const returnExtraOpsCost = n(input.return_extra_cost) * r;

    const return_loss_net = lostNetSales - returnedCommNet + returnExtraOpsCost;

    // 6. Unit Profit (VAT-excluded)
    const unit_net_profit = sales.net - (cost.net + commNet + expensesNetTotal + return_loss_net);

    // 7. Monthly Aggregates
    const monthly_net_profit = unit_net_profit * volume;
    const monthly_net_sales = sales.net * volume;

    // 8. VAT Position (Monthly)
    // Output VAT is only collected on kept sales
    const output_vat_monthly = sales.vat * volume * (1 - r);
    // Input VAT is the sum of all deductible VATs (purchase, expenses, marketplace fee)
    const input_vat_monthly = (cost.vat * volume) + (expensesVatTotal * volume) + (commVat * volume);
    const vat_position_monthly = output_vat_monthly - input_vat_monthly;

    // 9. Legacy Fields for UI Compatibility
    const unit_variable_cost = cost.net + shipping.net + packaging.net + ad.net + other.net;
    const unit_total_cost = unit_variable_cost + commNet + return_loss_net;
    const margin_pct = sales.net > 0 ? (unit_net_profit / sales.net) * 100 : 0;

    // Breakeven price calculation needs the same logic (if possible) or fallback
    const breakeven_price = calculateBreakevenPrice(input);

    return {
        commission_amount: Number.isFinite(commNet) ? commNet : 0,
        vat_amount: Number.isFinite(sales.vat) ? sales.vat : 0, // Unit Output VAT
        expected_return_loss: Number.isFinite(return_loss_net) ? return_loss_net : 0,
        service_fee_amount: 0, // PRO modda servis bedeli standart moddan geliyor
        unit_variable_cost: Number.isFinite(unit_variable_cost) ? unit_variable_cost : 0,
        unit_total_cost: Number.isFinite(unit_total_cost) ? unit_total_cost : 0,
        unit_net_profit: Number.isFinite(unit_net_profit) ? unit_net_profit : 0,
        margin_pct: Number.isFinite(margin_pct) ? margin_pct : 0,
        monthly_net_profit: Number.isFinite(monthly_net_profit) ? monthly_net_profit : 0,
        monthly_revenue: n(input.sale_price) * volume, // Gross revenue for display
        monthly_total_cost: unit_total_cost * volume,
        breakeven_price: Number.isFinite(breakeven_price) ? breakeven_price : 0,
        sale_price: n(input.sale_price),
        sale_price_excl_vat: Number.isFinite(sales.net) ? sales.net : 0,

        // PRO specific
        output_vat_monthly: Number.isFinite(output_vat_monthly) ? output_vat_monthly : 0,
        input_vat_monthly: Number.isFinite(input_vat_monthly) ? input_vat_monthly : 0,
        vat_position_monthly: Number.isFinite(vat_position_monthly) ? vat_position_monthly : 0,
        monthly_net_sales: Number.isFinite(monthly_net_sales) ? monthly_net_sales : 0,
    };
}
=== END ===

=== FILE: utils/access.ts ===
import { User } from '@/types';

/**
 * Single source of truth: is this user PRO?
 *
 * Uses `user.plan` and expiration fields from the Supabase `profiles` table.
 *
 * Every premium gate in the app MUST use this function.
 *
 * Logic:
 * 1. plan === 'pro' or 'admin' → check expiration
 * 2. pro_until is future → pro (legacy field)
 * 3. pro_expires_at is null → pro does NOT expire (null = no expiry)
 * 4. pro_expires_at is future → pro still active
 * 5. pro_expires_at is past → pro expired
 */
const PRO_PLANS: string[] = ['pro', 'pro_monthly', 'pro_yearly'];

export function isProUser(user: User | null | undefined): boolean {
    if (!user) return false;

    // Admin always has access
    if (user.plan === 'admin') return true;

    // Check plan + expiration (NULL-safe: null means no expiry)
    if (PRO_PLANS.includes(user.plan)) {
        // If pro_expires_at is null/undefined → pro is active (no expiry set)
        if (!user.pro_expires_at) return true;

        // If pro_expires_at exists, check if it's still in the future
        const expiresAt = new Date(user.pro_expires_at);
        if (!isNaN(expiresAt.getTime()) && expiresAt > new Date()) {
            return true;
        }

        // Expired — fall through to check pro_until as fallback
    }

    // Check time-based expiration (legacy field: pro_until)
    if (user.pro_until) {
        const expirationDate = new Date(user.pro_until);
        if (!isNaN(expirationDate.getTime()) && expirationDate > new Date()) {
            return true;
        }
    }

    return false;
}

/**
 * Returns true if the user is on the starter plan (and not pro/admin).
 * Pro and admin users get everything starter has, so check isProUser separately
 * if you need to distinguish between starter and pro.
 */
export function isStarterUser(user: User | null | undefined): boolean {
    if (!user) return false;
    return user.plan === 'starter';
}
=== END ===

=== FILE: types/index.ts ===
export type Marketplace = 'trendyol' | 'hepsiburada' | 'n11' | 'amazon_tr' | 'custom';
export type PlanType = 'free' | 'starter' | 'pro' | 'pro_monthly' | 'pro_yearly' | 'admin';
export type RiskLevel = 'safe' | 'moderate' | 'risky' | 'dangerous';

export interface User {
  id: string;
  email: string;
  plan: PlanType;
  pro_until?: string | null;
  email_alerts_enabled?: boolean;
  email_notifications_enabled?: boolean;
  pro_expires_at?: string | null;
  pro_renewal?: boolean;
  pro_started_at?: string | null;
  // Account preferences
  target_margin?: number;
  margin_alert?: boolean;
  // Email preferences
  email_weekly_report?: boolean;
  email_risk_alert?: boolean;
  email_margin_alert?: boolean;
  email_pro_expiry?: boolean;
  default_marketplace?: Marketplace;
  default_commission?: number;
  default_vat?: number;
  monthly_profit_target?: number;
  default_return_rate?: number;
  default_ads_cost?: number;
  fixed_cost_monthly?: number;
  target_profit_monthly?: number;
}

export interface CashPlanRow {
  id?: string;
  user_id: string;
  month: string; // YYYY-MM
  opening_cash: number;
  cash_in: number;
  cash_out: number;
  closing_cash: number;
}

export type AlertType = 'danger' | 'warning' | 'info';

export interface Notification {
  id: string;
  user_id: string;
  analysis_id?: string;
  product_id?: string;
  href?: string;
  type: AlertType;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  dedupe_key?: string;
}

export interface ProductInput {
  marketplace: Marketplace;
  product_name: string;
  monthly_sales_volume: number;
  product_cost: number;
  sale_price: number;
  commission_pct: number;
  shipping_cost: number;
  packaging_cost: number;
  ad_cost_per_sale: number;
  return_rate_pct: number;
  vat_pct?: number; // defaults to 20 via n() fallback in calculators
  other_cost: number;
  payout_delay_days: number;
  competitor_price?: number;
  competitor_name?: string;
  target_position?: 'cheaper' | 'same' | 'premium';

  // Granular PRO Mode Fields
  pro_mode?: boolean;
  sale_price_includes_vat?: boolean;
  sale_vat_pct?: number;
  product_cost_includes_vat?: boolean;
  purchase_vat_pct?: number;
  marketplace_fee_vat_pct?: number;

  shipping_includes_vat?: boolean;
  shipping_vat_pct?: number;
  packaging_includes_vat?: boolean;
  packaging_vat_pct?: number;
  ad_includes_vat?: boolean;
  ad_vat_pct?: number;
  other_cost_includes_vat?: boolean;
  other_cost_vat_pct?: number;

  return_refunds_commission?: boolean;
  return_extra_cost?: number;

  // Category selected in the marketplace category dropdown
  marketplace_category?: string;
  /** @deprecated use marketplace_category */
  trendyol_category?: string;

  // n11 extra fees: +1.20% marketing + 0.67% marketplace = 1.87%
  n11_extra_pct?: number;

  // Trendyol sabit servis bedeli (sipariş tutarına göre dilimli)
  trendyol_service_fee?: number;

  // Legacy/Standard fields keep compatibility
  accounting_mode?: 'standard' | 'pro';
  income_tax_pct?: number;
}

export interface CalculationResult {
  commission_amount: number;
  vat_amount: number; // Unit Output VAT
  expected_return_loss: number;
  service_fee_amount: number; // Trendyol sabit servis bedeli
  unit_variable_cost: number;
  unit_total_cost: number;
  unit_net_profit: number;
  margin_pct: number;
  monthly_net_profit: number;
  monthly_revenue: number;
  monthly_total_cost: number;
  breakeven_price: number;
  sale_price: number; // Added for consistency
  sale_price_excl_vat: number;

  // PRO specific results
  output_vat_monthly: number;
  input_vat_monthly: number;
  vat_position_monthly: number;
  monthly_net_sales: number;
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

export interface Analysis {
  id: string;
  userId: string;
  input: ProductInput;
  result: CalculationResult;
  risk: RiskResult;
  createdAt: string;
}

export interface MarketplaceDefaults {
  key: Marketplace;
  label: string;
  commission_pct: number;
  return_rate_pct: number;
  vat_pct: number;
  payout_delay_days: number;
}

export type SupportPriority = 'low' | 'medium' | 'high';
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  priority: SupportPriority;
  status: SupportStatus;
  admin_note?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
}

// Yeni destek talebi sistemi tipleri
export type TicketCategory = 'teknik' | 'odeme' | 'hesap' | 'oneri' | 'diger'
export type TicketPriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'
export type TicketStatus = 'acik' | 'inceleniyor' | 'cevaplandi' | 'kapali'

export interface Ticket {
  id: string
  user_id: string
  user_email: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  message: string
  admin_reply: string | null
  admin_replied_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTicketDto {
  subject: string
  category: TicketCategory
  priority: TicketPriority
  message: string
}

export interface UpdateTicketDto {
  admin_reply?: string
  status?: TicketStatus
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  search?: string
}

export interface TicketStats {
  open: number
  reviewing: number
  answeredToday: number
  total: number
}
=== END ===

=== FILE: lib/api/analyses.ts ===
import { Analysis } from '@/types'

export async function getStoredAnalyses(): Promise<Analysis[]> {
  const res = await fetch('/api/analyses')
  if (!res.ok) throw new Error('Analizler yüklenemedi')
  return res.json()
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const res = await fetch(`/api/analyses/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function saveAnalysis(analysis: Analysis): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysis),
  })
  return res.json()
}

export async function deleteAnalysis(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function getUserAnalysisCount(): Promise<number> {
  const res = await fetch('/api/analyses/count')
  if (!res.ok) return 0
  const data = await res.json()
  return data.count ?? 0
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
=== END ===
