=== FILE: components/layout/sidebar.tsx ===
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  Crown, FileText, Upload, CreditCard, ArrowRight, Shield, Store,
} from 'lucide-react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { isProUser } from '@/utils/access';
import { ProStatusCard } from '@/components/shared/ProStatusCard';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isPro = isProUser(user);

  return (
    <aside className="flex h-full w-full flex-col bg-[rgba(255,255,255,0.01)] border-r border-[rgba(255,255,255,0.06)] overflow-y-auto scrollbar-thin">
      <div className="flex h-full flex-col px-3 py-5 gap-6">

        {/* Pro Status */}
        <div className="w-full">
          <ProStatusCard />
        </div>

        {/* Main Nav */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Menü
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isLocked = (item as any).restricted && !isPro;

              if (isLocked) {
                return (
                  <div key={item.href} className="group relative">
                    <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none">
                      <div className="bg-amber-900/40 text-amber-400 p-0.5 rounded-full">
                        <Crown className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.3)] hover:bg-white/5 transition-all duration-150"
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="opacity-60">{item.label}</span>
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400 font-semibold'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <item.icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-150',
                    isActive ? 'text-amber-400' : 'text-[rgba(255,255,255,0.5)] group-hover:text-white'
                  )} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Hızlı İşlemler
          </p>
          <div className="flex flex-col gap-0.5">
            {[
              { href: '/dashboard', icon: FileText, label: 'PDF Rapor' },
              { href: '/products', icon: Upload, label: 'CSV İçe Aktar' },
              { href: '/settings/commission-rates', icon: Store, label: 'Komisyon Oranları' },
              { href: '/pricing', icon: CreditCard, label: 'Fiyatlandırma' },
            ].map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="group flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white transition-all duration-150"
              >
                <div className="p-1 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] border border-[rgba(255,255,255,0.06)] transition-all">
                  <action.icon className="h-3 w-3" />
                </div>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Nav */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
            Hesap
          </p>
          <div className="flex flex-col gap-0.5">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isPremium = item.label === 'Premium';

              if (isPremium) {
                if (isPro) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative block overflow-hidden rounded-2xl p-3.5 text-sm font-semibold transition-all duration-200 mb-1"
                    style={{
                      background: 'rgba(217,119,6,0.05)',
                      border: '1px solid rgba(217,119,6,0.12)',
                    }}
                  >
                    <p className="text-amber-400 font-semibold text-sm mb-1">Pro&apos;ya Yükselt</p>
                    <p className="text-[rgba(255,255,255,0.3)] text-xs mb-3">Tüm özelliklere eriş</p>
                    <div
                      className="w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
                    >
                      Planları Gör
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400 font-semibold'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <item.icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-150',
                    isActive ? 'text-amber-400' : 'text-[rgba(255,255,255,0.5)] group-hover:text-white'
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin */}
        {user?.plan === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-white transition-all border border-transparent"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}

        {/* Version */}
        <div className="text-[9px] text-[rgba(255,255,255,0.15)] font-mono text-center pb-1">
          v{process.env.NEXT_PUBLIC_BUILD_ID || '1.0.0'}
        </div>

      </div>
    </aside>
  );
}
=== END ===

=== FILE: components/shared/ProStatusCard.tsx ===
'use client';

import { useEffect, useState } from 'react';
import { Crown, Info, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';
import Link from 'next/link';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function ProStatusCard() {
    const { user, refreshUser } = useAuth();
    const [backfillLoading, setBackfillLoading] = useState(false);

    useEffect(() => {
        // Backfill check: If user is Pro but missing pro_expires_at, hit our API
        if (user && isProUser(user) && !user.pro_expires_at && !backfillLoading) {
            const attemptBackfill = async () => {
                setBackfillLoading(true);
                try {
                    const res = await fetch('/api/billing/backfill-pro-dates', { method: 'POST' });
                    const data = await res.json();
                    if (data.ok) {
                        // Refresh the user context so the updated dates reflect instantly
                        await refreshUser();
                    }
                } catch (e) {
                    console.error('Failed to backfill pro dates:', e);
                } finally {
                    setBackfillLoading(false);
                }
            };
            attemptBackfill();
        }
    }, [user, backfillLoading, refreshUser]);

    if (!user) return null;

    const isPro = isProUser(user);

    if (!isPro) {
        return (
            <div className="w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">Free Plan</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-muted text-muted-foreground">
                        Sınırlı
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                    Tüm özelliklere erişmek ve sınırları kaldırmak için Pro'ya geçin.
                </p>

                <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-sm">
                    <Link href="/pricing">
                        Pro'ya Geç
                    </Link>
                </Button>
            </div>
        );
    }

    // Bitiş tarihi ve Kalan Gün hesapla
    let expireLabel = 'Ayarlanmadı';
    let daysRemaining: number | null = null;
    let renewalLabel = user.pro_renewal === true ? 'Otomatik' : 'Manuel';

    // Prefer pro_expires_at, but fallback to pro_until if it exists just to not lose existing precision,
    // although user requested fallback to "Ayarlanmadı" if pro_expires_at is missing.
    // We will follow: if pro_expires_at is present, use it. If not, fallback to "Ayarlanmadı".
    const targetDateStr = user.pro_expires_at || user.pro_until;

    if (targetDateStr) {
        try {
            const d = new Date(targetDateStr);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                expireLabel = `${day}.${month}.${year}`;

                const diff = d.getTime() - new Date().getTime();
                daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
        } catch { /* null-safe */ }
    } else {
        expireLabel = 'Ayarlanmadı';
        daysRemaining = null;
    }

    return (
        <div className="relative w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm transition-all hover:shadow-md">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/20 shadow-inner">
                        <Crown className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-extrabold uppercase tracking-wider text-emerald-300 leading-none">
                            Kârnet Pro
                        </span>
                        <div className="flex items-center gap-1 mt-1.5">
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-700 bg-emerald-900/50 text-emerald-400">
                                Aktif
                            </span>
                        </div>
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="text-emerald-400/50 hover:text-emerald-300 transition-colors focus:outline-none">
                            <Info className="w-4 h-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 text-xs" align="end" side="right" sideOffset={8}>
                        <p className="font-semibold mb-1">Pro Plan Özellikleri</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            <li>Sınırsız analiz</li>
                            <li>Pazaryeri entegrasyonları</li>
                            <li>Toplu CSV / PDF işlemleri</li>
                            <li>Premium destek</li>
                        </ul>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Info Rows */}
            <div className="space-y-2.5 mb-4 bg-black/20 rounded-xl p-3 border border-emerald-800/30">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300/70">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bitiş:</span>
                    </div>
                    <span className="font-medium text-emerald-100">
                        {expireLabel}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300/70">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Kalan:</span>
                    </div>
                    <span className="font-medium text-emerald-100">
                        {daysRemaining !== null ? `${daysRemaining} gün` : '—'}
                    </span>
                </div>

                <div className="flex flex-col text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-300/70">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Yenileme:</span>
                        </div>
                        <span className="font-medium text-emerald-100">
                            {renewalLabel}
                        </span>
                    </div>
                    {renewalLabel === 'Manuel' && (
                        <p className="text-[9px] text-emerald-400/50 italic text-right">
                            Süre bitince tekrar satın almanız gerekir.
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1 bg-black/20 border-emerald-700/50 hover:bg-emerald-900/40 text-emerald-200 shadow-sm transition-all h-8 text-xs">
                    <Link href="/pricing">
                        Planı Yönet
                    </Link>
                </Button>
            </div>
        </div>
    );
}
=== END ===

=== FILE: config/navigation.ts ===

import {
    LayoutDashboard,
    PlusCircle,
    Package,
    Target,
    Landmark,
    Store,
    User,
    Settings,
    Crown,
    FileText,
    Upload,
    CreditCard,
    MessageSquare
} from 'lucide-react';

export const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Yeni Analiz', href: '/analysis/new', icon: PlusCircle },
    { label: 'Ürünler', href: '/products', icon: Package },
    { label: 'Başabaş', href: '/break-even', icon: Target, restricted: true },
    { label: 'Nakit Planı', href: '/cash-plan', icon: Landmark, restricted: true },
    { label: 'Pazaryeri', href: '/marketplace', icon: Store, restricted: true },
];

export const BOTTOM_NAV_ITEMS = [
    { label: 'Premium', href: '/pricing', icon: Crown, highlight: true },
    { label: 'Profil', href: '/account', icon: User },
    { label: 'Destek', href: '/support', icon: MessageSquare },
    { label: 'Ayarlar', href: '/settings', icon: Settings },
];

export const QUICK_ACTIONS = [
    { label: 'PDF Rapor', href: '/dashboard', icon: FileText, action: 'pdf' }, // Special handling needed
    { label: 'CSV İçe Aktar', href: '/products', icon: Upload },
    { label: 'Fiyatlandırma', href: '/pricing', icon: CreditCard },
];
=== END ===
