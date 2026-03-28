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
