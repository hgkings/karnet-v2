=== FILE: app/pricing/page.tsx ===
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import {
  Check, X, Crown, Loader2, RefreshCw, Zap,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/config/plans';
import { PRICING } from '@/config/pricing';
import { isProUser, isStarterUser } from '@/utils/access';
import { toast } from 'sonner';
import { PricingSection } from '@/components/shared/PricingSection';
import type { PricingTier } from '@/components/shared/PricingSection';

// ─── types ───────────────────────────────────────────────────────────────────
type BillingCycle = 'monthly' | 'yearly';

// ─── constants ───────────────────────────────────────────────────────────────
const FREE_LIMIT = PLAN_LIMITS.free.maxProducts;
const STARTER_LIMIT = PLAN_LIMITS.starter.maxProducts;
const STARTER_MONTHLY = PRICING.starter.monthly;
const STARTER_YEARLY  = PRICING.starter.annual;
const PRO_MONTHLY     = PRICING.pro.monthly;
const PRO_YEARLY      = PRICING.pro.annual;

const COMPARISON_ROWS: { label: string; free: string | boolean; starter: string | boolean; pro: string | boolean }[] = [
  { label: 'Ürün analizi',                        free: `${FREE_LIMIT} ürün`,      starter: `${STARTER_LIMIT} ürün`, pro: 'Sınırsız' },
  { label: 'Temel kâr hesaplama',                 free: true,    starter: true,    pro: true    },
  { label: 'PRO Muhasebe Modu (KDV ayrıştırma)',  free: false,   starter: true,    pro: true    },
  { label: 'Hassasiyet analizi',                  free: false,   starter: true,    pro: true    },
  { label: 'Başa-baş noktası analizi',            free: false,   starter: true,    pro: true    },
  { label: 'CSV içe / dışa aktarma',              free: false,   starter: true,    pro: true    },
  { label: 'Pazaryeri karşılaştırması',           free: false,   starter: false,   pro: true    },
  { label: 'Nakit akışı tahmini',                 free: false,   starter: false,   pro: true    },
  { label: 'Trendyol / Hepsiburada API',          free: false,   starter: false,   pro: true    },
  { label: 'PDF rapor',                           free: false,   starter: '5/ay',  pro: 'Sınırsız' },
  { label: 'Haftalık e-posta raporu',             free: false,   starter: false,   pro: true    },
  { label: 'Öncelikli destek',                    free: false,   starter: false,   pro: true    },
  { label: 'Rakip takibi',                        free: false,   starter: false,   pro: true    },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Ücretsiz plandan Başlangıç veya Pro\'ya geçince verilerim kalır mı?',
    a: 'Evet, tüm analizleriniz ve verileriniz eksiksiz korunur. Plan yükseltmesi mevcut verilerinizi hiçbir şekilde etkilemez.',
  },
  {
    q: 'İptal etmek için ne yapmalıyım?',
    a: 'İstediğiniz zaman ayarlar sayfasından aboneliğinizi iptal edebilirsiniz. İptal sonrası dönem sonuna kadar plan özelliklerini kullanmaya devam edersiniz.',
  },
  {
    q: 'Ödeme güvenli mi?',
    a: 'Ödemeler PayTR güvencesiyle gerçekleştirilir. Kart bilgileriniz Kârnet sunucularında saklanmaz; doğrudan PayTR\'ın PCI-DSS sertifikalı altyapısında işlenir.',
  },
  {
    q: 'Başlangıç\'tan Pro\'ya geçebilir miyim?',
    a: 'Evet, mevcut dönem sonunda veya hemen yükselterek Pro planına geçebilirsiniz. Ayarlar sayfasından plan yönetimine ulaşabilirsiniz.',
  },
  {
    q: '7 gün iade garantisi nasıl çalışır?',
    a: 'Satın alma tarihinden itibaren 7 gün içinde, herhangi bir gerekçe göstermeksizin destek ekibimizden tam iade talep edebilirsiniz.',
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function CellValue({ val }: { val: string | boolean }) {
  if (val === true)  return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium">{val}</span>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ─── inner page (uses useSearchParams — wrapped in Suspense below) ────────────

function PricingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingCycle>(
    searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly',
  );
  const [loadingPro, setLoadingPro] = useState(false);
  const [loadingStarter, setLoadingStarter] = useState(false);

  const isAnnual = billing === 'yearly';
  const paymentStatus = searchParams.get('payment'); // 'success' | 'fail' | null
  const [pollState, setPollState] = useState<'idle' | 'polling' | 'active' | 'pending'>('idle');
  const [pollCount, setPollCount] = useState(0);

  const refreshProfile = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      const plan = data?.plan || data?.profile?.plan || '';
      return plan === 'pro' || plan.startsWith('pro_') || plan === 'starter' || plan.startsWith('starter_');
    } catch {
      return false;
    }
  }, []);

  // Poll for plan activation after successful payment
  useEffect(() => {
    if (paymentStatus !== 'success' || !user) return;
    if (pollState !== 'idle') return;
    if (isProUser(user) || isStarterUser(user)) { setPollState('active'); toast.success('Planınız zaten aktif!'); return; }

    setPollState('polling');
    toast.success('Ödeme başarılı ✅ Planınız kontrol ediliyor...');
    let attempt = 0;
    const poll = async () => {
      attempt++;
      setPollCount(attempt);
      const isActive = await refreshProfile();
      if (isActive) {
        setPollState('active');
        toast.success('Planınız aktif edildi!');
        setTimeout(() => window.location.href = '/pricing', 1500);
        return;
      }
      if (attempt < 6) setTimeout(poll, 5000);
      else setPollState('pending');
    };
    setTimeout(poll, 3000);
  }, [paymentStatus, user, pollState, refreshProfile]);

  useEffect(() => {
    if (paymentStatus === 'fail') toast.error('Ödeme başarısız ❌ Tekrar deneyebilirsiniz.');
  }, [paymentStatus]);

  const handleUpgrade = async (planType: 'pro_monthly' | 'pro_yearly') => {
    if (!user) { window.location.href = '/auth'; return; }
    setLoadingPro(true);
    try {
      const res = await fetch('/api/paytr/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        const params = new URLSearchParams({ paymentId: data.paymentId });
        if (data.token) params.set('token', data.token);
        window.location.href = `/basari?${params.toString()}`;
      } else {
        toast.error(data.error || 'Ödeme başlatılamadı.');
        setLoadingPro(false);
      }
    } catch {
      setLoadingPro(false);
    }
  };

  // NOTE: Starter payments require create-payment route to accept 'starter_monthly'/'starter_yearly'.
  // Currently that route only accepts pro plans. Wire this up when the route is updated.
  const handleStarterUpgrade = async () => {
    if (!user) { window.location.href = '/auth'; return; }
    setLoadingStarter(true);
    try {
      const planType = isAnnual ? 'starter_yearly' : 'starter_monthly';
      const res = await fetch('/api/paytr/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        const params = new URLSearchParams({ paymentId: data.paymentId });
        if (data.token) params.set('token', data.token);
        window.location.href = `/basari?${params.toString()}`;
      } else {
        toast.error(data.error || 'Ödeme başlatılamadı.');
        setLoadingStarter(false);
      }
    } catch {
      setLoadingStarter(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 space-y-20">

        {/* ─ Payment Return Banners ─────────────────────────────────────────── */}
        {paymentStatus === 'success' && (
          <div className={cn(
            'mx-auto max-w-2xl rounded-xl border p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4',
            pollState === 'active'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/20',
          )}>
            {pollState === 'active' ? (
              <><CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div><p className="font-semibold text-emerald-400">Plan Aktif ✅</p>
                  <p className="text-sm text-emerald-500">Planınız başarıyla aktif edildi!</p></div></>
            ) : pollState === 'pending' ? (
              <><Loader2 className="h-6 w-6 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-400">Ödeme Alındı ⏳</p>
                  <p className="text-sm text-amber-500">30 saniye içinde otomatik aktif olur.</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={async () => {
                  setPollState('polling'); setPollCount(0);
                  const isActive = await refreshProfile();
                  if (isActive) { setPollState('active'); toast.success('Plan aktif ✅'); setTimeout(() => window.location.href = '/pricing', 1500); }
                  else { setPollState('pending'); toast.info('Henüz aktif değil, biraz daha bekleyin.'); }
                }}>
                  <RefreshCw className="h-4 w-4 mr-1" />Yenile
                </Button></>
            ) : (
              <><Loader2 className="h-6 w-6 text-amber-400 animate-spin shrink-0" />
                <div><p className="font-semibold text-amber-400">Ödeme Başarılı ✅</p>
                  <p className="text-sm text-amber-500">Planınız kontrol ediliyor… ({pollCount}/6)</p></div></>
            )}
          </div>
        )}
        {paymentStatus === 'fail' && (
          <div className="mx-auto max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <XCircle className="h-6 w-6 text-red-400 shrink-0" />
            <div><p className="font-semibold text-red-400">Ödeme Başarısız ❌</p>
              <p className="text-sm text-red-500">Ödeme tamamlanamadı. Tekrar deneyebilirsiniz.</p></div>
          </div>
        )}

        {/* ─ Header ────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <span className="inline-block mb-1 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Fiyatlandırma
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-geist">
            Sade ve Şeffaf Fiyatlandırma
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Gizli ücret yok. İstediğin zaman iptal et.
          </p>
        </div>

        {/* ─ Plan Cards — PricingSection ───────────────────────────────────── */}
        {(() => {
          const freeTier: PricingTier = {
            name: 'Ücretsiz',
            price: { monthly: 0, yearly: 0 },
            description: 'Yeni başlayanlar ve denemek isteyenler için.',
            icon: <span className="text-xl">🚀</span>,
            actionLabel: 'Ücretsiz Başla',
            onAction: () => { window.location.href = user ? '/dashboard' : '/auth'; },
            features: [
              { name: `${FREE_LIMIT} ürüne kadar analiz`, description: 'Kayıt edilebilir ürün sayısı', included: true },
              { name: 'Temel kâr hesaplama', description: 'Komisyon, kargo, KDV dahil', included: true },
              { name: 'PRO Muhasebe Modu', description: 'Başlangıç ve üstü planlarda', included: false },
              { name: 'CSV içe / dışa aktarma', description: 'Başlangıç ve üstü planlarda', included: false },
              { name: 'Hassasiyet analizi', description: 'Başlangıç ve üstü planlarda', included: false },
              { name: 'Pazaryeri karşılaştırması', description: 'Pro planında aktif', included: false },
              { name: 'Nakit akışı tahmini', description: 'Pro planında aktif', included: false },
            ],
          };

          const currentUserIsStarter = user && isStarterUser(user);
          const starterTier: PricingTier = {
            name: 'Başlangıç',
            price: { monthly: STARTER_MONTHLY, yearly: STARTER_YEARLY },
            description: 'Küçük ve orta öl��ekli satıcılar için.',
            highlight: true,
            badge: 'EN POPÜLER',
            icon: <Zap className="h-5 w-5" />,
            actionLabel: currentUserIsStarter ? 'Mevcut Plan' : 'Başlangıç\'a Geç',
            onAction: currentUserIsStarter ? undefined : handleStarterUpgrade,
            features: [
              { name: `${STARTER_LIMIT} ürüne kadar analiz`, description: 'Kayıt edilebilir ürün sayısı', included: true },
              { name: 'PRO Muhasebe Modu', description: 'KDV ayrıştırma, net kâr', included: true },
              { name: 'Hassasiyet analizi', description: 'Senaryo bazlı projeksiyon', included: true },
              { name: 'Başa-baş noktası analizi', description: 'Break-even hesaplama', included: true },
              { name: 'CSV içe / dışa aktarma', description: 'Excel ile tam entegrasyon', included: true },
              { name: 'PDF rapor (5 adet/ay)', description: 'Aylık 5 rapor', included: true },
              { name: 'Pazaryeri karşılaştırması', description: 'Pro planında aktif', included: false },
              { name: 'Nakit akışı & API entegrasyonu', description: 'Pro planında aktif', included: false },
            ],
          };

          const currentUserIsPro = user && isProUser(user);
          const proTier: PricingTier = {
            name: 'Profesyonel',
            price: { monthly: PRO_MONTHLY, yearly: PRO_YEARLY },
            description: 'Büyük ölçekli ve profesyonel satıcılar için.',
            icon: <Crown className="h-5 w-5" />,
            actionLabel: currentUserIsPro ? 'Mevcut Plan' : 'Pro\'ya Geç',
            onAction: currentUserIsPro ? undefined : () => handleUpgrade(isAnnual ? 'pro_yearly' : 'pro_monthly'),
            features: [
              { name: 'Sınırsız ürün analizi', description: 'Dilediğiniz kadar analiz', included: true },
              { name: 'Pazaryeri karşılaştırması', description: 'Trendyol vs HB vs Amazon', included: true },
              { name: 'Nakit akışı tahmini', description: 'Aylık cashflow projeksiyonu', included: true },
              { name: 'API entegrasyonu', description: 'Trendyol & Hepsiburada', included: true },
              { name: 'Sınırsız PDF rapor', description: 'İstediğin kadar rapor', included: true },
              { name: 'Haftal��k e-posta raporu', description: 'Otomatik haftalık özet', included: true },
              { name: 'Rakip takibi', description: 'Otomatik fiyat izleme', included: true },
              { name: 'Öncelikli destek', description: 'Hızlı yanıt garantisi', included: true },
            ],
          };

          return (
            <PricingSection
              tiers={[freeTier, starterTier, proTier]}
              className="!py-0"
              onBillingChange={(isYearly) => setBilling(isYearly ? 'yearly' : 'monthly')}
            />
          );
        })()}

        {/* ─ Comparison Table ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Özellik Karşılaştırması</h2>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)]">
              <div className="p-4 text-sm font-semibold text-[rgba(255,255,255,0.5)]">Özellik</div>
              <div className="p-4 text-sm font-semibold text-center border-l border-[rgba(255,255,255,0.06)]">Ücretsiz</div>
              <div className="p-4 text-sm font-semibold text-center border-l border-[rgba(255,255,255,0.06)] text-amber-400">Başlangıç</div>
              <div className="p-4 text-sm font-semibold text-center border-l border-[rgba(255,255,255,0.06)] text-amber-400">Pro</div>
            </div>
            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.label} className={cn('grid grid-cols-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0', i % 2 === 0 ? 'bg-transparent' : 'bg-[rgba(255,255,255,0.02)]')}>
                <div className="p-3.5 text-sm text-[rgba(255,255,255,0.7)]">{row.label}</div>
                <div className="p-3.5 text-center border-l border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <CellValue val={row.free} />
                </div>
                <div className="p-3.5 text-center border-l border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <CellValue val={row.starter} />
                </div>
                <div className="p-3.5 text-center border-l border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <CellValue val={row.pro} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─ Trust Bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>PayTR güvencesi</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            <span>Kart bilginiz saklanmaz</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            <span>7 gün iade garantisi</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            <span>İstediğiniz zaman iptal</span>
          </div>
        </div>

        {/* ─ FAQ ────────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Sıkça Sorulan Sorular</h2>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 divide-y divide-[rgba(255,255,255,0.06)]">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ─ Bottom CTA ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-5 py-8">
          <h2 className="text-2xl font-bold">Hâlâ kararsız mısın?</h2>
          <p className="text-muted-foreground">
            Ücretsiz planla başla, istediğinde yükselt.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="outline" size="lg" className="rounded-xl h-12 px-8" asChild>
              <a href={user ? '/dashboard' : '/auth'}>
                Ücretsiz Başla
              </a>
            </Button>
            {!(user && isProUser(user)) && (
              <Button
                size="lg"
                className="rounded-xl h-12 px-8 text-white"
                style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                onClick={() => handleUpgrade(isAnnual ? 'pro_yearly' : 'pro_monthly')}
                disabled={loadingPro || loadingStarter}
              >
                {loadingPro
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Yönlendiriliyor…</>
                  : "Pro'ya Geç →"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Güvenli ödeme · PayTR altyapısı · Kart bilgisi saklanmaz
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── page export with Suspense (fixes useSearchParams blank render) ────────────

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
=== END ===

=== FILE: config/pricing.ts ===

export const PRICING = {
    starter: {
        monthly: 399,
        annual: 3990,
        label: 'Başlangıç',
        description: 'Küçük ve orta ölçekli satıcılar için',
    },
    pro: {
        monthly: 799,
        annual: 7990,
        label: 'Profesyonel',
        description: 'Büyük ölçekli ve profesyonel satıcılar için',
    },
    // Backward compatibility — used by protected create-payment route
    proMonthly: 799,
    proYearly: 7990,
    proMonthlyId: 'pro_monthly' as const,
    proYearlyId: 'pro_yearly' as const,
    currency: 'TRY',
    symbol: '₺',
} as const;

export type PlanId = 'pro_monthly' | 'pro_yearly' | 'starter_monthly' | 'starter_yearly';

export function getPlanAmount(planId: PlanId): number {
    if (planId === 'pro_monthly') return PRICING.pro.monthly;
    if (planId === 'pro_yearly') return PRICING.pro.annual;
    if (planId === 'starter_monthly') return PRICING.starter.monthly;
    if (planId === 'starter_yearly') return PRICING.starter.annual;
    return PRICING.pro.monthly;
}

export function getPlanDays(planId: PlanId): number {
    if (planId === 'pro_yearly' || planId === 'starter_yearly') return 365;
    return 30;
}

export const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: PRICING.currency,
        maximumFractionDigits: 0,
    }).format(amount).replace('TRY', '').trim() + PRICING.symbol;
};

export const monthlyLabel = () => `${PRICING.pro.monthly}${PRICING.symbol}/ay`;
export const yearlyLabel = () => `${PRICING.pro.annual}${PRICING.symbol}/yıl`;
=== END ===

=== FILE: config/plans.ts ===
/**
 * Central Plan Configuration — Single Source of Truth
 *
 * ALL plan limits must be read from here.
 * Do NOT hardcode limit numbers anywhere else in the app.
 */

export const PLAN_LIMITS = {
    free: {
        maxProducts: 3,
        maxMarketplaces: 2,
        csvExport: false,
        csvImport: false,
        jsonExport: false,
        proAccounting: false,
        sensitivityAnalysis: false,
        breakEven: false,
        cashflow: false,
        marketplaceComparison: false,
        apiIntegration: false,
        pdfReportMonthly: 0,
        weeklyEmailReport: false,
        prioritySupport: false,
        competitorTracking: false,
    },
    starter: {
        maxProducts: 25,
        maxMarketplaces: 4,
        csvExport: true,
        csvImport: true,
        jsonExport: true,
        proAccounting: true,
        sensitivityAnalysis: true,
        breakEven: true,
        cashflow: false,
        marketplaceComparison: false,
        apiIntegration: false,
        pdfReportMonthly: 5,
        weeklyEmailReport: false,
        prioritySupport: false,
        competitorTracking: false,
    },
    pro: {
        maxProducts: Infinity,
        maxMarketplaces: Infinity,
        csvExport: true,
        csvImport: true,
        jsonExport: true,
        proAccounting: true,
        sensitivityAnalysis: true,
        breakEven: true,
        cashflow: true,
        marketplaceComparison: true,
        apiIntegration: true,
        pdfReportMonthly: Infinity,
        weeklyEmailReport: true,
        prioritySupport: true,
        competitorTracking: true,
    },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

/**
 * Helper to get the limit for a given plan.
 * Defaults to 'free' if plan is undefined or unrecognized.
 */
export function getPlanLimits(plan: string | undefined) {
    if (plan === 'pro' || plan === 'admin') return PLAN_LIMITS.pro;
    if (plan === 'starter') return PLAN_LIMITS.starter;
    return PLAN_LIMITS.free; // Default to free for safety
}
=== END ===

=== FILE: components/shared/upgrade-modal.tsx ===
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Crown, X, Check, Loader2 } from 'lucide-react';
import { PRICING, monthlyLabel } from '@/config/pricing';
import { toast } from 'sonner';
import { useState } from 'react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  'Sinirsiz urun analizi',
  'Hassasiyet analizi',
  'Pazaryeri karsilastirmasi',
  'Nakit akisi tahmini',
  'CSV iceri aktarma',
  'CSV & rapor disari aktarma',
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paytr/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro_monthly' }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        const params = new URLSearchParams({ paymentId: data.paymentId });
        if (data.token) params.set('token', data.token);
        window.location.href = `/basari?${params.toString()}`;
      } else {
        toast.error(data.error || 'Ödeme başlatılamadı.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[UPGRADE-MODAL] Error:', err);
      toast.error(err.message || 'Ödeme başlatılamadı.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1C1917] p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold">Pro&apos;ya Yükselt</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Ücretsiz plan limitine ulaştınız. Pro plana geçiş yaparak tüm özelliklere erişebilirsiniz.
        </p>

        <div className="mt-6 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/12">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Button
            className="w-full rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
            disabled={loading}
            onClick={handleUpgrade}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Yönlendiriliyor…</>
            ) : (
              <>{monthlyLabel()} - Pro&apos;ya Geç</>
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Şimdilik Değil
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Güvenli ödeme PayTR altyapısı ile gerçekleştirilir.
        </p>
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/shared/pro-locked-section.tsx ===
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isProUser } from '@/utils/access';

interface ProLockedSectionProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
    title?: string;
    description?: string;
    minHeight?: string;
}

export function ProLockedSection({
    children,
    fallback,
    blurAmount = 'md',
    title = "Bu Özelliği Açmak İçin Yükseltin",
    description = "Detaylı analizler ve ileri düzey özellikler için PRO plana geçin.",
    minHeight = "300px"
}: ProLockedSectionProps) {
    const { user } = useAuth();
    const router = useRouter();

    if (isProUser(user)) {
        return <>{children}</>;
    }

    // If user is free, show locked state
    const blurClass = {
        sm: 'blur-sm',
        md: 'blur-md',
        lg: 'blur-lg',
        xl: 'blur-xl',
    }[blurAmount];

    return (
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]" style={{ minHeight }}>
            {/* Blurred Content Background */}
            <div className={`absolute inset-0 p-6 opacity-50 pointer-events-none select-none ${blurClass}`}>
                {fallback || children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] p-6 text-center z-10 transition-all hover:bg-background/50">
                <div className="rounded-full bg-primary/10 p-4 mb-4 shadow-sm animate-in zoom-in duration-300">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    {description}
                </p>
                <Button
                    onClick={() => router.push('/pricing')}
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                    size="lg"
                >
                    Pro'ya Yükselt
                </Button>
            </div>
        </div>
    );
}
=== END ===
