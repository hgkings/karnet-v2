'use client';

import { useAuth } from '@/contexts/auth-context';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { isProUser } from '@/utils/access';

export function ProStatusCard() {
  const { user } = useAuth();

  if (!user) return null;

  const isPro = isProUser(user);

  if (isPro) {
    const expiresAt = user.proExpiresAt ? new Date(user.proExpiresAt) : null;
    const daysLeft = expiresAt
      ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">KÂRNET PRO</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            AKTİF
          </span>
        </div>
        {expiresAt && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Bitiş:</span>
              <span className="text-foreground font-medium">
                {expiresAt.toLocaleDateString('tr-TR')}
              </span>
            </div>
            {daysLeft !== null && (
              <div className="flex justify-between">
                <span>Kalan:</span>
                <span className="text-foreground font-medium">{daysLeft} gün</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Yenileme:</span>
              <span className="text-foreground font-medium">Manuel</span>
            </div>
          </div>
        )}
        <Link
          href="/billing"
          className="block w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
        >
          Planı Yönet
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/billing"
      className="block rounded-2xl p-3.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
      style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.12)' }}
    >
      <p className="text-amber-400 font-semibold text-sm mb-1">Pro&apos;ya Yükselt</p>
      <p className="text-muted-foreground text-xs mb-3">Tüm özelliklere eriş</p>
      <div
        className="w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
      >
        Planları Gör
      </div>
    </Link>
  );
}
