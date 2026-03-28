'use client';

import { Crown, Info, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { buttonVariants } from '@/components/ui/button';

export function ProStatusCard() {
  const { user } = useAuth();

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
          Tüm özelliklere erişmek ve sınırları kaldırmak için Pro&apos;ya geçin.
        </p>

        <Link
          href="/pricing"
          className={cn(buttonVariants({ size: 'sm' }), 'w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-sm')}
        >
          Pro&apos;ya Geç
        </Link>
      </div>
    );
  }

  // Bitiş tarihi ve Kalan Gün hesapla
  let expireLabel = 'Ayarlanmadı';
  let daysRemaining: number | null = null;
  const renewalLabel = user.proRenewal === true ? 'Otomatik' : 'Manuel';

  if (user.proExpiresAt) {
    const d = new Date(user.proExpiresAt);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      expireLabel = `${day}.${month}.${year}`;

      const diff = d.getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
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
          <PopoverTrigger>
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
        <Link
          href="/pricing"
          className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'flex-1 bg-black/20 border-emerald-700/50 hover:bg-emerald-900/40 text-emerald-200 shadow-sm transition-all h-8 text-xs')}
        >
          Planı Yönet
        </Link>
      </div>
    </div>
  );
}
