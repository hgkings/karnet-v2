=== FILE: app/page.tsx ===
'use client';

import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { MarketplaceCards } from '@/components/landing/marketplace-cards';
import { QuickCalc } from '@/components/landing/quick-calc';
import { Features } from '@/components/landing/features';
import { ComparisonTable } from '@/components/landing/comparison-table';
import { TrustCards } from '@/components/landing/trust-cards';
import { HowItWorks } from '@/components/landing/how-it-works';
import { BenefitsList } from '@/components/landing/benefits-list';
import { StatsSection } from '@/components/landing/stats-section';
import { Testimonials } from '@/components/landing/testimonials';
import { TrustStrip } from '@/components/landing/trust-strip';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Header />

      <main>
        <Hero />
        <SocialProofBar />
        <MarketplaceCards />
        <QuickCalc />
        <Features />
        <ComparisonTable />
        <TrustCards />
        <HowItWorks />
        <BenefitsList />
        <StatsSection />
        <Testimonials />
        <TrustStrip />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
=== END ===

=== FILE: components/landing/header.tsx ===
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { KarnetLogo } from '@/components/shared/KarnetLogo';

export function Header() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Özellikler' },
    { href: '#how-it-works', label: 'Nasıl Çalışır?' },
    { href: '/pricing', label: 'Fiyatlandırma' },
    { href: '/demo', label: 'Demo' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[rgba(12,10,9,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <KarnetLogo size={36} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-[rgba(255,255,255,0.5)] hover:text-white rounded-xl hover:bg-white/5 transition-all duration-150 animated-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="h-9 px-4 rounded-xl font-medium btn-shine shadow-sm text-white"
                style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
              >
                Panele Git
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-medium text-[rgba(255,255,255,0.5)] hover:text-white">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl font-medium btn-shine shadow-sm text-white hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-[1px] transition-all"
                  style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                >
                  Ücretsiz Başla
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0C0A09] border-[rgba(255,255,255,0.06)]">
              <SheetHeader className="text-left pb-2">
                <KarnetLogo size={36} />
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-3 border-t border-[rgba(255,255,255,0.06)]" />
                {user ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl btn-shine text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                      Panele Git
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/auth" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl border-[rgba(255,255,255,0.06)]">Giriş Yap</Button>
                    </Link>
                    <Link href="/auth" onClick={() => setOpen(false)}>
                      <Button className="w-full rounded-xl btn-shine text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                        Ücretsiz Başla
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
=== END ===

=== FILE: components/landing/hero.tsx ===
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';

const fadeUp: Record<string, any> = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-32 hero-gradient">
      {/* Decorative amber glow orb */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.12), transparent 70%)' }}
        />
        <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full bg-amber-500/8 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-[200px] w-[400px] rounded-full bg-amber-600/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left: Content */}
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">

            {/* Badge */}
            <motion.div
              custom={0} initial="hidden" animate="visible" variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Yeni: Trendyol & Hepsiburada API Entegrasyonu
            </motion.div>

            {/* H1 */}
            <motion.h1
              custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1] mb-6 text-foreground"
              style={{ letterSpacing: '-0.5px' }}
            >
              Satıyorsun ama{' '}
              <span style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                kazanıyor musun?
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="mb-8 text-lg text-[rgba(255,255,255,0.5)] leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Pazaryeri komisyonları, kargo maliyetleri, iade kayıpları... Hepsini görünür kıl, kontrolü ele al.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
            >
              <Link href={user ? '/dashboard' : '/auth'}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-amber-500/30 btn-shine transition-all duration-300 gap-2 text-white hover:shadow-xl hover:-translate-y-[1px]"
                  style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                >
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-xl gap-2 transition-all duration-300 border-[rgba(255,255,255,0.06)] hover:bg-white/5"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Nasıl Çalışır?
                </Button>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-sm text-[rgba(255,255,255,0.5)]"
            >
              {[
                { icon: '🔒', text: 'Kredi kartı gerekmez' },
                { icon: '👥', text: '5.000+ satıcı' },
                { icon: '⭐', text: 'Ücretsiz plan sonsuza kadar' },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:block relative"
          >
            <div className="relative animate-float">
              {/* Main card */}
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm shadow-2xl shadow-black/50 p-6 max-w-sm ml-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-[rgba(255,255,255,0.5)] font-medium uppercase tracking-wider">Analiz Sonucu</p>
                    <p className="text-base font-semibold mt-0.5">Bluetooth Kulaklık</p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-400">
                    Risk: Orta
                  </span>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Satış Fiyatı', value: '₺349', color: 'text-foreground' },
                    { label: 'Toplam Maliyet', value: '₺287', color: 'text-foreground' },
                    { label: 'Net Kâr', value: '₺62', color: 'text-emerald-400 font-bold' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-3 text-center">
                      <p className="text-[10px] text-[rgba(255,255,255,0.3)] mb-1">{m.label}</p>
                      <p className={`text-sm font-bold tabular-nums ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Margin bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[rgba(255,255,255,0.5)]">Kâr Marjı</span>
                    <span className="text-xs font-bold text-emerald-400">%17.8</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full w-[18%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="space-y-2">
                  {[
                    { label: 'Komisyon (%22)', value: '₺76.78' },
                    { label: 'Kargo', value: '₺24.90' },
                    { label: 'KDV (%18)', value: '₺53.14' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-[rgba(255,255,255,0.5)]">{row.label}</span>
                      <span className="font-medium text-red-400">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating risk badge */}
              <div
                className="absolute -top-4 -left-8 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5 shadow-xl shadow-black/40"
                style={{ animationDelay: '1.5s' }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-red-500/12 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400">Dikkat!</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.3)]">Marj kritik seviyede</p>
                  </div>
                </div>
              </div>

              {/* Floating profit badge */}
              <div className="absolute -bottom-4 -right-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5 shadow-xl shadow-black/40">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/12 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[rgba(255,255,255,0.3)]">Aylık Tahmini</p>
                    <p className="text-xs font-bold text-emerald-400">+₺48.250</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/social-proof-bar.tsx ===
'use client';

export function SocialProofBar() {
  const marketplaces = [
    { name: 'Trendyol', color: '#F27A1A' },
    { name: 'Hepsiburada', color: '#FF6000' },
    { name: 'n11', color: '#7D2B8B' },
    { name: 'Amazon TR', color: '#FF9900' },
  ];

  const items = [...marketplaces, ...marketplaces, ...marketplaces, ...marketplaces];

  return (
    <div className="border-y border-[rgba(255,255,255,0.06)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[rgba(255,255,255,0.3)] mb-6">
          Türkiye&apos;nin önde gelen pazaryerlerini destekler
        </p>
        <div className="marquee-container">
          <div className="marquee-track gap-8">
            {items.map((mp, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 shrink-0 px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0 opacity-40"
                  style={{ backgroundColor: mp.color }}
                />
                <span className="text-sm font-semibold text-[rgba(255,255,255,0.15)] whitespace-nowrap">
                  {mp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
=== END ===

=== FILE: components/landing/marketplace-cards.tsx ===
'use client';

const marketplaces = [
  {
    emoji: '🟠',
    name: 'Trendyol',
    desc: "Türkiye'nin en büyük pazaryeri. Komisyon, servis bedeli ve KDV dahil tam analiz.",
    badge: 'En Popüler',
  },
  {
    emoji: '🔵',
    name: 'Hepsiburada',
    desc: 'İşlem bedeli ve hizmet bedeli dahil gerçek kârlılık analizi.',
    badge: null,
  },
  {
    emoji: '🟣',
    name: 'n11',
    desc: 'Pazarlama ve pazaryeri hizmet bedelleri dahil net kâr hesaplama.',
    badge: null,
  },
  {
    emoji: '🟡',
    name: 'Amazon TR',
    desc: 'Referral fee ve fiyat dilimi bazlı komisyon hesaplama.',
    badge: null,
  },
];

export function MarketplaceCards() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#FBBF24' }}>
            Entegrasyonlar
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" style={{ letterSpacing: '-0.5px' }}>
            Desteklenen Pazaryerleri
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-base max-w-2xl mx-auto">
            Tüm büyük pazaryerlerinde kârlılığınızı hesaplayın
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {marketplaces.map((mp) => (
            <div
              key={mp.name}
              className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:scale-[1.02] hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 cursor-default"
            >
              {mp.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/12 text-amber-400">
                  {mp.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{mp.emoji}</div>
              <h3 className="font-bold text-foreground mb-2">{mp.name}</h3>
              <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">{mp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/quick-calc.tsx ===
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export function QuickCalc() {
    const [salePrice, setSalePrice] = useState(350);
    const [productCost, setProductCost] = useState(150);
    const [commissionPct, setCommissionPct] = useState(21);

    const result = useMemo(() => {
        if (salePrice <= 0 || productCost <= 0) return null;

        const commission = salePrice * (commissionPct / 100);
        const shippingEstimate = 35;
        const vatEstimate = salePrice * 0.20 * 0.10;
        const netProfit = salePrice - productCost - commission - shippingEstimate - vatEstimate;
        const margin = (netProfit / salePrice) * 100;

        return {
            netProfit: Math.round(netProfit * 100) / 100,
            margin: Math.round(margin * 10) / 10,
        };
    }, [salePrice, productCost, commissionPct]);

    const isProfitable = result && result.netProfit > 0;

    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm mb-4" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Hızlı Hesap</span>
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ letterSpacing: '-0.5px' }}>
                            Şimdi deneyin — hesap gerekmez
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 sm:p-8">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="qc-sale" className="text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">Satış Fiyatı</Label>
                                <div className="relative">
                                    <Input
                                        id="qc-sale"
                                        type="number"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(Number(e.target.value))}
                                        className="h-11 pr-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] rounded-[10px] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                                        min={0}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(255,255,255,0.3)]">₺</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qc-cost" className="text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">Ürün Maliyeti</Label>
                                <div className="relative">
                                    <Input
                                        id="qc-cost"
                                        type="number"
                                        value={productCost}
                                        onChange={(e) => setProductCost(Number(e.target.value))}
                                        className="h-11 pr-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] rounded-[10px] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                                        min={0}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(255,255,255,0.3)]">₺</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qc-comm" className="text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">Komisyon</Label>
                                <div className="relative">
                                    <Input
                                        id="qc-comm"
                                        type="number"
                                        value={commissionPct}
                                        onChange={(e) => setCommissionPct(Number(e.target.value))}
                                        className="h-11 pr-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] rounded-[10px] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                                        min={0}
                                        max={100}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(255,255,255,0.3)]">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isProfitable ? 'bg-emerald-500/12' : 'bg-red-500/12'}`}>
                                        {isProfitable
                                            ? <TrendingUp className="h-6 w-6 text-emerald-400" />
                                            : <TrendingDown className="h-6 w-6 text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-xs text-[rgba(255,255,255,0.5)]">Tahmini Net Kâr (birim)</p>
                                        <p className={`text-2xl font-bold tabular-nums tracking-tight ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                            ₺{result.netProfit.toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                    <div className="hidden sm:block h-10 w-px bg-[rgba(255,255,255,0.06)] mx-2" />
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-[rgba(255,255,255,0.5)]">Marj</p>
                                        <p className={`text-lg font-bold tabular-nums ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                            %{result.margin}
                                        </p>
                                    </div>
                                </div>
                                <Link href="/demo">
                                    <Button size="sm" className="gap-2 rounded-xl shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                                        Detaylı Analiz
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <p className="mt-4 text-center text-[11px] text-[rgba(255,255,255,0.3)]">
                            * Tahmini hesaplama. Kargo (₺35) ve basitleştirilmiş KDV dahildir. Kesin sonuç için detaylı analiz yapın.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
=== END ===

=== FILE: components/landing/features.tsx ===
'use client';

import { motion } from 'framer-motion';
import { Calculator, Shield, BarChart3, Target, FileSpreadsheet, TrendingUp, Crown, Calendar } from 'lucide-react';

const fadeUp: Record<string, any> = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' },
  }),
};

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block mb-3 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
            Özellikler
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4" style={{ letterSpacing: '-0.5px' }}>
            Neden{' '}
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kârnet?
            </span>
          </h2>
          <p className="text-base text-[rgba(255,255,255,0.5)] max-w-lg mx-auto">
            Basit bir kâr hesabından çok daha fazlası.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">

          {/* Large card — col span 2 */}
          <motion.div
            custom={0} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="lg:col-span-2 group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/8 border border-amber-500/12 text-amber-400 transition-colors">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ürün Bazlı Kâr Analizi</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-1">
                &quot;Bu ürün beni kâra mı zarara mı sokuyor?&quot; Artık tahmin etme, hesapla.
              </p>
              <p className="text-[rgba(255,255,255,0.3)] text-xs mb-4">4 pazaryerinde tüm maliyetler dahil net kâr</p>
              <div className="rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.06)] p-4 flex items-end gap-1.5 h-20">
                {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{ height: `${h}%`, background: 'linear-gradient(to top, rgba(217,119,6,0.6), rgba(217,119,6,0.2))' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Risk Analysis */}
          <motion.div
            custom={1} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-red-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-red-500/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/8 border border-red-500/12 text-red-400 transition-colors">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Risk Analizi</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-4">
                Ürün bazında risk puanı ve zarar uyarıları.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Yüksek Risk', color: 'bg-red-500/12 text-red-400', barColor: 'bg-red-500/40', w: '60%' },
                  { label: 'Orta Risk', color: 'bg-amber-500/12 text-amber-400', barColor: 'bg-amber-500/40', w: '35%' },
                  { label: 'Düşük Risk', color: 'bg-emerald-500/12 text-emerald-400', barColor: 'bg-emerald-500/40', w: '5%' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-white/[0.05] flex-1 overflow-hidden">
                      <div className={`h-full rounded-full ${r.barColor}`} style={{ width: r.w }} />
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${r.color}`}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sensitivity */}
          <motion.div
            custom={2} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/8 border border-amber-500/12 text-amber-400 transition-colors">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Önce Test Et, Sonra Uygula</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-1">
                İndirim, kampanya, fiyat değişikliği... Uygulamadan önce kâr etkisini hesapla.
              </p>
              <p className="text-[rgba(255,255,255,0.3)] text-xs mb-3">Riski almadan sonucu gör</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[rgba(255,255,255,0.3)]">
                  <span>Fiyat</span><span className="font-semibold text-foreground">₺349</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="absolute left-0 h-full w-[70%] rounded-full" style={{ background: 'linear-gradient(to right, #D97706, rgba(217,119,6,0.4))' }} />
                  <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-amber-500 border-2 border-background shadow-sm" />
                </div>
                <div className="flex justify-between text-[10px] text-[rgba(255,255,255,0.3)]">
                  <span>₺200</span><span>₺500</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4 Marketplaces */}
          <motion.div
            custom={3} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/8 border border-amber-500/12 text-amber-400 transition-colors">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Finansal Takvim</h3>
            <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-1">
              Hangi gün ne kadar para girecek, ne kadar çıkacak?
            </p>
            <p className="text-[rgba(255,255,255,0.3)] text-xs">Pazaryeri ödeme takvimi ve giderler tek ekranda</p>
          </motion.div>

          {/* KDV — Pro */}
          <motion.div
            custom={4} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="group relative rounded-2xl border border-amber-500/15 bg-[rgba(217,119,6,0.03)] p-6 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/8 border border-amber-500/12 text-amber-400 transition-colors">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              KDV Ayrıştırma
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-amber-500/12 text-amber-400">
                <Crown className="h-2.5 w-2.5" /> PRO
              </span>
            </h3>
            <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">
              Muhasebe modunda KDV dahil/hariç hesaplama ve fatura bazlı analiz.
            </p>
          </motion.div>

          {/* Marketplace comparison — large */}
          <motion.div
            custom={5} initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}
            className="lg:col-span-2 group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/8 border border-emerald-500/12 text-emerald-400 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pazaryeri Karşılaştırması</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-5">
                Aynı ürünü farklı pazaryerlerinde karşılaştırarak en kârlı platformu belirleyin.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Trendyol', value: 72, color: '#D97706' },
                  { name: 'Hepsiburada', value: 58, color: '#B45309' },
                  { name: 'n11', value: 45, color: '#92400E' },
                  { name: 'Amazon TR', value: 83, color: '#F59E0B' },
                ].map((bar) => (
                  <div key={bar.name} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-[rgba(255,255,255,0.5)] shrink-0">{bar.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-8 text-right">%{bar.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/comparison-table.tsx ===
'use client';

import { Check, X, Minus } from 'lucide-react';

const rows = [
  { label: 'Gerçek net kâr',       karnet: 'yes',     excel: 'no',  rakip: 'partial' },
  { label: 'KDV ayrıştırma',       karnet: 'pro',     excel: 'no',  rakip: 'no'      },
  { label: 'İade maliyet analizi', karnet: 'yes',     excel: 'no',  rakip: 'no'      },
  { label: '4 pazaryeri desteği',  karnet: 'yes',     excel: 'no',  rakip: 'partial' },
  { label: 'API entegrasyonu',     karnet: 'pro',     excel: 'no',  rakip: 'no'      },
  { label: 'Risk puanı',           karnet: 'yes',     excel: 'no',  rakip: 'no'      },
  { label: 'Nakit akışı tahmini',  karnet: 'pro',     excel: 'no',  rakip: 'no'      },
  { label: 'PDF rapor',            karnet: 'yes',     excel: 'no',  rakip: 'no'      },
  { label: 'Kurulum gerektirmez',  karnet: 'yes',     excel: 'no',  rakip: 'partial' },
  { label: 'Ücretsiz plan',        karnet: 'yes',     excel: 'yes', rakip: 'no'      },
];

function Cell({ value }: { value: string }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/12">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
        </span>
      </span>
    );
  }
  if (value === 'pro') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/12">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-amber-500/12 text-amber-400 leading-none">PRO</span>
      </span>
    );
  }
  if (value === 'no') {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/12">
          <X className="h-4 w-4 text-red-400" strokeWidth={2.5} />
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center">
      <span className="text-xs font-medium text-amber-400 bg-amber-500/12 px-2 py-1 rounded-lg">
        Kısmi
      </span>
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#FBBF24' }}>
            Karşılaştırma
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" style={{ letterSpacing: '-0.5px' }}>
            Rakiplerle Karşılaştırma
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-base max-w-2xl mx-auto">
            Kârnet neden öne çıkıyor?
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr>
                <th className="text-left px-6 py-5 text-sm font-semibold text-[rgba(255,255,255,0.5)] w-1/2 rounded-tl-2xl">
                  Özellik
                </th>
                <th className="px-6 py-5 bg-amber-500/5 border-x border-amber-500/10 w-[18%] relative">
                  <div className="absolute -top-px left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'linear-gradient(to right, #D97706, #F59E0B)' }} />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-lg leading-none" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                      En İyi Seçim
                    </span>
                    <span className="text-sm font-bold text-amber-400">Kârnet</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-[rgba(255,255,255,0.5)] text-center w-[16%]">
                  Excel
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-[rgba(255,255,255,0.5)] text-center w-[16%] rounded-tr-2xl">
                  Rakip Araçlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className="hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground/80">
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-500/[0.03] border-x border-amber-500/10">
                    <Cell value={row.karnet} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Cell value={row.excel} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Cell value={row.rakip} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/trust-cards.tsx ===
import { Shield, Zap, Target, CreditCard } from 'lucide-react';

export function TrustCards() {
  const cards = [
    {
      icon: Shield,
      title: "Veri Güvenliği",
      desc: "Verileriniz şifreli sunucularda saklanır, asla üçüncü taraflarla paylaşılmaz."
    },
    {
      icon: Zap,
      title: "Anlık Hesaplama",
      desc: "Tüm maliyet kalemleri saniyeler içinde hesaplanır, manuel işlem gerekmez."
    },
    {
      icon: Target,
      title: "Gerçek Veriler",
      desc: "Komisyon, kargo ve KDV oranları güncel pazaryeri verilerine göre hesaplanır."
    },
    {
      icon: CreditCard,
      title: "Kolay Başlangıç",
      desc: "Kredi kartı gerekmez. 5 dakikada hesap aç, hemen analiz yapmaya başla."
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.5px' }}>Güvenli ve Güvenilir Altyapı</h2>
          <p className="text-[rgba(255,255,255,0.5)]">Verileriniz güvende, hesaplamalarınız doğru</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:border-amber-500/20 hover:shadow-md transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="bg-amber-500/8 border border-amber-500/12 text-amber-400 p-3 rounded-xl mb-4">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/how-it-works.tsx ===
'use client';

import { motion } from 'framer-motion';
import { ClipboardList, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: ClipboardList,
    title: 'Ürün Bilgilerini Gir',
    desc: 'Pazaryeri, fiyat, maliyet ve gider bilgilerini girin.',
  },
  {
    number: '2',
    icon: BarChart2,
    title: 'Analiz Et',
    desc: 'Sistem tüm maliyetleri hesaplayarak gerçek kârı ve risk seviyesini belirler.',
  },
  {
    number: '3',
    icon: CheckCircle2,
    title: 'Karar Ver',
    desc: 'Detaylı rapor ve önerilerle stratejik kararlar alın, kârlı ürünleri ölçeklendirin.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block mb-3 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
            Nasıl Çalışır?
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4" style={{ letterSpacing: '-0.5px' }}>
            3 adımda{' '}
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              kârlılığınızı
            </span>{' '}ölçün
          </h2>
          <p className="text-base text-[rgba(255,255,255,0.5)]">
            Daha doğru ticaret yapın, zarar eden ürünleri erken tespit edin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group flex flex-col items-center text-center w-full h-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-8 hover:border-amber-500/30 hover:shadow-md transition-all duration-300"
              >
                {/* Number badge */}
                <span
                  className="text-5xl font-black mb-5 leading-none select-none"
                  style={{ background: 'linear-gradient(to bottom, #D97706, rgba(217,119,6,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-5 transition-all duration-300 bg-amber-500/8 border border-amber-500/12 text-amber-400 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-amber-500 group-hover:text-white">
                  <step.icon className="h-8 w-8 transition-colors duration-300" />
                </div>

                <h3 className="text-lg font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed max-w-[220px]">
                  {step.desc}
                </p>
              </motion.div>

              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] shadow-sm">
                  <ArrowRight className="h-3 w-3 text-[rgba(255,255,255,0.3)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/benefits-list.tsx ===
'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const benefits = [
  'Pazaryeri komisyonu',
  'KDV hesaplaması',
  'İade kaybı tahmini',
  'Reklam maliyeti',
  'Kargo ücreti',
  'Paketleme maliyeti',
  'Diğer giderler',
  'Başa baş noktası analizi',
  'Nakit akışı tahmini',
  'Rakip fiyat analizi (Yakında)',
  'Stok maliyet hesabı',
  'Döviz kuru etkisi',
];

export function BenefitsList() {
  return (
    <section className="py-24 border-y border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block mb-3 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
            Kapsam
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4" style={{ letterSpacing: '-0.5px' }}>
            Hesaplama Neleri{' '}
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              İçeriyor?
            </span>
          </h2>
          <p className="text-base text-[rgba(255,255,255,0.5)]">
            Tüm e-ticaret giderlerinizi tek panelde görün.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {benefits.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all duration-200"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span className="text-sm font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/stats-section.tsx ===
'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Zap, Target } from 'lucide-react';

function useCountUp(target: number, duration: number = 1500, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: 500, suffix: "+", label: "Aktif Satıcı", icon: Users },
    { value: 40, prefix: "%", suffix: "", label: "Ort. Kâr Artışı", icon: TrendingUp },
    { value: 2, suffix: " dk", label: "Analiz Süresi", icon: Zap },
    { value: 8, suffix: "+", label: "Gider Kalemi", icon: Target },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className="py-16 rounded-[2rem] mx-4 max-w-6xl md:mx-auto border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-6 text-center">
            {stats.map((stat, idx) => {
              const count = useCountUp(stat.value, 2000, visible);
              return (
                <div key={idx} className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-amber-500/8 border border-amber-500/12 rounded-2xl mb-2">
                    <stat.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-400 tabular-nums tracking-tight">
                    {stat.prefix}{count}{stat.suffix}
                  </div>
                  <div className="text-sm font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/testimonials.tsx ===
'use client';

import { motion } from 'framer-motion';
import { Star, BadgeCheck } from 'lucide-react';

const testimonials = [
  {
    quote: 'İade ve komisyonu dahil edince aslında zarar ettiğimi gördüm. 3 ürünü listeden çıkardım, kâr %40 arttı.',
    name: 'Emre K.',
    role: 'Trendyol Satıcısı',
    marketplace: 'Trendyol',
    verified: true,
    stars: 5,
  },
  {
    quote: 'Müşterilerime hangi ürünlerde kâr ettiklerini somut verilerle gösterebiliyorum. Profesyonel ve güvenilir.',
    name: 'Seda A.',
    role: 'E-ticaret Danışmanı',
    marketplace: 'Çoklu Pazaryeri',
    verified: true,
    stars: 5,
  },
  {
    quote: 'Excel\'de saatlerce uğraşıyordum. Kârnet ile 2 dakikada aynı sonuca ulaşıyorum. Hatta daha doğru.',
    name: 'Murat T.',
    role: 'Hepsiburada Satıcısı',
    marketplace: 'Hepsiburada',
    verified: false,
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block mb-3 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
            Yorumlar
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4" style={{ letterSpacing: '-0.5px' }}>
            Kullanıcılar Ne Diyor?
          </h2>
          <p className="text-base text-[rgba(255,255,255,0.5)]">
            Kârnet ile kârlılığını artıran satıcıların deneyimleri.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-amber-500/20 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="mb-6 text-[15px] leading-relaxed text-foreground/80 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-400">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {t.name}
                      {t.verified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">{t.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/12 text-amber-400">
                  {t.marketplace}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/trust-strip.tsx ===
'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Clock, Layers, Store, Users } from 'lucide-react';

const stats = [
  { icon: Clock, value: 2, suffix: ' dk', label: 'Ortalama analiz süresi' },
  { icon: Layers, value: 8, suffix: '+', label: 'Hesaplanan gider kalemi' },
  { icon: Store, value: 4, suffix: '', label: 'Desteklenen pazaryeri' },
  { icon: Users, value: 500, suffix: '+', label: 'Aktif satıcı' },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export function TrustStrip() {
  return (
    <section className="py-20 border-y border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/8 border border-amber-500/12 text-amber-400">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black tracking-tight text-foreground mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/faq-section.tsx ===
'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'KDV nasıl hesaplanıyor?',
    a: 'Kârnet, ürün bazında KDV oranını ayrıştırarak net (KDV hariç) ve brüt (KDV dahil) değerleri gösterir. Pro modda satış, alış ve gider bazlı KDV\'leri ayrı ayrı ayarlayabilirsiniz.',
  },
  {
    q: 'İade oranı kârı nasıl etkiliyor?',
    a: 'İade edilen ürünlerde hem satış geliri kaybolur hem de ekstra kargo/operasyon maliyeti oluşur. Kârnet, belirlediğiniz iade oranını aylık satış hacmine uygulayarak gerçek net kârı hesaplar.',
  },
  {
    q: 'Hangi pazaryerleri destekleniyor?',
    a: 'Trendyol, Hepsiburada, N11 ve Amazon Türkiye desteklenmektedir. Her pazaryeri için varsayılan komisyon, iade oranı ve ödeme gecikme süresi otomatik doldurulur.',
  },
  {
    q: 'Ücretsiz plan ile Pro plan arasındaki fark nedir?',
    a: 'Ücretsiz planda 5 ürüne kadar analiz yapabilirsiniz. Pro plan: sınırsız analiz, PRO Muhasebe Modu (detaylı KDV ayrıştırma), PDF rapor indirme, e-posta risk bildirimleri ve öncelikli destek sunar.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Evet. Verileriniz Supabase altyapısında şifreli olarak saklanır. Üçüncü taraflarla paylaşılmaz, reklam amacıyla kullanılmaz. İstediğiniz zaman hesabınızı ve tüm verilerinizi silebilirsiniz.',
  },
  {
    q: 'Hesaplama ne kadar doğru?',
    a: 'Kârnet, girdiğiniz verilere dayalı olarak hesaplama yapar. Komisyon, KDV, kargo, reklam, iade ve diğer giderleri eksiksiz dahil eder. Sonuçlar, girilen verilerin doğruluğu kadar kesindir.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 border-y border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block mb-3 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}>
            SSS
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4" style={{ letterSpacing: '-0.5px' }}>
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-base text-[rgba(255,255,255,0.5)]">
            Merak ettiklerinizi hızlıca yanıtlıyoruz.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-transparent px-5 data-[state=open]:border-amber-500/15 data-[state=open]:bg-amber-500/5 transition-all"
              >
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground/80 hover:no-underline hover:text-amber-400 text-left gap-4 [&[data-state=open]>svg]:text-amber-400">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/landing/cta-section.tsx ===
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart2, Play } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';

export function CTASection() {
  const { user } = useAuth();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-20 text-center shadow-premium-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(217,119,6,0.1), rgba(146,64,14,0.05))',
            border: '1px solid rgba(217,119,6,0.15)',
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Glow blobs */}
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />

          {/* Corner chart icon decoration */}
          <div className="absolute bottom-4 right-6 opacity-[0.05] pointer-events-none select-none">
            <BarChart2 className="h-40 w-40 text-amber-400" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold mb-6 backdrop-blur-sm"
              style={{ background: 'rgba(217,119,6,0.12)', color: '#FBBF24' }}
            >
              Hemen Başla
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground mb-4" style={{ letterSpacing: '-0.5px' }}>
              2 dakikada gerçek{' '}
              <span style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                kârını
              </span>{' '}öğren
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[rgba(255,255,255,0.5)] mb-10">
              Ücretsiz plan ile hemen başla. Kurulum yok, kart bilgisi yok.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={user ? '/analysis/new' : '/auth'}>
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-amber-500/30 text-white hover:shadow-xl hover:-translate-y-[1px] transition-all duration-200 gap-2"
                  style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                >
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth?tab=demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-medium rounded-xl border-[rgba(255,255,255,0.06)] hover:bg-white/5 transition-all duration-200 gap-2"
                >
                  <Play className="h-4 w-4" />
                  Demo İzle
                </Button>
              </Link>
            </div>

            {/* Trust icons */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-[rgba(255,255,255,0.5)]">
              <span>🔒 Güvenli ödeme</span>
              <span>📊 Anlık analiz</span>
              <span>🔐 Veriler şifreli</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
=== END ===

=== FILE: components/layout/footer.tsx ===
'use client';

import Link from 'next/link';
import { Mail, MapPin, User, ShieldCheck } from 'lucide-react';
import { KarnetLogo } from '@/components/shared/KarnetLogo';

const PRODUCT_LINKS = [
  { href: '/pricing', label: 'Fiyatlandırma' },
  { href: '/demo', label: 'Demo' },
  { href: '/auth', label: 'Giriş Yap' },
  { href: '/support', label: 'Destek' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
];

const LEGAL_LINKS = [
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { href: '/kullanim-sartlari', label: 'Kullanım Şartları' },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış' },
  { href: '/iade-politikasi', label: 'İade Politikası' },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <KarnetLogo size={32} className="mb-3" />
              <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                Pazaryeri satıcılarının gerçek kârını görmesini sağlayan analiz platformu.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>PayTR güvencesiyle ödeme</span>
            </div>
          </div>

          {/* Ürün */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Ürün</h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Yasal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Yasal</h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-[rgba(255,255,255,0.5)]">
                <Mail className="h-4 w-4 shrink-0 text-amber-500/70" />
                <a href="mailto:karnet.destek@gmail.com" className="hover:text-white transition-colors">
                  karnet.destek@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.5)]">
                <MapPin className="h-4 w-4 shrink-0 text-amber-500/70 mt-0.5" />
                <span className="leading-relaxed">
                  Konya, Türkiye
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[rgba(255,255,255,0.5)]">
                <User className="h-4 w-4 shrink-0 text-amber-500/70" />
                <span>Süleyman Hilmi İşbilir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgba(255,255,255,0.3)]">
            © {new Date().getFullYear()} Kârnet · PayTR güvencesiyle · Veriler satılmaz
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.3)]">
            Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
=== END ===

=== FILE: components/layout/navbar.tsx ===
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { NotificationDrawer } from '@/components/dashboard/notification-drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { KarnetLogo } from '@/components/shared/KarnetLogo';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(12,10,9,0.85)] backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center">
          <KarnetLogo size={36} />
        </Link>
        <div className="flex flex-1" />

        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="rounded-xl font-medium text-[rgba(255,255,255,0.5)] hover:text-white">Fiyatlandırma</Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="sm" className="rounded-xl font-medium border-[rgba(255,255,255,0.06)]">Giriş Yap</Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="rounded-xl font-medium text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
                  Ücretsiz Başla
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[rgba(255,255,255,0.5)] mr-2 hidden lg:inline-block">
                {user.email}
              </span>
              <NotificationDrawer />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationDrawer />}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0A09] px-4 py-4 md:hidden overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="flex flex-col gap-1.5">
            {user ? (
              <>
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <div className="my-2 border-t border-[rgba(255,255,255,0.06)]" />

                {BOTTOM_NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <Button variant="outline" className="w-full rounded-xl mt-2 border-[rgba(255,255,255,0.06)]" onClick={() => { logout(); setMobileOpen(false); }}>
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start rounded-xl text-[rgba(255,255,255,0.5)] hover:text-white">Fiyatlandırma</Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>Giriş Yap</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
=== END ===
